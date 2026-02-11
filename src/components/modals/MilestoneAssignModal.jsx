import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import toast from "react-hot-toast";
import { formatNumberInput, parseNumberInput } from "../../utils/formatters";

export default function MilestoneAssignModal({
  isOpen,
  onClose,
  projectId,
  milestone = null,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [crewList, setCrewList] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const honorDisplay = watch("honor_display");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!isOpen) return;

    if (milestone) {
      // Use setTimeout to ensure the form is ready
      setTimeout(() => {
        // Convert to integer first to handle decimal values from database (e.g., 10000.00)
        const honorValue = Math.round(Number(milestone.honor_amount) || 0);
        reset({
          user_id: milestone.user_id,
          episode_id: milestone.episode_id || "",
          task_name: milestone.task_name,
          phase_category: milestone.phase_category,
          honor_display: formatNumberInput(honorValue.toString()),
          honor_amount: honorValue,
        });
      }, 0);
    } else {
      reset({
        user_id: "",
        episode_id: "",
        task_name: "",
        phase_category: "Pre-Production",
        honor_display: "",
        honor_amount: 0,
      });
    }
  }, [isOpen, milestone, reset]);

  useEffect(() => {
    if (honorDisplay) {
      setValue("honor_amount", parseNumberInput(honorDisplay));
    }
  }, [honorDisplay, setValue]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch crew members ASSIGNED to this project only
      const crewResponse = await api.get(`/projects/${projectId}/crew`);
      const assignedCrew = crewResponse.data.data || [];
      // Extract user info from crew assignments
      setCrewList(
        assignedCrew.map((assignment) => assignment.user).filter(Boolean),
      );

      // Fetch project details and episodes if Series
      const projectResponse = await api.get(`/projects/${projectId}`);
      const project = projectResponse.data.data;

      if (project.type === "Series") {
        const episodesResponse = await api.get(
          `/episodes?project_id=${projectId}`,
        );
        setEpisodes(episodesResponse.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        project_id: projectId,
        user_id: parseInt(data.user_id),
        episode_id: data.episode_id ? parseInt(data.episode_id) : null,
        task_name: data.task_name,
        phase_category: data.phase_category,
        honor_amount: data.honor_amount,
      };

      if (milestone) {
        await api.put(`/milestones/${milestone.id}`, payload);
        toast.success("Task assignment updated!");
      } else {
        await api.post("/milestones", payload);
        toast.success("Crew assigned successfully!");
      }

      onSuccess();
      onClose();
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign crew");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInput = (e) => {
    const formatted = formatNumberInput(e.target.value);
    setValue("honor_display", formatted);
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
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-6 rounded-t-3xl">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-user-plus text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {milestone ? "Edit Task Assignment" : "Assign Crew to Task"}
                  </h3>
                  <p className="text-orange-100 text-sm">
                    Task and crew details
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
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Form */}
          {loadingData ? (
            <div className="p-12 text-center">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-orange-600 mb-4"></i>
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Crew Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Assign to Crew <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("user_id", {
                    required: "Please select a crew member",
                  })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.user_id
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  } focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition`}
                >
                  <option value="">Select crew member</option>
                  {crewList.map((crew) => (
                    <option key={crew.id} value={crew.id}>
                      {crew.name} ({crew.email})
                    </option>
                  ))}
                </select>
                {errors.user_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.user_id.message}
                  </p>
                )}
              </div>

              {/* Episode Selection (if Series) */}
              {episodes.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Episode (Optional)
                  </label>
                  <select
                    {...register("episode_id")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
                  >
                    <option value="">General Project Task</option>
                    {episodes.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        Episode {ep.episode_number}: {ep.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Task Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Task / Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("task_name", {
                    required: "Task name is required",
                  })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.task_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  } focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition`}
                  placeholder="e.g. Director, Cinematographer, Editor"
                />
                {errors.task_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.task_name.message}
                  </p>
                )}
              </div>

              {/* Phase Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Production Phase <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Pre-Production", "Production", "Post-Production"].map(
                    (phase) => (
                      <label
                        key={phase}
                        className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition group"
                      >
                        <input
                          type="radio"
                          {...register("phase_category", {
                            required: "Phase is required",
                          })}
                          value={phase}
                          className="sr-only peer"
                        />
                        <div className="flex-1 text-center">
                          <div
                            className={`w-10 h-10 mx-auto rounded-lg bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-orange-50 peer-checked:bg-orange-600 transition`}
                          >
                            <i
                              className={`fa-solid ${
                                phase === "Pre-Production"
                                  ? "fa-pencil"
                                  : phase === "Production"
                                    ? "fa-video"
                                    : "fa-scissors"
                              } text-gray-500 group-hover:text-orange-600 peer-checked:text-white transition`}
                            ></i>
                          </div>
                          <span className="text-xs font-semibold text-gray-700 peer-checked:text-orange-600 transition">
                            {phase.replace("-", " ")}
                          </span>
                        </div>
                        <i className="fa-solid fa-circle-check absolute top-2 right-2 text-transparent peer-checked:text-orange-600 text-lg"></i>
                      </label>
                    ),
                  )}
                </div>
                {errors.phase_category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phase_category.message}
                  </p>
                )}
              </div>

              {/* Honor Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Honor Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    {...register("honor_display", {
                      required: "Honor amount is required",
                    })}
                    onChange={handleNumberInput}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                      errors.honor_display
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    } focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition`}
                    placeholder="5.000.000"
                  />
                  <input
                    type="hidden"
                    {...register("honor_amount", { required: true })}
                  />
                </div>
                {errors.honor_display && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.honor_display.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-check"></i>
                      {milestone ? "Update Assignment" : "Assign Crew"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
