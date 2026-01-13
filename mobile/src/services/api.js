// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://10.227.9.205:5000/api/users'; // your PC IP

console.log('API_BASE_URL at runtime =', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const response = await api.post('/login', {
    email,
    password,
  });
  return response.data; // user document
}

/* ============ GUARDIAN MODE ============ */

export const toggleGuardianMode = (userId, data) =>
  api.put(`/guardian-mode/${userId}`, data);

/* ================= SOS ================= */

export const triggerSOS = (userId, data) =>
  api.post(`/sos/${userId}`, data);

/* ============ EMERGENCY CONTACTS ============ */

export const saveContacts = (userId, payload) =>
  api.put(`/contacts/${userId}`, payload);

export const getContacts = userId =>
  api.get(`/contacts/${userId}`);

/* ============== GESTURES ================= */

export const saveGesture = (userId, data) =>
  api.put(`/gesture/${userId}`, data);
