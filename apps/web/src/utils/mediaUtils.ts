const configuredApiUrl = (import.meta.env.VITE_API_URL || 'https://api.fhub.com.vn').trim();

/** Resolve persisted media paths against the API, including older local storage URLs and storage keys. */
export function resolveMediaUrl(url: string | undefined, apiUrl: string): string {
  if (!url?.trim()) return '';
  let path = url.trim();
  if (/^(blob:|data:)/i.test(path)) return path;

  // Normalize local dev paths
  path = path.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):(?:5004|5121)\/(?:api\/content\/media\/|storage\/)?/i, '/api/content/media/');
  path = path.replace(/^\/storage\//, '/api/content/media/');

  // Normalize fhub.com.vn URLs
  path = path.replace(/^https?:\/\/(?:www\.|ops\.|admin\.|api\.)?fhub\.com\.vn(\/api\/content\/media\/)/i, '$1');

  // External absolute URLs (e.g. Google avatars or external CDNs) pass through
  if (/^https?:\/\//i.test(path)) return path;

  // If path is a relative storage key like "articles/..." or "questions/...", prepend leading slash
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Ensure /api/content/media prefix exists for any resource key
  if (!path.startsWith('/api/content/media/')) {
    path = '/api/content/media' + path;
  }

  const base = (apiUrl || 'https://api.fhub.com.vn').trim().replace(/\/+$/, '').replace(/\/api$/, '');
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
