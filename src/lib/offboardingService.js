import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const offboardingService = {
  // Get all offboarding records
  getAll: async () => {
    const response = await api.get('/offboarding');
    return response.data;
  },

  // Get offboarding by employee ID
  getByEmployeeId: async (employeeId) => {
    const response = await api.get(`/offboarding/${employeeId}`);
    return response.data;
  },

  // Start new offboarding process
  start: async (offboardingData) => {
    const response = await api.post('/offboarding/start', offboardingData);
    return response.data;
  },

  // Update offboarding status
  updateStatus: async (employeeId, statusData) => {
    const response = await api.put(`/offboarding/${employeeId}/status`, statusData);
    return response.data;
  },

  // Complete a step
  completeStep: async (employeeId, stepData) => {
    const response = await api.put(`/offboarding/${employeeId}/complete-step`, stepData);
    return response.data;
  },

  // Update step notes
  updateStepNotes: async (employeeId, stepId, notes) => {
    const response = await api.put(`/offboarding/${employeeId}/steps/${stepId}/notes`, { notes });
    return response.data;
  },

  // Add asset
  addAsset: async (employeeId, assetData) => {
    const response = await api.post(`/offboarding/${employeeId}/assets`, assetData);
    return response.data;
  },

  // Return asset
  returnAsset: async (employeeId, assetId, returnData) => {
    const response = await api.put(`/offboarding/${employeeId}/assets/${assetId}/return`, returnData);
    return response.data;
  },

  // Update final settlement
  updateSettlement: async (employeeId, settlementData) => {
    const response = await api.put(`/offboarding/${employeeId}/settlement`, settlementData);
    return response.data;
  },

  // Complete offboarding
  complete: async (employeeId) => {
    const response = await api.put(`/offboarding/${employeeId}/complete`);
    return response.data;
  },

  // Delete offboarding
  delete: async (employeeId) => {
    const response = await api.delete(`/offboarding/${employeeId}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/offboarding/stats');
    return response.data;
  }
};

export default offboardingService;