import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getIncidents = async (filters = {}) => {
  const response = await api.get('/incidents', { params: filters });
  return response.data;
};

export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (incidentData) => {
  const response = await api.post('/incidents', incidentData);
  return response.data;
};

export const analyzeIncident = async (id) => {
  const response = await api.post(`/incidents/${id}/analyze`);
  return response.data;
};

export const resolveIncident = async (id, resolutionData) => {
  const response = await api.post(`/incidents/${id}/resolve`, resolutionData);
  return response.data;
};

export const getMemoryStatus = async () => {
  const response = await api.get('/memories/status');
  return response.data;
};

export const getAllMemories = async () => {
  const response = await api.get('/memories/all');
  return response.data;
};

export const searchMemories = async (query, serviceFilter = '') => {
  const response = await api.post('/memories/search', { query, serviceFilter });
  return response.data;
};

export const reflectMemories = async (query = '') => {
  const response = await api.post('/memories/reflect', { query });
  return response.data;
};

export const seedDemoData = async () => {
  const response = await api.post('/demo/seed');
  return response.data;
};

export const clearDemoMemories = async () => {
  const response = await api.post('/demo/clear-memories');
  return response.data;
};

export default api;
