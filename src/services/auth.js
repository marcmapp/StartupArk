import api from './api';

export const authService = {
  // Send OTP
  async sendOTP(email) {
    const response = await api.post('/api/mappauth/send-otp', { email });
    return response.data;
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    const response = await api.post('/api/mappauth/verify-otp', { email, otp });
    return response.data;
  },

  // Register user
  async register(userData) {
    const response = await api.post('/api/mappauth/register', userData);
    return response.data;
  },

  // Google login
  async googleLogin(token) {
    const response = await api.post('/api/mappauth/google-login', { token });
    return response.data;
  },

  // Regular login
  async login(credentials) {
    const response = await api.post('/api/mappauth/login', credentials);
    return response.data;
  },

};

// Storage helper
export const storageService = {
  setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  getAuthData() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  },

  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};