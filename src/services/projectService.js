import api from './api';

export const projectService = {
  // Get all projects
  getAll: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get single project
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  create: async (data) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Update project
  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Broadcaster specific
  getBroadcasterProjects: async () => {
    const response = await api.get('/projects/broadcaster/my-projects');
    return response.data;
  },

  // Investor specific
  getInvestorProjects: async () => {
    const response = await api.get('/projects/investor/my-investments');
    return response.data;
  },
};
