import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { producerService } from "../../services/producerService";
import toast from "react-hot-toast";

export default function AssignedCrewPanel({ isOpen, onClose }) {
  const [crewList, setCrewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("project"); // 'project' or 'crew'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchAssignedCrew(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && page > 1) {
      fetchAssignedCrew(page);
    }
  }, [page]);

  const fetchAssignedCrew = async (pageNum = page) => {
    setLoading(true);
    try {
      const response = await producerService.getAllAssignedCrew(pageNum, limit);
      setCrewList(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch assigned crew:", error);
      toast.error("Failed to load assigned crew");
    } finally {
      setLoading(false);
    }
  };

  // Group by project
  const getGroupedByProject = () => {
    const grouped = {};
    crewList.forEach((assignment) => {
      const projectId = assignment.project?.id;
      const projectTitle = assignment.project?.title || "Unknown Project";
      if (!grouped[projectId]) {
        grouped[projectId] = {
          project: assignment.project,
          crew: [],
        };
      }
      grouped[projectId].crew.push(assignment.user);
    });
    return Object.values(grouped);
  };

  // Group by crew member
  const getGroupedByCrew = () => {
    const grouped = {};
    crewList.forEach((assignment) => {
      const userId = assignment.user?.id;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: assignment.user,
          projects: [],
        };
      }
      grouped[userId].projects.push(assignment.project);
    });
    return Object.values(grouped);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 rounded-t-3xl shrink-0">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-users text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Assigned Crew
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    {crewList.length} crew assignments
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white transition flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Group By Toggle */}
            <div className="relative z-10 mt-4 flex gap-2">
              <button
                onClick={() => setGroupBy("project")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  groupBy === "project"
                    ? "bg-white text-emerald-700"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <i className="fa-solid fa-folder mr-2"></i>
                By Project
              </button>
              <button
                onClick={() => setGroupBy("crew")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  groupBy === "crew"
                    ? "bg-white text-emerald-700"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <i className="fa-solid fa-user mr-2"></i>
                By Crew
              </button>
            </div>

            {/* Decorative */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-emerald-600 mb-4"></i>
                <p className="text-gray-500">Loading crew assignments...</p>
              </div>
            ) : crewList.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-users-slash text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">No crew assigned yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Assign crew members to your projects to see them here
                </p>
              </div>
            ) : groupBy === "project" ? (
              <div className="space-y-6">
                {getGroupedByProject().map((group) => (
                  <div
                    key={group.project?.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gray-50 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-video text-emerald-600"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {group.project?.title || "Unknown Project"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {group.crew.length} crew member
                            {group.crew.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/projects/${group.project?.id}`}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                      >
                        View Project →
                      </Link>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {group.crew.map((crew) => (
                          <div
                            key={crew?.id}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                              {crew?.name?.substring(0, 2).toUpperCase() ||
                                "??"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {crew?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {crew?.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {getGroupedByCrew().map((group) => (
                  <div
                    key={group.user?.id}
                    className="border border-gray-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                        {group.user?.name?.substring(0, 2).toUpperCase() ||
                          "??"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {group.user?.name || "Unknown"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {group.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.projects.map((project) => (
                        <Link
                          key={project?.id}
                          to={`/projects/${project?.id}`}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition"
                        >
                          <i className="fa-solid fa-video mr-1.5"></i>
                          {project?.title || "Unknown"}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Pagination */}
          <div className="p-4 border-t border-gray-100 shrink-0">
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, total)} of {total} assignments
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
