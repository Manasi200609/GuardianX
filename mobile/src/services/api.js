import axios from 'axios';

const API_BASE_URL = 'http://10.93.108.205:5000/api/users'; // adjust IP

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ============== AUTH ================= */

export async function signupUser({ name, email, password }) {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    name,
    email,
    password,
  });
  // expect your controller to send { success: true, user, message }
  return response.data;
}

// You don’t have a login route yet in this router,
// so either create one in backend or temporarily skip loginUser
// export const loginUser = (data) => api.post('/login', data);

export async function loginUser({ email, password }) {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return response.data;
}
/* ============ GUARDIAN MODE ============ */

export const toggleGuardianMode = (userId, data) =>
  api.put(`/guardian-mode/${userId}`, data);

/* ================= SOS ================= */

export const triggerSOS = (userId, data) =>
  api.post(`/sos/${userId}`, data);

/* ============ EMERGENCY CONTACTS ============ */

export const saveContacts = (userId, data) =>
  api.put(`/contacts/${userId}`, data); // { emergencyContacts: [...] }

/* ============== GESTURES ================= */

export const saveGesture = (userId, data) =>
  api.put(`/gesture/${userId}`, data); // { gesturePattern: '...' }
