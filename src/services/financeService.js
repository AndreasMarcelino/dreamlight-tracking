import api from "./api";

export const financeService = {
  getAll: async (params = {}) => {
    const response = await api.get("/finance", { params });
    return response.data;
  },

  getSummary: async (projectId) => {
    const params = projectId ? { project_id: projectId } : {};
    const response = await api.get("/finance/summary", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/finance", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/finance/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/finance/${id}`);
    return response.data;
  },

  getPendingPayroll: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/finance/payroll/pending?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  payCrew: async (milestoneId) => {
    const response = await api.post("/finance/pay-crew", {
      milestone_id: milestoneId,
    });
    return response.data;
  },
};
