import { translations, phraseTranslations, type SupportedLanguage } from './translations';
import uiTranslations from './uiTranslations.json';

export type TranslationParams = Record<string, string | number | null | undefined>;
type Entry = Partial<Record<SupportedLanguage, string>>;
const catalog: Record<string, Entry> = uiTranslations;
export const LANGUAGE_LOCALES: Record<SupportedLanguage, string> = {
  vi: 'vi-VN', en: 'en-US', ja: 'ja-JP',
};
const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').normalize('NFC').toLowerCase();
export function normalizeLanguage(value: unknown): SupportedLanguage | undefined {
  if (typeof value !== 'string') return undefined;
  const code = value.toLowerCase().split(/[-_]/)[0];
  if (code === 'vi' || code === 'vn') return 'vi';
  if (code === 'ja' || code === 'jp') return 'ja';
  if (code === 'en') return 'en';
  return undefined;
}
const aliases = new Map<string, Entry>();
for (const table of [translations, phraseTranslations]) {
  for (const key of new Set(Object.values(table).flatMap(Object.keys))) {
    const entry: Entry = { vi: table.vi[key], en: table.en[key], ja: table.ja[key] };
    for (const value of [key, ...Object.values(entry)]) {
      if (value && !aliases.has(normalize(value))) aliases.set(normalize(value), entry);
    }
  }
}
for (const [key, entry] of Object.entries(catalog)) {
  for (const value of [key, ...Object.values(entry)]) {
    if (value) aliases.set(normalize(value), { ...aliases.get(normalize(value)), ...entry });
  }
}
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const templates: Array<{ pattern: RegExp; names: string[]; entry: Entry }> = [];
for (const entry of Object.values(catalog)) {
  for (const source of Object.values(entry)) {
    if (!source || !/\{\w+\}/.test(source) || !/[\p{L}]/u.test(source.replace(/\{\w+\}/g, ''))) continue;
    const names: string[] = [];
    let offset = 0;
    let pattern = '^';
    for (const match of source.matchAll(/\{(\w+)\}/g)) {
      pattern += escapeRegex(source.slice(offset, match.index)) + '([\\s\\S]*?)';
      names.push(match[1]);
      offset = match.index + match[0].length;
    }
    pattern += escapeRegex(source.slice(offset)) + '$';
    templates.push({ pattern: new RegExp(pattern, 'iu'), names, entry });
  }
}

/** Translate UI copy only. Content entered by users is rendered unchanged. */
export function translateText(language: SupportedLanguage, keyOrPhrase: string, fallback?: string, params?: TranslationParams): string {
  if (!keyOrPhrase || typeof keyOrPhrase !== 'string') return '';
  const lookup = (text: string) => {
    const key = text.trim();
    return catalog[key]?.[language] || translations[language][key]
      || phraseTranslations[language][key] || aliases.get(normalize(key))?.[language];
  };
  let result = lookup(keyOrPhrase) || (fallback ? lookup(fallback) : undefined);
  // Feedback is sometimes retained in state after an action. Reconstruct its
  // parameters so changing language also updates already-visible feedback.
  if (!result) {
    for (const template of templates) {
      const match = template.pattern.exec(keyOrPhrase);
      if (!match || !template.entry[language]) continue;
      const values = Object.fromEntries(template.names.map((name, i) => [name, match[i + 1]]));
      result = template.entry[language]!.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);
      break;
    }
  }
  result ??= fallback ?? keyOrPhrase;
  return result.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key] ?? '') : placeholder);
}

/** Accept raw API dates so changing language never requires refetching data. */
export function formatLocalizedDate(language: SupportedLanguage, value: string, options?: Intl.DateTimeFormatOptions): string {
  if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return translateText(language, value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(LANGUAGE_LOCALES[language], options);
}

export function formatLocalizedTime(language: SupportedLanguage, value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return translateText(language, value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString(LANGUAGE_LOCALES[language], { hour: '2-digit', minute: '2-digit' });
}
