import axios from 'axios';

// Auth API client for localhost:3115 (Authentication only)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:3115',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Main API client for localhost:4000 (Business logic, roles, gate passes, etc.)
export const mainApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth API debugging
authApi.interceptors.request.use(
  (config) => {
    console.log('� Auth API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Auth API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for auth API debugging
authApi.interceptors.response.use(
  (response) => {
    console.log('✅ Auth API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Auth API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Request interceptor for main API debugging
mainApi.interceptors.request.use(
  (config) => {
    console.log('🚀 Main API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Main API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for main API debugging
mainApi.interceptors.response.use(
  (response) => {
    console.log('✅ Main API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Main API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
