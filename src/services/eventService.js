import axios from 'axios';

const API_URL = 'http://localhost:3000/startupark/api/events';

// Get token function (same as your working model)
const getAuthToken = () => {
  return localStorage.getItem('token') || document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
};

// Create axios instance with auth headers
const api = axios.create();

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const eventService = {
  // Create event
  createEvent: async (eventData) => {
    const response = await api.post(API_URL, eventData);
    return response.data;
  },

  // Get all events
  getEvents: async (filters = {}) => {
    const response = await api.get(API_URL, { params: filters });
    return response.data;
  },

  // Get event by ID
  getEvent: async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Register for event
  registerForEvent: async (id) => {
    const response = await api.post(`${API_URL}/${id}/register`);
    return response.data;
  },

  // Get user's events
  getUserEvents: async () => {
    const response = await api.get(`${API_URL}/user/my-events`);
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`${API_URL}/${id}`, eventData);
    return response.data;
  },

  // Start event
  startEvent: async (id) => {
    const response = await api.post(`${API_URL}/${id}/start`);
    return response.data;
  },

  // End event
  endEvent: async (id) => {
    const response = await api.post(`${API_URL}/${id}/end`);
    return response.data;
  },

  // Get attendees
  getAttendees: async (id) => {
    const response = await api.get(`${API_URL}/${id}/attendees`);
    return response.data;
  }
};