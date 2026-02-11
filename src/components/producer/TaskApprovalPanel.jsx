import { useState, useEffect } from "react";
import { producerService } from "../../services/producerService";
import { formatRupiah, formatDateShort } from "../../utils/formatters";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function TaskApprovalPanel({
  isOpen,
  onClose,
  onApprovalComplete,
}) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPendingApprovals();
    }
  }, [isOpen]);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await producerService.getPendingApprovals();
      setPendingTasks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (task) => {
    const result = await Swal.fire({
      title: "Approve Task?",
      html: `
        <div class="text-left">
          <p><strong>Task:</strong> ${task.task_name}</p>
          <p><strong>Crew:</strong> ${task.user?.name || "Unknown"}</p>
          <p><strong>Honor:</strong> ${formatRupiah(task.honor_amount)}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setProcessingId(task.id);
      try {
        await producerService.approveTask(task.id);
        toast.success(`Task "${task.task_name}" approved!`);
        fetchPendingApprovals();
        onApprovalComplete?.();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to approve task");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (task) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Task?",
      html: `
        <div class="text-left mb-4">
          <p><strong>Task:</strong> ${task.task_name}</p>
          <p><strong>Crew:</strong> ${task.user?.name || "Unknown"}</p>
        </div>
      `,
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Please provide feedback for the crew...",
      inputAttributes: {
        "aria-label": "Reason for rejection",
      },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Reject Task",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return "Please provide a detailed reason (min 10 characters)";
        }
      },
    });

    if (reason) {
      setProcessingId(task.id);
      try {
        await producerService.rejectTask(task.id, reason);
        toast.success(
          `Task "${task.task_name}" rejected. Crew will be notified.`,
        );
        fetchPendingApprovals();
        onApprovalComplete?.();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to reject task");
      } finally {
        setProcessingId(null);
      }
    }
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
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-clipboard-check text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Task Approvals
                  </h3>
                  <p className="text-amber-100 text-sm">
                    {pendingTasks.length} tasks waiting for your review
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

            {/* Decorative */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="py-12 text-center">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-amber-600 mb-4"></i>
                <p className="text-gray-500">Loading pending tasks...</p>
              </div>
            ) : pendingTasks.length > 0 ? (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-amber-200 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Task Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-600 font-bold text-sm">
                              {task.user?.name?.substring(0, 2).toUpperCase() ||
                                "??"}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {task.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {task.user?.email}
                            </p>
                          </div>
                        </div>

                        <h4 className="font-bold text-lg text-gray-800 mb-1">
                          {task.task_name}
                        </h4>

                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                            <i className="fa-solid fa-film mr-1"></i>
                            {task.project?.title || "Unknown Project"}
                          </span>
                          {task.episode && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
                              <i className="fa-solid fa-tv mr-1"></i>
                              Eps {task.episode.episode_number}
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 rounded-lg ${
                              task.phase_category === "Pre-Production"
                                ? "bg-blue-100 text-blue-700"
                                : task.phase_category === "Production"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {task.phase_category}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            <i className="fa-solid fa-money-bill mr-1"></i>
                            {formatRupiah(task.honor_amount)}
                          </span>
                          <span>
                            <i className="fa-solid fa-calendar mr-1"></i>
                            Submitted: {formatDateShort(task.updated_at)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(task)}
                          disabled={processingId === task.id}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-semibold transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {processingId === task.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                          ) : (
                            <i className="fa-solid fa-xmark"></i>
                          )}
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(task)}
                          disabled={processingId === task.id}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-200"
                        >
                          {processingId === task.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                          ) : (
                            <i className="fa-solid fa-check"></i>
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-check-double text-4xl text-gray-300"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-gray-500">
                  No pending task approvals at the moment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
