// utils/imageUrls.js
export const getImageUrl = (key, baseUrl) => {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  if (key.startsWith('/api/smart/file/')) return `${baseUrl}${key}`;
  return `${baseUrl}/api/smart/file/${encodeURIComponent(key)}`;
};