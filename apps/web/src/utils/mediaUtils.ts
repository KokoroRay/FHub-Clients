/**
 * Normalizes media URLs to use relative `/api/content/media/...` paths
 * ensuring they pass through Vite proxy and production ingress correctly,
 * and fixes any legacy or misconfigured URLs pointing to port 5004 or 5121.
 */
export function normalizeMediaUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;

  // Fix obsolete or misconfigured backend port 5004 (e.g. http://localhost:5004/storage/...)
  if (trimmed.includes(':5004/storage/')) {
    return trimmed.replace(/^https?:\/\/[^/]+:5004\/storage\//, '/api/content/media/');
  }

  // Fix http://localhost:5004/...
  if (trimmed.includes(':5004/')) {
    return trimmed.replace(/^https?:\/\/[^/]+:5004\/(api\/content\/media\/|storage\/)?/, '/api/content/media/');
  }

  // If pointing to full content service port 5121, make it relative
  if (trimmed.includes(':5121/api/content/media/')) {
    return trimmed.replace(/^https?:\/\/[^/]+:5121/, '');
  }

  // If pointing to /storage/ directly, map to /api/content/media/
  if (trimmed.startsWith('/storage/')) {
    return trimmed.replace(/^\/storage\//, '/api/content/media/');
  }

  return trimmed;
}
