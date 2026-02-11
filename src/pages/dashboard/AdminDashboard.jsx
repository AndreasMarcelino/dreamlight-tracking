import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  formatRupiah,
  formatDateShort,
  getStatusColor,
} from "../../utils/formatters";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    totalCrew: 0,
    recentProjects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard/admin");
      setStats(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat data dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-ocean-500 mb-4"></i>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: "fa-video",
      gradient: "from-rose-400 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      title: "In Production",
      value: stats.ongoingProjects,
      icon: "fa-clapperboard",
      gradient: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Total Crew",
      value: stats.totalCrew,
      icon: "fa-users",
      gradient: "from-emerald-400 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Efficiency",
      value: "-",
      icon: "fa-chart-line",
      gradient: "from-violet-400 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ocean-500 via-ocean-600 to-ocean-700 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, Admin! 👋
            </h1>
            <p className="text-sky-100 text-lg">
              Here's what's happening with your production house today
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/projects/create"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              New Project
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <i
                  className={`fa-solid ${card.icon} text-2xl ${card.textColor}`}
                ></i>
              </div>
              <div
                className={`px-2 py-1 rounded-lg bg-gradient-to-r ${card.gradient} bg-opacity-10`}
              >
                <i className="fa-solid fa-arrow-up text-xs text-emerald-600"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {card.value}
            </h3>
            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recent Projects
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest production updates
              </p>
            </div>
            <Link
              to="/projects"
              className="text-ocean-500 hover:text-ocean-600 font-semibold text-sm flex items-center gap-2 group"
            >
              View All
              <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-left font-semibold">Project</th>
                <th className="px-6 py-4 text-left font-semibold">Client</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Progress</th>
                <th className="px-6 py-4 text-right font-semibold">Budget</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentProjects && stats.recentProjects.length > 0 ? (
                stats.recentProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-sm">
                            {project.type.substring(0, 1)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 group-hover:text-ocean-500 transition">
                            {project.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {project.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {project.client_name || "Internal"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.global_status)}`}
                      >
                        {project.global_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 w-48">
                        {project.progress_stats &&
                          Object.entries(project.progress_stats).map(
                            ([phase, percentage]) => (
                              <div
                                key={phase}
                                className="flex items-center gap-2"
                              >
                                <span className="text-[9px] text-gray-400 font-bold uppercase w-12 shrink-0">
                                  {phase === "Pre-Production"
                                    ? "Pre"
                                    : phase === "Production"
                                      ? "Prod"
                                      : "Post"}
                                </span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      phase === "Pre-Production"
                                        ? "bg-ocean-500"
                                        : phase === "Production"
                                          ? "bg-orange-500"
                                          : "bg-blue-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-[9px] text-gray-400 font-bold w-8 text-right">
                                  {percentage}%
                                </span>
                              </div>
                            ),
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatRupiah(project.total_budget_plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:border-ocean-500 hover:bg-sky-50 text-gray-400 hover:text-ocean-500 transition"
                      >
                        <i className="fa-solid fa-arrow-right text-sm"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-solid fa-folder-open text-4xl mb-3 opacity-30"></i>
                      <p>No recent projects</p>
                      <Link
                        to="/projects/create"
                        className="mt-4 text-ocean-500 hover:underline font-semibold text-sm"
                      >
                        Create Your First Project
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/projects/create"
          className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all group"
        >
          <i className="fa-solid fa-plus text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 className="text-xl font-bold mb-2">New Project</h3>
          <p className="text-sky-100 text-sm">
            Start tracking a new production
          </p>
        </Link>

        <Link
          to="/finance"
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all group"
        >
          <i className="fa-solid fa-wallet text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 className="text-xl font-bold mb-2">Finance</h3>
          <p className="text-emerald-100 text-sm">Manage budgets and payroll</p>
        </Link>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all group cursor-pointer">
          <i className="fa-solid fa-chart-pie text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 className="text-xl font-bold mb-2">Reports</h3>
          <p className="text-orange-100 text-sm">View analytics and insights</p>
        </div>
      </div>
    </div>
  );
}
