// utils/imageUrls.js
// Serves all public files directly from Cloudflare R2 public CDN
// No backend proxy needed — files are fetched at CDN speed

const R2_PUBLIC_BASE = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

/**
 * Convert any file key/path/URL into a full R2 public CDN URL
 * @param {string} key - R2 key, old proxy path, blob URL, or full URL
 * @param {string} baseUrl - Ignored (kept for backward compatibility with existing call sites)
 * @returns {string|null} Full public URL or null if no key provided
 */
export const getImageUrl = (key, baseUrl) => {
  if (!key) return null;

  // Blob URLs (local preview before upload) — return as-is
  if (key.startsWith('blob:')) return key;

  // Already a full URL (external link, old full S3 URLs) — return as-is
  if (key.startsWith('http')) return key;

  // Old backend proxy path format — extract the R2 key and build direct URL
  // e.g. /startupark/api/s3/file/startupark%2FuserId%2Flogo%2Ffile.png
  if (key.startsWith('/startupark/api/s3/file/')) {
    const r2Key = decodeURIComponent(key.replace('/startupark/api/s3/file/', ''));
    return `${R2_PUBLIC_BASE}/${r2Key}`;
  }

  // Plain R2 key — build full public CDN URL
  // e.g. startupark/userId/logo/filename.png
  return `${R2_PUBLIC_BASE}/${key}`;
};

/**
 * R2 public base URL — use this when constructing URLs manually
 */
export const R2_BASE_URL = R2_PUBLIC_BASE;

/**
 * Check if a URL is a local blob (not yet uploaded)
 */
export const isBlobUrl = (url) => {
  return url && typeof url === 'string' && url.startsWith('blob:');
};

/**
 * Check if a string is a valid uploaded file key (not blob, not null)
 */
export const isUploadedKey = (key) => {
  return key && typeof key === 'string' && !key.startsWith('blob:');
};