import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);

// Plans
export const getPlans = () => api.get('/plans');
export const createPlan = (data) => api.post('/plans', data);
export const updatePlan = (id, data) => api.put(`/plans/${id}`, data);

// Salons
export const getSalons = () => api.get('/salons');
export const createSalon = (data) => api.post('/salons', data);
export const assignPlan = (data) => api.post('/salons/assign-plan', data);
export const getSubscriptionHistory = () => api.get('/salons/subscriptions/history');

// Appointments
export const getAppointments = (params) => api.get('/appointments', { params });
export const getTodayCount = () => api.get('/appointments/today-count');
export const createAppointment = (data) => api.post('/appointments', data);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status });

// Clients
export const getClients = () => api.get('/clients');
export const createClient = (data) => api.post('/clients', data);

// Staff
export const getStaff = () => api.get('/staff');

// Services
export const getServices = () => api.get('/services');

// Attendance
export const checkIn = (data) => api.post('/attendance/check-in', data);
export const getTodayAttendance = () => api.get('/attendance/today');

export default api;
