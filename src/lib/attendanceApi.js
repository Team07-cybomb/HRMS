// src/services/attendanceApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// src/services/attendanceApi.js - Enhanced interceptors
api.interceptors.request.use(
  (config) => {
    // Try multiple token storage locations
    let token = localStorage.getItem('hrms_token');
    
    if (!token) {
      console.warn('No auth token found in hrms_token');
      // You might want to redirect to login here or throw error
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, clearing storage');
      clearToken();
      // Use window.location for hard redirect
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      });
    }
    return Promise.reject(error);
  }
);

const clearToken = () => {
  localStorage.removeItem('hrms_token');
  localStorage.removeItem('hrms_user');
};

export const attendanceApi = {
  // Attendance endpoints
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  getAttendance: (params = {}) => api.get('/attendance', { params }),
  getTodayAttendance: (employeeId) => api.get(`/attendance/today/${employeeId}`),
  getAttendancePhoto: (id, type) => api.get(`/attendance/photo/${id}/${type}`),
  createManualRequest: (data) => api.post('/attendance/manual-request', data),

  // Timesheet endpoints
  getTimesheets: (params = {}) => api.get('/attendance/timesheets', { params }),
  submitTimesheet: (data) => api.post('/attendance/timesheets/submit', data),
  updateTimesheetStatus: (id, data) => api.put(`/attendance/timesheets/${id}/status`, data),

  // Manual request endpoints
  getManualRequests: (params = {}) => api.get('/attendance/manual-requests', { params }),
  getEmployeeManualRequests: (employeeId) => api.get(`/attendance/manual-requests/employee/${employeeId}`),
  approveManualRequest: (id) => api.put(`/attendance/manual-requests/${id}/approve`),
  rejectManualRequest: (id, data) => api.put(`/attendance/manual-requests/${id}/reject`, data),
  updateManualRequest: (id, data) => api.put(`/attendance/manual-requests/${id}`, data),
  deleteManualRequest: (id) => api.delete(`/attendance/manual-requests/${id}`),
};

export default api;