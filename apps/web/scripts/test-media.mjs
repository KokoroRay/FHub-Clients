import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { MarkdownManager } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

const source = readFileSync(new URL('../src/utils/mediaUtils.ts', import.meta.url), 'utf8')
  .replace('import.meta.env.VITE_API_URL', "'https://api.fhub.com.vn'");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const target = { exports: {} };
new Function('exports', 'module', compiled)(target.exports, target);
const { resolveMediaUrl, normalizeMediaUrl, validateImage } = target.exports;

test('media paths use the production API rather than the Pages HTML fallback', () => {
  for (const base of ['https://api.fhub.com.vn', 'https://api.fhub.com.vn/api/']) {
    for (const path of [
      '/api/content/media/avatars/1/a.png', '/storage/avatars/1/a.png',
      'http://localhost:5004/storage/avatars/1/a.png',
      'http://localhost:5121/api/content/media/avatars/1/a.png',
      'https://fhub.com.vn/api/content/media/avatars/1/a.png',
    ]) {
      assert.equal(resolveMediaUrl(path, base), 'https://api.fhub.com.vn/api/content/media/avatars/1/a.png');
    }
  }
});

test('development proxy, external images and local previews keep their URLs', () => {
  assert.equal(resolveMediaUrl('/api/content/media/a.png', '/api'), '/api/content/media/a.png');
  assert.equal(resolveMediaUrl('/api/content/media/a.png', ''), '/api/content/media/a.png');
  assert.equal(normalizeMediaUrl('https://cdn.example.org/photo.png'), 'https://cdn.example.org/photo.png');
  assert.equal(normalizeMediaUrl('blob:preview'), 'blob:preview');
  assert.equal(normalizeMediaUrl(undefined), '');
});

test('image upload validates the allowed MIME type and the avatar size limit', () => {
  assert.doesNotThrow(() => validateImage(new File(['image'], 'photo.png', { type: 'image/png' })));
  assert.throws(() => validateImage(new File(['x'], 'bad.svg', { type: 'image/svg+xml' })));
  assert.throws(() => validateImage(new File([], 'empty.png', { type: 'image/png' })));
  assert.throws(() => validateImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }), 5));
});

test('direct article images retain source and description when saved as Markdown', () => {
  const manager = new MarkdownManager({ extensions: [StarterKit, Image] });
  const src = 'https://api.fhub.com.vn/api/content/media/articles/1/image.png';
  const markdown = manager.serialize({ type: 'doc', content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Bài viết với ảnh trực tiếp' }] },
    { type: 'image', attrs: { src, alt: 'Ảnh minh họa' } },
  ] });
  const image = manager.parse(markdown).content.find((node) => node.type === 'image');
  assert.equal(image.attrs.src, src);
  assert.equal(image.attrs.alt, 'Ảnh minh họa');
});

test('upload API returns absolute usable image URLs and rejects unsuccessful responses', async () => {
  const apiSource = readFileSync(new URL('../src/services/api/contentApi.ts', import.meta.url), 'utf8');
  const apiCompiled = ts.transpileModule(apiSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  for (const base of ['', 'https://api.fhub.com.vn']) {
    let success = true;
    const apiTarget = { exports: {} };
    const mockRequire = (name) => {
      if (name === './client') return { apiClient: { post: async (path, data, config) => {
        assert.equal(path, '/api/content/media/upload');
        assert.equal(data.get('resourceType'), 'avatar');
        assert.equal(data.get('file').name, 'photo.png');
        assert.equal(config.timeout, 120000);
        return { data: { success, message: 'Upload rejected', data: { storageKey: 'avatars/1/test image.png' } } };
      } } };
      if (name === '../../utils/mediaUtils') return { normalizeMediaUrl: (path) => resolveMediaUrl(path, base) };
      throw new Error(`Unexpected dependency: ${name}`);
    };
    new Function('require', 'exports', 'module', 'window', apiCompiled)(
      mockRequire, apiTarget.exports, apiTarget, { location: { origin: 'http://localhost:5173' } },
    );
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    const result = await apiTarget.exports.contentMediaApi.uploadMedia(file, 'avatar');
    assert.equal(result.publicUrl, `${base || 'http://localhost:5173'}/api/content/media/avatars/1/test%20image.png`);
    success = false;
    await assert.rejects(() => apiTarget.exports.contentMediaApi.uploadMedia(file, 'avatar'), /Upload rejected/);
  }
});
