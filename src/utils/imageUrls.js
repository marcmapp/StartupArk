// utils/imageUrls.js
export const getImageUrl = (key, baseUrl) => {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  if (key.startsWith('/startupark/api/s3/file/')) return `${baseUrl}${key}`;
  return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(key)}`;
};