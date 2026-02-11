import { useState, useEffect } from "react";
import {
  formatRupiah,
  formatDateShort,
  getStatusColor,
} from "../../utils/formatters";
import api from "../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function CrewDashboard() {
  const [stats, setStats] = useState({
    pendingPayment: 0,
    receivedPayment: 0,
    activeTaskCount: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("active"); // 'active' or 'history'
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setPage(1); // Reset page when filter changes
  }, [filter]);

  useEffect(() => {
    fetchDashboardData();
  }, [filter, page]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/milestones/crew/my-tasks?view=${filter}&page=${page}&limit=${limit}`,
      );
      setTasks(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error("Gagal memuat data tasks");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus, taskName) => {
    // Show confirmation for submit action
    if (newStatus === "Waiting Approval") {
      const result = await Swal.fire({
        title: "Submit Task?",
        html: `Are you sure you want to submit <strong>${taskName}</strong> for review?<br><br><small class="text-gray-500">This will notify the producer that your task is ready for approval.</small>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Submit for Review",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;
    }

    try {
      await api.patch(`/milestones/${taskId}/status`, {
        work_status: newStatus,
      });
      toast.success(
        newStatus === "Waiting Approval"
          ? "Task submitted for review!"
          : "Status updated!",
      );
      fetchDashboardData();
    } catch (error) {
      toast.error("Gagal update status");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-ocean-500 mb-4"></i>
          <p className="text-gray-500">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Dark Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Workspace 🎬
              </h1>
              <p className="text-slate-300">
                Manage your tasks and track your earnings
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === "active"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Active Tasks
              </button>
              <button
                onClick={() => setFilter("history")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === "history"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-white/70 hover:text-white"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-clock text-orange-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    Pending Payment
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {formatRupiah(stats.pendingPayment)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-emerald-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    Total Earned
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {formatRupiah(stats.receivedPayment)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-list-check text-blue-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    Active Tasks
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.activeTaskCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks && tasks.length > 0 ? (
          <>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateStatus}
                isHistory={filter === "history"}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1} -{" "}
                    {Math.min(page * limit, total)} of {total} tasks
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                    >
                      <i className="fa-solid fa-chevron-left mr-1"></i>
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${
                                page === pageNum
                                  ? "bg-ocean-500 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                    >
                      Next
                      <i className="fa-solid fa-chevron-right ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i
                  className={`fa-solid ${filter === "active" ? "fa-clipboard-check" : "fa-clock-rotate-left"} text-4xl text-gray-300`}
                ></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {filter === "active"
                  ? "No Active Tasks"
                  : "No Completed Tasks Yet"}
              </h3>
              <p className="text-gray-500">
                {filter === "active"
                  ? "You're all caught up! Enjoy your free time 🎉"
                  : "Your completed tasks will appear here"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onUpdateStatus, isHistory }) {
  const getProgressColor = () => {
    if (task.work_status === "Done") return "bg-emerald-500";
    if (task.work_status === "Waiting Approval") return "bg-orange-500";
    if (task.work_status === "In Progress") return "bg-blue-500";
    return "bg-gray-300";
  };

  const getPhaseColor = (phase) => {
    if (phase === "Pre-Production") return "bg-sky-100 text-ocean-600";
    if (phase === "Production") return "bg-orange-100 text-orange-700";
    if (phase === "Post-Production") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const isOverdue =
    task.project?.deadline_date &&
    new Date(task.project.deadline_date) < new Date() &&
    task.work_status !== "Done";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-ocean-200 transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Task Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-xl ${getProgressColor()} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                <i className="fa-solid fa-camera text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {task.task_name}
                  </h3>
                  {task.payment_status === "Paid" && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <i className="fa-solid fa-check-circle"></i>
                      Paid
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-ocean-500">
                    {task.project?.title}
                  </span>
                  {task.episode && (
                    <span className="text-gray-400">
                      {" "}
                      • Episode {task.episode.episode_number}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(task.phase_category)}`}
                  >
                    {task.phase_category}
                  </span>
                  {isOverdue && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      Overdue
                    </span>
                  )}
                  {task.project?.deadline_date && !isHistory && (
                    <span className="text-xs text-gray-500">
                      Due: {formatDateShort(task.project.deadline_date)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Honor Amount */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                Honor Amount
              </span>
              <span className="text-lg font-bold text-gray-800">
                {formatRupiah(task.honor_amount)}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          {!isHistory && (
            <div className="flex flex-col justify-center gap-2 min-w-[160px]">
              {task.work_status === "Pending" && (
                <button
                  onClick={() =>
                    onUpdateStatus(task.id, "In Progress", task.task_name)
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-play"></i>
                  Start Task
                </button>
              )}

              {task.work_status === "In Progress" && (
                <button
                  onClick={() =>
                    onUpdateStatus(task.id, "Waiting Approval", task.task_name)
                  }
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-check"></i>
                  Submit
                </button>
              )}

              {task.work_status === "Waiting Approval" && (
                <div className="bg-orange-50 border-2 border-orange-200 text-orange-700 px-4 py-3 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2">
                  <i className="fa-solid fa-clock animate-pulse"></i>
                  Waiting Review
                </div>
              )}

              {task.work_status === "Done" && (
                <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2">
                  <i className="fa-solid fa-circle-check"></i>
                  Approved
                </div>
              )}

              <span
                className={`text-center text-xs font-semibold ${getStatusColor(task.work_status)} px-3 py-1.5 rounded-lg`}
              >
                {task.work_status}
              </span>
            </div>
          )}

          {isHistory && (
            <div className="flex flex-col justify-center items-center min-w-[160px]">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <i className="fa-solid fa-check text-2xl text-emerald-600"></i>
              </div>
              <span className="text-sm font-semibold text-emerald-600">
                Completed
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {formatDateShort(task.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
