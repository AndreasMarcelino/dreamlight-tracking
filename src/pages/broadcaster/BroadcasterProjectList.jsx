import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../../services/projectService";
import { getStatusColor } from "../../utils/formatters";
import toast from "react-hot-toast";

export default function BroadcasterProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getBroadcasterProjects();
      setProjects(response.data || []);
    } catch (error) {
      toast.error("Gagal memuat data project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchSearch = project.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "all" || project.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getPhaseColor = (phase) => {
    if (phase === "Pre-Production") return "bg-ocean-500";
    if (phase === "Production") return "bg-orange-500";
    return "bg-blue-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-orange-600 mb-4"></i>
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Productions 🎬
              </h1>
              <p className="text-orange-100">
                Track your content production progress
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <i className="fa-solid fa-film text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {projects.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <i className="fa-solid fa-spinner text-blue-200 text-lg"></i>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {projects.filter((p) => p.status === "In Progress").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-emerald-200 text-lg"></i>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {projects.filter((p) => p.status === "Completed").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
                  <i className="fa-solid fa-pause text-amber-200 text-lg"></i>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase">
                    On Hold
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {projects.filter((p) => p.status === "On Hold").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                placeholder="Cari project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
          >
            <option value="all">Semua Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                  {project.type}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-orange-600 transition">
                {project.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {project.description || "No description"}
              </p>

              {/* Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                {project.type === "Series" && (
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-film"></i>
                    {project.episode_count} Episodes
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-user"></i>
                  {project.producer?.name || "N/A"}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 mb-4">
                {Object.entries(project.progress || {}).map(
                  ([phase, percentage]) => (
                    <div key={phase}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-600 font-semibold">
                          {phase.replace("-", " ")}
                        </span>
                        <span className="text-gray-800 font-bold">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPhaseColor(phase)} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to={`/broadcaster/projects/${project.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-200 transition-all transform hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-eye"></i>
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-folder-open text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tidak Ada Project
            </h3>
            <p className="text-gray-500">
              {filterStatus === "all"
                ? "Belum ada project yang dibuat untuk Anda"
                : `Tidak ada project dengan status ${filterStatus}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
