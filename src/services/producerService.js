import api from "./api";

export const producerService = {
  // Get producer dashboard data
  getDashboard: async () => {
    const response = await api.get("/dashboard/producer");
    return response.data;
  },

  // Get pending approvals (tasks waiting for approval)
  getPendingApprovals: async (projectId = null, page = 1, limit = 10) => {
    const params = { page, limit };
    if (projectId) params.project_id = projectId;
    const response = await api.get("/milestones/pending-approvals", { params });
    return response.data;
  },

  // Approve a task submission
  approveTask: async (milestoneId, notes = "") => {
    const response = await api.post(`/milestones/${milestoneId}/approve`, {
      notes,
    });
    return response.data;
  },

  // Reject a task submission
  rejectTask: async (milestoneId, reason) => {
    const response = await api.post(`/milestones/${milestoneId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Get crew assigned to a project (for dropdown)
  getAssignedCrew: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/crew`);
    return response.data;
  },

  // Get all assigned crew for producer's projects
  getAllAssignedCrew: async (page = 1, limit = 10) => {
    const response = await api.get("/dashboard/producer/crew", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get my projects (as producer)
  getMyProjects: async () => {
    const response = await api.get("/projects", {
      params: { my_projects: true },
    });
    return response.data;
  },

  // Pay crew honor
  payCrew: async (milestoneId) => {
    const response = await api.post("/finance/pay-crew", {
      milestone_id: milestoneId,
    });
    return response.data;
  },

  // Get pending payroll for producer's projects
  getPendingPayroll: async (projectId = null) => {
    const params = projectId ? { project_id: projectId } : {};
    const response = await api.get("/finance/payroll/pending", { params });
    return response.data;
  },
};
