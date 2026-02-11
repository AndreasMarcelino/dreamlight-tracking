import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

/**
 * Component untuk manage crew assignment di project
 * Tampil di ProjectDetail page sebagai tab baru
 */
export default function CrewAssignmentManager({
  projectId,
  onAssignmentChange,
}) {
  const [assignedCrew, setAssignedCrew] = useState([]);
  const [availableCrew, setAvailableCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const isMounted = useRef(true);
  const hasShownError = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    hasShownError.current = false;
    fetchCrewData();

    return () => {
      isMounted.current = false;
    };
  }, [projectId]);

  const fetchCrewData = async () => {
    if (!isMounted.current) return;

    setLoading(true);
    hasShownError.current = false;

    try {
      // Fetch both assigned and available crew
      const [assignedRes, availableRes] = await Promise.all([
        api.get(`/projects/${projectId}/crew`),
        api.get(`/projects/${projectId}/crew/available`),
      ]);

      if (!isMounted.current) return;

      setAssignedCrew(assignedRes.data.data || []);
      setAvailableCrew(availableRes.data.data || []);
    } catch (error) {
      if (!isMounted.current || hasShownError.current) return;

      console.error("Failed to fetch crew data:", error);
      hasShownError.current = true;
      toast.error("Failed to load crew data");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleAssignSingle = async (userId) => {
    try {
      await api.post(`/projects/${projectId}/crew`, { user_id: userId });
      toast.success("Crew assigned successfully!");
      fetchCrewData();
      if (onAssignmentChange) onAssignmentChange();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign crew");
    }
  };

  const handleBulkAssign = async (userIds) => {
    try {
      const response = await api.post(`/projects/${projectId}/crew/bulk`, {
        user_ids: userIds,
      });
      toast.success(response.data.message);
      fetchCrewData();
      setShowAddModal(false);
      if (onAssignmentChange) onAssignmentChange();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign crew");
    }
  };

  const handleRemove = async (userId, userName) => {
    const result = await Swal.fire({
      title: "Remove Crew?",
      html: `Remove <strong>${userName}</strong> from this project?<br><small class="text-gray-500">This will prevent them from being assigned new tasks.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/projects/${projectId}/crew/${userId}`);
        toast.success("Crew removed successfully");
        fetchCrewData();
        if (onAssignmentChange) onAssignmentChange();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove crew");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-ocean-500 mb-3"></i>
          <p className="text-gray-500">Loading crew assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Assigned Crew</h3>
          <p className="text-sm text-gray-500 mt-1">
            {assignedCrew.length} crew member(s) assigned to this project
          </p>
        </div>

        {availableCrew.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-ocean-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i>
            Assign Crew
          </button>
        )}
      </div>

      {/* Assigned Crew List */}
      {assignedCrew.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedCrew.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-ocean-300 transition group"
            >
              {/* Crew Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center text-white font-bold shrink-0">
                  {assignment.user?.name?.substring(0, 2).toUpperCase() || "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">
                    {assignment.user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {assignment.user?.email}
                  </p>
                </div>
              </div>

              {/* Role in Project (if specified) */}
              {assignment.role_in_project && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-sky-50 text-ocean-600 text-xs font-semibold rounded-full">
                    {assignment.role_in_project}
                  </span>
                </div>
              )}

              {/* Assignment Info */}
              <div className="text-xs text-gray-500 mb-4">
                <p>
                  <i className="fa-solid fa-user-check mr-1"></i>
                  Assigned by {assignment.assignedBy?.name}
                </p>
                <p>
                  <i className="fa-solid fa-calendar mr-1"></i>
                  {new Date(assignment.assigned_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() =>
                  handleRemove(assignment.user_id, assignment.user?.name)
                }
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-user-xmark"></i>
                Remove from Project
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-users-slash text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            No Crew Assigned
          </h3>
          <p className="text-gray-500 mb-4">
            Assign crew members to this project to enable task assignment
          </p>
          {availableCrew.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <i className="fa-solid fa-user-plus mr-2"></i>
              Assign First Crew
            </button>
          )}
        </div>
      )}

      {/* Add Crew Modal */}
      {showAddModal && (
        <AddCrewModal
          availableCrew={availableCrew}
          onClose={() => setShowAddModal(false)}
          onAssignSingle={handleAssignSingle}
          onAssignBulk={handleBulkAssign}
        />
      )}
    </div>
  );
}

// Modal Component for Adding Crew
function AddCrewModal({
  availableCrew,
  onClose,
  onAssignSingle,
  onAssignBulk,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredCrew = availableCrew.filter(
    (crew) =>
      crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggle = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCrew.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCrew.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one crew member");
      return;
    }

    setLoading(true);
    try {
      if (selectedIds.length === 1) {
        await onAssignSingle(selectedIds[0]);
      } else {
        await onAssignBulk(selectedIds);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-ocean-500 to-ocean-600 p-6 rounded-t-3xl">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Assign Crew to Project
                </h3>
                <p className="text-sky-100 text-sm mt-1">
                  Select crew members to assign ({availableCrew.length}{" "}
                  available)
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search crew by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-ocean-500 focus:ring-4 focus:ring-sky-100 outline-none transition"
                />
              </div>
            </div>

            {/* Select All */}
            {filteredCrew.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">
                  {selectedIds.length} of {filteredCrew.length} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm font-semibold text-ocean-500 hover:text-ocean-600"
                >
                  {selectedIds.length === filteredCrew.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            )}

            {/* Crew List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCrew.length > 0 ? (
                filteredCrew.map((crew) => (
                  <label
                    key={crew.id}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-ocean-300 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(crew.id)}
                      onChange={() => handleToggle(crew.id)}
                      className="w-5 h-5 text-ocean-500 rounded focus:ring-2 focus:ring-ocean-500"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center text-white font-bold shrink-0">
                      {crew.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{crew.name}</p>
                      <p className="text-xs text-gray-500">{crew.email}</p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <i className="fa-solid fa-user-slash text-3xl mb-2 opacity-30"></i>
                  <p>No crew members available</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || loading}
              className="flex-1 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-ocean-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  Assigning...
                </span>
              ) : (
                <>
                  <i className="fa-solid fa-user-check mr-2"></i>
                  Assign {selectedIds.length} Crew
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
