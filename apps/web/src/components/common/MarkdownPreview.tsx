import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Copy, Check } from 'lucide-react';
import { normalizeMediaUrl } from '../../utils/mediaUtils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {
  const { t } = useLanguage();
  if (!content || !content.trim()) {
    return (
      <div className={`p-4 text-xs text-slate-400 italic text-center ${className}`}>
        {t('markdown.emptyPreview', 'Chưa có nội dung để hiển thị xem trước. Hãy nhập nội dung ở tab soạn thảo.')}
      </div>
    );
  }

  // Parse lines into blocks
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none space-y-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 ${className}`}>
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>{renderBlock(block, idx)}</React.Fragment>
      ))}
    </div>
  );
};

type Block =
  | { type: 'header'; level: number; text: string }
  | { type: 'codeblock'; language: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string };

function parseMarkdownBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push({
        type: 'codeblock',
        language: language || 'code',
        code: codeLines.join('\n'),
      });
      continue;
    }

    // Horizontal rule
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headers
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      blocks.push({
        type: 'header',
        level: hMatch[1].length,
        text: hMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        text: quoteLines.join('\n'),
      });
      continue;
    }

    // Unordered List
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered List
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Table detection (line contains | and next line has |---)
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(lines[i + 1])) {
      const headers = line
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));
      i += 2; // Skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        const row = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));
        if (row.length > 0) rows.push(row);
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph (accumulate until empty line or special block)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(---|___|\*\*\*)$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: pLines.join('\n'),
      });
    }
  }

  return blocks;
}

// ─── Code Syntax Highlighting Helpers ──────────────────────────────────────────

const KEYWORD_SETS: Record<string, Set<string>> = {
  csharp: new Set([
    'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked',
    'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else',
    'enum', 'event', 'explicit', 'extern', 'finally', 'fixed', 'float', 'for',
    'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock',
    'long', 'namespace', 'new', 'object', 'operator', 'out', 'override', 'params',
    'private', 'protected', 'public', 'readonly', 'record', 'ref', 'return', 'sbyte', 'sealed',
    'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw',
    'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using',
    'var', 'virtual', 'void', 'volatile', 'while', 'async', 'await', 'get', 'set', 'yield',
    'Task', 'List', 'Dictionary', 'Action', 'Func', 'IEnumerable', 'ICollection', 'Nullable', 'Guid'
  ]),
  java: new Set([
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
    'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
    'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
    'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while',
    'record', 'var', 'sealed', 'permits', 'String', 'Integer', 'Double', 'Boolean', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet'
  ]),
  javascript: new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
    'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in',
    'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
    'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'await', 'async', 'implements',
    'interface', 'package', 'private', 'protected', 'public', 'type', 'from', 'as',
    'React', 'FC', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'Promise', 'Array', 'Object', 'Boolean', 'Number', 'String'
  ]),
  python: new Set([
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
    'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
    'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while',
    'with', 'yield', 'self', 'cls', 'print', 'range', 'len', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple'
  ]),
  sql: new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
    'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'LIKE', 'ILIKE', 'EXISTS', 'BETWEEN',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'CONSTRAINT', 'DEFAULT', 'CHECK', 'VIEW', 'DATABASE', 'SCHEMA', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set', 'delete',
    'create', 'table', 'drop', 'alter', 'join', 'inner', 'left', 'right', 'full', 'outer',
    'on', 'group', 'by', 'order', 'having', 'limit', 'offset', 'union', 'all', 'distinct',
    'as', 'and', 'or', 'not', 'in', 'is', 'like', 'ilike', 'exists', 'between',
    'case', 'when', 'then', 'else', 'end', 'index', 'primary', 'key', 'foreign', 'references',
    'constraint', 'default', 'check', 'view', 'database', 'schema', 'count', 'sum', 'avg', 'min', 'max'
  ]),
  go: new Set([
    'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough',
    'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range',
    'return', 'select', 'struct', 'switch', 'type', 'var', 'iota',
    'string', 'int', 'int64', 'bool', 'byte', 'error', 'make', 'new', 'append', 'len', 'cap',
  ]),
  cpp: new Set([
    'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default',
    'delete', 'do', 'double', 'else', 'enum', 'explicit', 'export', 'extern', 'float',
    'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new',
    'operator', 'private', 'protected', 'public', 'register', 'return', 'short', 'signed',
    'sizeof', 'static', 'struct', 'switch', 'template', 'this', 'throw', 'try',
    'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
    'volatile', 'wchar_t', 'while', 'nullptr', 'constexpr', 'include', 'std', 'vector', 'string'
  ]),
};

const LITERALS = new Set([
  'true', 'false', 'null', 'undefined', 'nil', 'True', 'False', 'None', 'NULL'
]);

function normalizeLanguage(lang: string): string {
  const l = (lang || '').toLowerCase().trim();
  if (['cs', 'csharp', 'dotnet', 'c#'].includes(l)) return 'csharp';
  if (['java', 'kt', 'kotlin'].includes(l)) return 'java';
  if (['js', 'jsx', 'javascript', 'mjs', 'cjs'].includes(l)) return 'javascript';
  if (['ts', 'tsx', 'typescript'].includes(l)) return 'javascript';
  if (['py', 'python'].includes(l)) return 'python';
  if (['sql', 'psql', 'mysql', 'sqlite'].includes(l)) return 'sql';
  if (['go', 'golang'].includes(l)) return 'go';
  if (['c', 'cpp', 'c++', 'cc', 'h', 'hpp'].includes(l)) return 'cpp';
  if (['sh', 'bash', 'zsh', 'shell', 'ps1', 'powershell'].includes(l)) return 'bash';
  if (['html', 'htm', 'xml', 'svg'].includes(l)) return 'html';
  if (['css', 'scss', 'sass', 'less'].includes(l)) return 'css';
  if (['json'].includes(l)) return 'json';
  return 'csharp';
}

function highlightLine(line: string, normLang: string): React.ReactNode[] {
  if (!line) return ['\u00A0'];

  const nodes: React.ReactNode[] = [];
  // Tokenizer regex matching strings, comments, numbers, identifiers, symbols, and whitespaces
  const tokenRegex = /(\/\/[^\r\n]*|#[^\r\n]*|--[^\r\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|[A-Za-z_$][A-Za-z0-9_$]*|[^\s\w]+|\s+)/g;

  let match: RegExpExecArray | null;
  let key = 0;
  const keywordSet = KEYWORD_SETS[normLang] || KEYWORD_SETS.csharp;

  while ((match = tokenRegex.exec(line)) !== null) {
    const token = match[0];
    key++;

    // Comments
    if (
      token.startsWith('//') ||
      (token.startsWith('#') && (normLang === 'python' || normLang === 'bash')) ||
      (token.startsWith('--') && normLang === 'sql')
    ) {
      nodes.push(
        <span key={key} className="text-slate-400 italic">
          {token}
        </span>
      );
      continue;
    }

    // Strings
    if (
      (token.startsWith('"') && token.endsWith('"') && token.length >= 2) ||
      (token.startsWith("'") && token.endsWith("'") && token.length >= 2) ||
      (token.startsWith('`') && token.endsWith('`') && token.length >= 2)
    ) {
      nodes.push(
        <span key={key} className="text-emerald-300">
          {token}
        </span>
      );
      continue;
    }

    // Numbers
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      nodes.push(
        <span key={key} className="text-amber-300">
          {token}
        </span>
      );
      continue;
    }

    // Literals (true, false, null, None, etc.)
    if (LITERALS.has(token)) {
      nodes.push(
        <span key={key} className="text-rose-400 font-semibold">
          {token}
        </span>
      );
      continue;
    }

    // Keywords
    if (keywordSet.has(token)) {
      nodes.push(
        <span key={key} className="text-purple-400 font-semibold">
          {token}
        </span>
      );
      continue;
    }

    // Capitalized types or PascalCase identifiers
    if (/^[A-Z][a-zA-Z0-9_$]*$/.test(token)) {
      nodes.push(
        <span key={key} className="text-cyan-300 font-medium">
          {token}
        </span>
      );
      continue;
    }

    // Operators and special punctuation
    if (/^[=<>!&|^~?:;.,()[\]{}]+$/.test(token)) {
      nodes.push(
        <span key={key} className="text-slate-400">
          {token}
        </span>
      );
      continue;
    }

    // Plain text or whitespace
    nodes.push(<span key={key} className="text-slate-100">{token}</span>);
  }

  return nodes.length > 0 ? nodes : [line];
}

const CodeBlockRenderer: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normLang = normalizeLanguage(language);
  const lines = code.split(/\r?\n/);
  const hasMultipleLines = lines.length > 1;

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0F172A] border border-slate-800 my-3 text-xs font-mono shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#090D16] border-b border-slate-800/80 text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="font-semibold text-blue-400 lowercase ml-1 tracking-wide">
            {language || 'code'}
          </span>
          <span className="text-[10px] text-slate-500">({lines.length} {t('dòng')})</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px]"
          title={t('common.copyCode', 'Sao chép code')}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? t('common.copied', 'Đã chép') : t('common.copy', 'Sao chép')}</span>
        </button>
      </div>

      <div className="flex text-xs leading-relaxed overflow-x-auto">
        {/* Line numbers column */}
        {hasMultipleLines && (
          <div className="select-none py-3 pl-3 pr-2.5 text-right text-slate-600 bg-[#0B1120] border-r border-slate-800/70 text-[11px] font-mono leading-relaxed">
            {lines.map((_, i) => (
              <div key={i} className="min-h-[1.5em]">{i + 1}</div>
            ))}
          </div>
        )}
        {/* Highlighted code column */}
        <pre className="p-3 overflow-x-auto leading-relaxed flex-1 font-mono text-slate-100">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="min-h-[1.5em] whitespace-pre">
                {highlightLine(line, normLang)}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case 'header': {
      if (block.level === 1) {
        return (
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 mt-4">
            {renderInline(block.text)}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-0.5 mt-3">
            {renderInline(block.text)}
          </h2>
        );
      }
      return (
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
          {renderInline(block.text)}
        </h3>
      );
    }
    case 'codeblock':
      return <CodeBlockRenderer language={block.language} code={block.code} />;
    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-[#0076D1] pl-3 py-1 my-2 bg-blue-50/40 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 italic rounded-r-lg">
          {renderInline(block.text)}
        </blockquote>
      );
    case 'ul':
      return (
        <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">
          {block.items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">
          {block.items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                {block.headers.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-bold text-slate-700 dark:text-slate-200">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'hr':
      return <hr className="my-3 border-slate-200 dark:border-slate-800" />;
    case 'paragraph':
      return (
        <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
          {renderInline(block.text)}
        </p>
      );
    default:
      return null;
  }
}

// Inline formatting: Bold, Italic, Strikethrough, Inline Code, Links, Images
function renderInline(text: string): React.ReactNode {
  // Regex tokenization for inline formatting
  // Matches `code`, **bold**, *italic*, ~~strike~~, [text](url), ![alt](url)
  const pattern = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Image: ![alt](url)
    if (part.startsWith('![') && part.includes('](')) {
      const match = part.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        return (
          <img
            key={index}
            src={normalizeMediaUrl(match[2])}
            alt={match[1]}
            loading="lazy"
            decoding="async"
            className="block h-auto max-w-full max-h-[640px] mx-auto my-6 rounded-xl border border-slate-200 dark:border-slate-700 object-contain"
          />
        );
      }
    }

    // Link: [text](url)
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0076D1] underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
          >
            {match[1]}
          </a>
        );
      }
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-mono text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length > 3) {
      return (
        <del key={index} className="line-through text-slate-400">
          {part.slice(2, -2)}
        </del>
      );
    }

    return <span key={index}>{part}</span>;
  });
}
