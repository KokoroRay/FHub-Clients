const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();

/** Resolve persisted media paths against the API, including older local storage URLs. */
export function resolveMediaUrl(url: string | undefined, apiUrl: string): string {
  if (!url?.trim()) return '';
  let path = url.trim();
  if (/^(blob:|data:)/i.test(path)) return path;
  path = path.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):(?:5004|5121)\/(?:api\/content\/media\/|storage\/)?/i, '/api/content/media/');
  path = path.replace(/^\/storage\//, '/api/content/media/');
  path = path.replace(/^https?:\/\/(?:www\.|ops\.|admin\.)?fhub\.com\.vn(\/api\/content\/media\/)/i, '$1');
  if (!path.startsWith('/api/content/media/')) return path;
  const base = apiUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  return base + path;
}

export function normalizeMediaUrl(url?: string): string {
  return resolveMediaUrl(url, configuredApiUrl);
}

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function validateImage(file: File, maxMB = 10): void {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('Vui lòng chọn ảnh PNG, JPG, WebP hoặc GIF.');
  }
  if (!file.size || file.size > maxMB * 1024 * 1024) {
    throw new Error('Dung lượng ảnh phải lớn hơn 0 và không vượt quá ' + maxMB + 'MB.');
  }
}
