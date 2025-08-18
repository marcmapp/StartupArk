// utils/authHelpers.js
import axios from 'axios';
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) return null;

    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/smart/current-user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token') || document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
};