import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  formatRupiah,
  formatDateShort,
  getStatusColor,
} from "../../utils/formatters";
import { producerService } from "../../services/producerService";
import TaskApprovalPanel from "../../components/producer/TaskApprovalPanel";
import AssignedCrewPanel from "../../components/producer/AssignedCrewPanel";
import toast from "react-hot-toast";

export default function ProducerDashboard() {
  const [stats, setStats] = useState({
    myProjects: [],
    totalProjects: 0,
    pendingApprovals: 0,
    pendingPayments: 0,
    totalAssignedCrew: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [showCrewPanel, setShowCrewPanel] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await producerService.getDashboard();
      setStats(response.data);
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
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-ocean-600 mb-4"></i>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "My Projects",
      value: stats.totalProjects,
      icon: "fa-video",
      gradient: "from-ocean-400 to-ocean-600",
      bgColor: "bg-sky-50",
      textColor: "text-ocean-600",
      link: "/projects",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: "fa-clock",
      gradient: "from-amber-400 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      onClick: () => setShowApprovalPanel(true),
      badge: stats.pendingApprovals > 0 ? "Action Required" : null,
    },
    {
      title: "Assigned Crew",
      value: stats.totalAssignedCrew,
      icon: "fa-users",
      gradient: "from-emerald-400 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      onClick: () => setShowCrewPanel(true),
    },
    {
      title: "Pending Payroll",
      value: formatRupiah(stats.pendingPayments),
      icon: "fa-money-bill-wave",
      gradient: "from-rose-400 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      link: "/finance/payroll",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ocean-600 via-ocean-500 to-blue-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome, Producer! 🎬
            </h1>
            <p className="text-sky-100 text-lg">
              Manage your projects and crew tasks
            </p>
          </div>
          <div className="flex gap-3">
            {stats.pendingApprovals > 0 && (
              <button
                onClick={() => setShowApprovalPanel(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg"
              >
                <i className="fa-solid fa-bell"></i>
                {stats.pendingApprovals} Pending Approvals
              </button>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const CardWrapper = card.link
            ? Link
            : card.onClick
              ? "button"
              : "div";
          const cardProps = card.link
            ? { to: card.link }
            : card.onClick
              ? { onClick: card.onClick }
              : {};

          return (
            <CardWrapper
              key={index}
              {...cardProps}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${card.onClick || card.link ? "cursor-pointer" : ""} text-left w-full`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <i
                    className={`fa-solid ${card.icon} text-2xl ${card.textColor}`}
                  ></i>
                </div>
                {card.badge && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                    {card.badge}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {card.value}
              </h3>
              <p className="text-gray-500 text-sm font-medium">{card.title}</p>
            </CardWrapper>
          );
        })}
      </div>

      {/* My Projects */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">My Projects</h2>
              <p className="text-sm text-gray-500 mt-1">
                Projects assigned to you as producer
              </p>
            </div>
            <Link
              to="/projects"
              className="text-ocean-600 hover:text-ocean-600 font-semibold text-sm flex items-center gap-2 group"
            >
              View All
              <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </Link>
          </div>
        </div>

        {stats.myProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 text-left font-semibold">Project</th>
                  <th className="px-6 py-4 text-left font-semibold">Type</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.myProjects.map((project) => {
                  const progress = project.progress_stats || {};
                  const avgProgress = Math.round(
                    ((progress["Pre-Production"] || 0) +
                      (progress["Production"] || 0) +
                      (progress["Post-Production"] || 0)) /
                      3,
                  );

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                            <i className="fa-solid fa-film text-ocean-600"></i>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {project.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {project.episodes?.length || 0} episodes
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            project.type === "Series"
                              ? "bg-sky-100 text-ocean-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {project.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.global_status)}`}
                        >
                          {project.global_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDateShort(project.deadline_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-ocean-500 to-ocean-500 rounded-full transition-all"
                              style={{ width: `${avgProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-600">
                            {avgProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-ocean-600 rounded-lg font-semibold text-sm transition"
                        >
                          <i className="fa-solid fa-eye"></i>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-video text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Projects Assigned
            </h3>
            <p className="text-gray-500">
              You haven't been assigned any projects yet
            </p>
          </div>
        )}
      </div>

      {/* Task Approval Panel Modal */}
      {showApprovalPanel && (
        <TaskApprovalPanel
          isOpen={showApprovalPanel}
          onClose={() => setShowApprovalPanel(false)}
          onApprovalComplete={fetchDashboardData}
        />
      )}

      {/* Assigned Crew Panel Modal */}
      {showCrewPanel && (
        <AssignedCrewPanel
          isOpen={showCrewPanel}
          onClose={() => setShowCrewPanel(false)}
        />
      )}
    </div>
  );
}
