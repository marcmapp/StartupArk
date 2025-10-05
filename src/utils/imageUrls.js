// utils/imageUrls.js
export const getImageUrl = (key, baseUrl) => {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  if (key.startsWith('/smart/api/smart/file/')) return `${baseUrl}${key}`;
  return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
};