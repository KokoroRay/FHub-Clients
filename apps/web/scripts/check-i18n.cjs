const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const module = { exports: {} };
  const code = ts.transpile(fs.readFileSync(file, 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true });
  vm.runInNewContext(code, { exports: module.exports, module, require: (id) => load(path.resolve(path.dirname(file), id + (id.endsWith('.json') ? '' : '.ts'))) }, { filename: file });
  cache.set(file, module.exports);
  return module.exports;
}
const { translateText: t, normalizeLanguage, formatLocalizedDate, formatLocalizedTime } = load('src/context/translate.ts');
const { translations, phraseTranslations } = load('src/context/translations.ts');
const catalog = load('src/context/uiTranslations.json');
const langs = ['vi', 'en', 'ja'];
const placeholders = (text) => [...new Set(text.match(/\{\w+\}/g) || [])].sort().join();
for (const [key, values] of Object.entries(catalog)) {
  for (const lang of langs) {
    assert.ok(values[lang]?.trim(), `${key}: missing ${lang}`);
    assert.equal(placeholders(values[lang]), placeholders(values.vi), `${key}: changed ${lang} placeholders`);
    assert.ok(!['undefined', '未定義'].includes(values[lang]), `${key}: invalid ${lang} copy`);
  }
}
assert.equal(normalizeLanguage('VN'), 'vi');
assert.equal(normalizeLanguage('JP'), 'ja');
assert.equal(normalizeLanguage('en-US'), 'en');
assert.equal(normalizeLanguage('invalid'), undefined);
assert.equal(t('en', 'Tạo Thẻ Ngữ Nghĩa Mới'), 'Create New Semantic Tag');
assert.equal(t('ja', 'Lưu Thẻ'), 'タグを保存');
assert.equal(t('en', 'missing.key', 'Lưu Thẻ'), 'Save Tag');
assert.equal(t('vi', 'Save Tag'), 'Lưu Thẻ');
assert.equal(t('en', '  lưu thẻ  '), 'Save Tag');
assert.equal(t('en', 'Thẻ "{p0}" đã được tạo thành công!', undefined, { p0: '$& <tag>' }), 'Tag "$& <tag>" created successfully!');
assert.equal(t('ja', 'Tag "my-tag" created successfully!'), 'タグ「my-tag」を作成しました。');
assert.equal(t('en', 'unknown.key', ''), '');
assert.equal(t('en', 'Đây là nội dung tự nhập không thuộc bản dịch.'), 'Đây là nội dung tự nhập không thuộc bản dịch.');
assert.equal(formatLocalizedDate('ja', '2026-10-29'), '2026/10/29');
assert.equal(formatLocalizedDate('en', '2026-10-29'), '10/29/2026');
assert.equal(formatLocalizedDate('en', 'Vừa xong'), t('en', 'Vừa xong'));
assert.equal(formatLocalizedTime('ja', 'invalid-date'), 'invalid-date');

const failures = [];
let calls = 0;
function checkFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fail = (node, reason) => failures.push(`${file}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1} ${reason}`);
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(sf) === 't') {
      calls++;
      const [key, fallback] = node.arguments;
      if (!key) fail(node, 'Empty translation call');
      for (let scope = node.parent; scope; scope = scope.parent) {
        if (ts.isArrowFunction(scope) && scope.parameters.some(parameter => parameter.name.getText(sf) === 't')) fail(node, 'Translator is shadowed by a callback parameter');
      }
      if (key && ts.isStringLiteral(key)) {
        const fallbackText = fallback && ts.isStringLiteral(fallback) ? fallback.text : undefined;
        for (const lang of langs) {
          const result = t(lang, key.text, fallbackText);
          const known = translations[lang][key.text] || phraseTranslations[lang][key.text] || catalog[key.text]?.[lang];
          if (!known && result === (fallbackText ?? key.text)) fail(node, `Missing ${lang} translation: ${key.text}`);
        }
      }
    }
    // Human-facing literal JSX must use t(). Native language names are deliberate.
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      const nativeLanguageNames = ['🇻🇳 Tiếng Việt', '🇺🇸 English', '🇯🇵 日本語'];
      if (/[A-Za-zăâđêôơưĂÂĐÊÔƠƯà-ỹ]{2}/.test(text) && !nativeLanguageNames.includes(text)) fail(node, `Hard-coded JSX: ${text}`);
    }
    if (ts.isJsxAttribute(node) && ['title','placeholder','aria-label','alt'].includes(node.name.getText(sf)) && node.initializer && ts.isStringLiteral(node.initializer) && /[A-Za-zăâđêôơưĂÂĐÊÔƠƯà-ỹ]{2}/.test(node.initializer.text)) fail(node, `Hard-coded ${node.name.getText(sf)}: ${node.initializer.text}`);
    ts.forEachChild(node, visit);
  }
  visit(sf);
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.tsx')) checkFile(file);
  }
}
walk('src');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`i18n checks passed: ${Object.keys(catalog).length} entries × 3 languages, ${calls} translation calls, interpolation, language aliases and date formatting.`);
