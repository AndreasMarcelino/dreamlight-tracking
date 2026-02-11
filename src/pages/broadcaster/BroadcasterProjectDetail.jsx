import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { projectService } from "../../services/projectService";
import {
  formatRupiah,
  formatDateShort,
  getStatusColor,
} from "../../utils/formatters";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function BroadcasterProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data);
    } catch (error) {
      toast.error("Gagal memuat detail project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (assetId, fileName) => {
    try {
      const response = await api.get(`/assets/${assetId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-orange-600 mb-4"></i>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-folder-open text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-bold text-gray-600 mb-2">
          Project Tidak Ditemukan
        </h3>
        <Link
          to="/broadcaster/projects"
          className="text-orange-600 hover:underline"
        >
          Kembali ke Projects
        </Link>
      </div>
    );
  }

  // Filter files that are public to broadcaster
  const publicAssets = (project.assets || []).filter(
    (asset) => asset.is_public_to_broadcaster,
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-line" },
    {
      id: "episodes",
      label: "Episodes",
      icon: "fa-film",
      count: project.episodes?.length || 0,
      show: project.type === "Series",
    },
    {
      id: "files",
      label: "Files",
      icon: "fa-folder-open",
      count: publicAssets.length,
    },
  ].filter((tab) => tab.show !== false);

  const progressStats = project.progress_stats || {
    "Pre-Production": 0,
    Production: 0,
    "Post-Production": 0,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

        <div className="relative z-10">
          <button
            onClick={() => navigate("/broadcaster/projects")}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition group"
          >
            <i className="fa-solid fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
            Kembali ke Projects
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.global_status)} bg-opacity-20 backdrop-blur-sm border border-white/20`}
                >
                  {project.global_status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-sm border border-white/20">
                  {project.type}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-3">
                {project.title}
              </h1>

              <p className="text-orange-100 text-lg mb-6 max-w-3xl">
                {project.description || "No description available"}
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-orange-100">
                  <i className="fa-solid fa-user-tie"></i>
                  <span>Producer: {project.producer?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-100">
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>
                    {formatDateShort(project.start_date)} -{" "}
                    {formatDateShort(project.deadline_date)}
                  </span>
                </div>
                {project.type === "Series" && (
                  <div className="flex items-center gap-2 text-orange-100">
                    <i className="fa-solid fa-film"></i>
                    <span>{project.episodes?.length || 0} Episodes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(progressStats).map(([phase, percentage]) => (
          <div
            key={phase}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                {phase}
              </span>
              <span className="text-2xl font-bold text-gray-800">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  phase === "Pre-Production"
                    ? "bg-gradient-to-r from-ocean-400 to-ocean-600"
                    : phase === "Production"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600"
                      : "bg-gradient-to-r from-blue-400 to-blue-600"
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-200"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab project={project} />}
        {activeTab === "episodes" && <EpisodesTab project={project} />}
        {activeTab === "files" && (
          <FilesTab assets={publicAssets} onDownload={handleDownloadFile} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-orange-600"></i>
            Informasi Project
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                Type
              </p>
              <p className="text-gray-800 font-bold">{project.type}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                Status
              </p>
              <p className="text-gray-800 font-bold">{project.global_status}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                Start Date
              </p>
              <p className="text-gray-800 font-bold">
                {formatDateShort(project.start_date)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                Deadline
              </p>
              <p className="text-gray-800 font-bold">
                {formatDateShort(project.deadline_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-file-lines text-orange-600"></i>
              Deskripsi
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {project.description}
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Producer Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-tie text-orange-600"></i>
            Producer
          </h3>
          {project.producer ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                {project.producer.name?.substring(0, 2).toUpperCase() || "PR"}
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {project.producer.name}
                </p>
                <p className="text-sm text-gray-500">
                  {project.producer.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No producer assigned</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-simple text-orange-600"></i>
            Quick Stats
          </h3>
          <div className="space-y-3">
            {project.type === "Series" && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-600 font-semibold">
                  <i className="fa-solid fa-film mr-2"></i>Episodes
                </span>
                <span className="font-bold text-blue-700">
                  {project.episodes?.length || 0}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <span className="text-sm text-amber-600 font-semibold">
                <i className="fa-solid fa-folder mr-2"></i>Files
              </span>
              <span className="font-bold text-amber-700">
                {
                  (project.assets || []).filter(
                    (a) => a.is_public_to_broadcaster,
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Episodes Tab Component
function EpisodesTab({ project }) {
  const episodes = project.episodes || [];

  if (episodes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <i className="fa-solid fa-film text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-bold text-gray-600 mb-2">
          Belum Ada Episode
        </h3>
        <p className="text-gray-500">Episode akan muncul di sini</p>
      </div>
    );
  }

  const getPhaseColor = (status) => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "in-progress") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {String(episode.episode_number).padStart(2, "0")}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">
                  {episode.title}
                </h4>
                <p className="text-sm text-gray-500">
                  Episode {episode.episode_number}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(episode.pre_production_status)}`}
              >
                Pre: {episode.pre_production_status || "pending"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(episode.production_status)}`}
              >
                Prod: {episode.production_status || "pending"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(episode.post_production_status)}`}
              >
                Post: {episode.post_production_status || "pending"}
              </span>
            </div>
          </div>

          {/* Episode Progress */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Pre-Production</span>
                <span className="font-bold text-gray-700">
                  {episode.pre_production_progress || 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ocean-500 rounded-full"
                  style={{
                    width: `${episode.pre_production_progress || 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Production</span>
                <span className="font-bold text-gray-700">
                  {episode.production_progress || 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${episode.production_progress || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Post-Production</span>
                <span className="font-bold text-gray-700">
                  {episode.post_production_progress || 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${episode.post_production_progress || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Files Tab Component
function FilesTab({ assets, onDownload }) {
  const getFileIcon = (fileType) => {
    if (fileType?.includes("video")) return "fa-file-video text-ocean-500";
    if (fileType?.includes("audio")) return "fa-file-audio text-pink-500";
    if (fileType?.includes("image")) return "fa-file-image text-blue-500";
    if (fileType?.includes("pdf")) return "fa-file-pdf text-red-500";
    return "fa-file text-gray-500";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      Script: "bg-sky-100 text-ocean-600",
      Contract: "bg-red-100 text-red-700",
      "Preview Video": "bg-sky-100 text-ocean-600",
      "Master Video": "bg-emerald-100 text-emerald-700",
      Other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.Other;
  };

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <i className="fa-solid fa-folder-open text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-bold text-gray-600 mb-2">Belum Ada File</h3>
        <p className="text-gray-500">
          File yang di-share untuk Anda akan muncul di sini
        </p>
      </div>
    );
  }

  // Group by category
  const groupedAssets = {
    scripts: assets.filter((a) => a.category === "Script"),
    contracts: assets.filter((a) => a.category === "Contract"),
    previews: assets.filter((a) => a.category === "Preview Video"),
    masters: assets.filter((a) => a.category === "Master Video"),
    others: assets.filter((a) => a.category === "Other"),
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedAssets).map(([key, files]) => {
        if (files.length === 0) return null;

        const labels = {
          scripts: { title: "Scripts", icon: "fa-file-lines" },
          contracts: { title: "Contracts", icon: "fa-file-contract" },
          previews: { title: "Preview Videos", icon: "fa-video" },
          masters: { title: "Master Videos", icon: "fa-film" },
          others: { title: "Other Files", icon: "fa-folder" },
        };

        return (
          <div
            key={key}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <i
                  className={`fa-solid ${labels[key].icon} text-orange-600`}
                ></i>
                {labels[key].title}
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  {files.length}
                </span>
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {files.map((asset) => (
                <div
                  key={asset.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <i
                        className={`fa-solid ${getFileIcon(asset.file_type)} text-xl`}
                      ></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition">
                        {asset.file_name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatFileSize(asset.file_size)}</span>
                        {asset.episode && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                            Ep. {asset.episode.episode_number}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded ${getCategoryColor(asset.category)}`}
                        >
                          {asset.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDownload(asset.id, asset.file_name)}
                    className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                    title="Download"
                  >
                    <i className="fa-solid fa-download text-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
