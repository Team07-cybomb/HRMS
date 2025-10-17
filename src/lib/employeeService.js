// services/employeeService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const employeeService = {
  // Get all active employees
  getActiveEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Get all employees
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  }
};

export default employeeService;