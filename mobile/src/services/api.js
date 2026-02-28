// src/services/api.js
import axios from 'axios';

// API Configuration
// For production: Use environment variables
// For development: Update this to your backend URL
// 
// IMPORTANT: Update this based on your setup:
// - Android Emulator: http://10.0.2.2:5000/api/users
// - iOS Simulator: http://localhost:5000/api/users
// - Physical Device: http://YOUR_COMPUTER_IP:5000/api/users
const API_BASE_URL = __DEV__
  ? 'http://10.252.34.205:5000/api/users' // Android emulator (change for iOS/physical device)
  : 'http://10.252.34.205:5000/api/users'; // Production

console.log('API_BASE_URL at runtime =', API_BASE_URL);

export { API_BASE_URL };
 
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
  },
  timeout: 15000, // 15 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });
    return Promise.reject(error);
  }
);

/* ============== AUTH ================= */

export async function signupUser({ name, email, password }) {
  console.log('Calling signupUser with', name, email);
  const response = await api.post('/register', {
    name,
    email,
    password,
  });
  return response.data; // { success, user, ... }
}

export async function loginUser({ email, password }) {
  try {
    console.log('Attempting login to:', API_BASE_URL);
    const response = await api.post('/login', {
      email,
      password,
    });
    return response.data; // user document
  } catch (error) {
    console.error('Login error details:', error.message, error.response?.status, error.response?.data);
    throw error;
  }
}

/* ============ GUARDIAN MODE ============ */

export const toggleGuardianMode = (userId, data) =>
  api.put(`/guardian-mode/${userId}`, data);

/* ================= SOS ================= */

// Matches router.post('/:id/sos', ...) mounted at /api/users
export const triggerSOS = (userId, data) =>
  api.post(`/${userId}/sos`, data);


/* ============ EMERGENCY CONTACTS ============ */

export const saveContacts = (userId, payload) =>
  api.put(`/contacts/${userId}`, payload);

export const getContacts = userId =>
  api.get(`/contacts/${userId}`);

/* ============== GESTURES ================= */

export const saveGesture = (userId, data) =>
  api.put(`/gesture/${userId}`, data);

/* ============== EMERGENCY LOGS ================= */

export const logEmergency = (emergencyData) =>
  axios.post(
    `${API_BASE_URL.replace('/api/users', '/api/emergencies')}`,
    emergencyData,
    {
      headers: {
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
      },
    }
  );

export const getEmergencyLogs = (userId, options = {}) => {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit);
  if (options.status) params.append('status', options.status);
  return axios.get(
    `${API_BASE_URL.replace('/api/users', '/api/emergencies')}/user/${userId}?${params.toString()}`,
    {
      headers: {
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
      },
    }
  );
};