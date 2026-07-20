// src/utils/authHelpers.js
export const getAuthToken = () => localStorage.getItem('token');

export const getUserId = () => {
  // First try direct userId
  const userId = localStorage.getItem('userId');
  if (userId) return userId;

  // Fallback to parsing user object
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user?._id;
    } catch (e) {
      console.error('Failed to parse user:', e);
    }
  }
  return null;
};

export const clearAuth = () => {
  ['token', 'user', 'userId'].forEach(key => localStorage.removeItem(key));
};