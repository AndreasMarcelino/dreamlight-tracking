import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { formatRupiah, formatDateShort, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// ✨ NEW: Import all new components
import EpisodeModal from '../../components/modals/EpisodeModal';
import MilestoneAssignModal from '../../components/modals/MilestoneAssignModal';
import FileUpload from '../../components/uploads/FileUpload';
import api from '../../services/api';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // ✨ NEW: Modal states for all new features
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      // FIX: response.data sudah berisi object { success, data }
      // projectService.getById sudah return response.data
      setProject(response.data); // Ambil dari response.data langsung
    } catch (error) {
      toast.error('Gagal memuat detail project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✨ NEW: Episode handlers
  const handleAddEpisode = () => {
    setEditingEpisode(null);
    setShowEpisodeModal(true);
  };

  const handleEditEpisode = (episode) => {
    setEditingEpisode(episode);
    setShowEpisodeModal(true);
  };

  const handleDeleteEpisode = async (episodeId, episodeTitle) => {
    const result = await Swal.fire({
      title: 'Delete Episode?',
      html: `Are you sure you want to delete <strong>${episodeTitle}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/episodes/${episodeId}`);
        toast.success('Episode deleted successfully');
        fetchProject();
      } catch (error) {
        toast.error('Failed to delete episode');
      }
    }
  };

  // ✨ NEW: Milestone handlers
  const handleAssignCrew = () => {
    setEditingMilestone(null);
    setShowAssignModal(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setShowAssignModal(true);
  };

  const handleDeleteMilestone = async (milestoneId, crewName) => {
    const result = await Swal.fire({
      title: 'Remove Assignment?',
      html: `Remove <strong>${crewName}</strong> from this task?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/milestones/${milestoneId}`);
        toast.success('Assignment removed');
        fetchProject();
      } catch (error) {
        toast.error('Failed to remove assignment');
      }
    }
  };

  // ✨ NEW: File upload handler
  const handleFileUploaded = (uploadedFile) => {
    toast.success(`${uploadedFile.file_name} uploaded successfully!`);
    fetchProject(); // Refresh to show new file
  };

  const handleDownloadFile = async (assetId, fileName) => {
    try {
      const response = await api.get(`/assets/${assetId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDeleteFile = async (assetId, fileName) => {
    const result = await Swal.fire({
      title: 'Delete File?',
      html: `Are you sure you want to delete <strong>${fileName}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/assets/${assetId}`);
        toast.success('File deleted');
        fetchProject();
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-folder-open text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-bold text-gray-600 mb-2">Project Not Found</h3>
        <Link to="/projects" className="text-indigo-600 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
    { id: 'crew', label: 'Crew & Tasks', icon: 'fa-users', count: project.milestones?.length || 0 },
    { id: 'episodes', label: 'Episodes', icon: 'fa-film', count: project.episodes?.length || 0, show: project.type === 'Series' },
    { id: 'files', label: 'Files', icon: 'fa-folder-open', count: project.assets?.length || 0 },
    { id: 'finance', label: 'Finance', icon: 'fa-wallet' },
  ].filter(tab => tab.show !== false);

  const progressStats = project.progress_stats || {
    'Pre-Production': 0,
    'Production': 0,
    'Post-Production': 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        
        <div className="relative z-10">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition group"
          >
            <i className="fa-solid fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
            Back to Projects
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.global_status)} bg-opacity-20 backdrop-blur-sm border border-white/20`}>
                  {project.global_status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-sm border border-white/20">
                  {project.type}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-3">{project.title}</h1>
              
              <p className="text-purple-200 text-lg mb-6 max-w-3xl">
                {project.description || 'No description available'}
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-purple-200">
                  <i className="fa-solid fa-building"></i>
                  <span>{project.client_name || 'Internal'}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200">
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>{formatDateShort(project.start_date)} - {formatDateShort(project.deadline_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200">
                  <i className="fa-solid fa-wallet"></i>
                  <span>{formatRupiah(project.total_budget_plan)}</span>
                </div>
              </div>
            </div>

            <Link
              to={`/projects/${id}/edit`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              Edit Project
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(progressStats).map(([phase, percentage]) => (
          <div key={phase} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">{phase}</span>
              <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  phase === 'Pre-Production' ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' :
                  phase === 'Production' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-blue-400 to-blue-600'
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
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'crew' && (
          <CrewTab 
            project={project} 
            onAssignCrew={handleAssignCrew}
            onEditMilestone={handleEditMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        )}
        {activeTab === 'episodes' && (
          <EpisodesTab 
            project={project}
            onAddEpisode={handleAddEpisode}
            onEditEpisode={handleEditEpisode}
            onDeleteEpisode={handleDeleteEpisode}
          />
        )}
        {activeTab === 'files' && (
          <FilesTab 
            project={project}
            onFileUploaded={handleFileUploaded}
            onDownloadFile={handleDownloadFile}
            onDeleteFile={handleDeleteFile}
          />
        )}
        {activeTab === 'finance' && <FinanceTab project={project} />}
      </div>

      {/* ✨ NEW: Modals */}
      {showEpisodeModal && (
        <EpisodeModal
          isOpen={showEpisodeModal}
          onClose={() => {
            setShowEpisodeModal(false);
            setEditingEpisode(null);
          }}
          projectId={project.id}
          episode={editingEpisode}
          onSuccess={() => {
            fetchProject();
            setShowEpisodeModal(false);
            setEditingEpisode(null);
          }}
        />
      )}

      {showAssignModal && (
        <MilestoneAssignModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setEditingMilestone(null);
          }}
          projectId={project.id}
          milestone={editingMilestone}
          onSuccess={() => {
            fetchProject();
            setShowAssignModal(false);
            setEditingMilestone(null);
          }}
        />
      )}
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

// Overview Tab Component
function OverviewTab({ project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Project Description */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-align-left text-indigo-600"></i>
            Project Description
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {project.description || 'No detailed description available for this project.'}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-calendar-days text-indigo-600"></i>
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-600">Start Date</span>
              <span className="text-gray-800 font-bold">{formatDateShort(project.start_date)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-600">Deadline</span>
              <span className="text-gray-800 font-bold">{formatDateShort(project.deadline_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-6">
        {/* Financial Summary */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-lg text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-coins"></i>
            Financial
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Budget Plan</p>
              <p className="text-2xl font-bold">{formatRupiah(project.total_budget_plan)}</p>
            </div>
            <div className="border-t border-emerald-400/30 pt-4">
              <p className="text-emerald-100 text-sm mb-1">Target Income</p>
              <p className="text-2xl font-bold">{formatRupiah(project.target_income)}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Tasks</span>
              <span className="font-bold text-gray-800">{project.milestones?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Episodes</span>
              <span className="font-bold text-gray-800">{project.episodes?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Files</span>
              <span className="font-bold text-gray-800">{project.assets?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✨ NEW: Crew Tab with full integration
function CrewTab({ project, onAssignCrew, onEditMilestone, onDeleteMilestone }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Team Members & Tasks</h3>
        <button 
          onClick={onAssignCrew}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <i className="fa-solid fa-user-plus"></i>
          Assign Crew
        </button>
      </div>

      {project.milestones && project.milestones.length > 0 ? (
        <div className="space-y-3">
          {project.milestones.map((milestone) => (
            <div key={milestone.id} className="p-5 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shrink-0">
                    {milestone.user?.name?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-800">{milestone.user?.name || 'Unknown'}</p>
                      {milestone.episode && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                          Ep {milestone.episode.episode_number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {milestone.task_name} • {milestone.phase_category}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(milestone.work_status)}`}>
                        {milestone.work_status}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatRupiah(milestone.honor_amount)}
                      </span>
                      {milestone.payment_status === 'Paid' && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded flex items-center gap-1">
                          <i className="fa-solid fa-check-circle"></i>
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditMilestone(milestone)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    onClick={() => onDeleteMilestone(milestone.id, milestone.user?.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <i className="fa-solid fa-users-slash text-5xl mb-4 opacity-30"></i>
          <p className="text-lg mb-2">No crew members assigned yet</p>
          <p className="text-sm">Click "Assign Crew" to add team members</p>
        </div>
      )}
    </div>
  );
}

// ✨ NEW: Episodes Tab with full integration
function EpisodesTab({ project, onAddEpisode, onEditEpisode, onDeleteEpisode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Episodes</h3>
        <button 
          onClick={onAddEpisode}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          Add Episode
        </button>
      </div>

      {project.episodes && project.episodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.episodes.map((episode) => (
            <div key={episode.id} className="p-5 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition group relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-gray-800">#{episode.episode_number}</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(episode.status)}`}>
                  {episode.status}
                </span>
              </div>
              <p className="font-semibold text-gray-700 mb-2 line-clamp-2 min-h-[3rem]">{episode.title}</p>
              {episode.synopsis && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{episode.synopsis}</p>
              )}
              {episode.airing_date && (
                <p className="text-xs text-gray-500 mb-3">
                  <i className="fa-solid fa-calendar mr-1"></i>
                  Airing: {formatDateShort(episode.airing_date)}
                </p>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEditEpisode(episode)}
                  className="flex-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-semibold transition"
                >
                  <i className="fa-solid fa-pen mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => onDeleteEpisode(episode.id, episode.title)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <i className="fa-solid fa-film text-5xl mb-4 opacity-30"></i>
          <p className="text-lg mb-2">No episodes created yet</p>
          <p className="text-sm">Click "Add Episode" to start adding episodes</p>
        </div>
      )}
    </div>
  );
}

// ✨ NEW: Files Tab with full integration including FileUpload component
function FilesTab({ project, onFileUploaded, onDownloadFile, onDeleteFile }) {
  const [selectedCategory, setSelectedCategory] = useState('Master Video');

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-cloud-arrow-up text-indigo-600"></i>
          Upload New File
        </h3>
        
        {/* Category Selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">File Category</label>
          <div className="flex flex-wrap gap-2">
            {['Script', 'Contract', 'Preview Video', 'Master Video', 'Other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ✨ NEW: FileUpload Component */}
        <FileUpload
          projectId={project.id}
          category={selectedCategory}
          acceptedTypes={
            selectedCategory.includes('Video') ? 'video/*' :
            selectedCategory === 'Script' ? '.pdf,.doc,.docx,.txt' :
            selectedCategory === 'Contract' ? '.pdf,.doc,.docx' : '*'
          }
          maxSize={selectedCategory.includes('Video') ? 104857600 : 52428800} // 100MB for videos, 50MB for others
          onUploadSuccess={onFileUploaded}
        />
      </div>

      {/* Files List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Project Files</h3>

        {project.assets && project.assets.length > 0 ? (
          <div className="space-y-3">
            {project.assets.map((asset) => (
              <div key={asset.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition group flex items-center gap-4">
                {/* File Icon */}
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <i className={`fa-solid ${
                    asset.category.includes('Video') ? 'fa-video' :
                    asset.category === 'Script' ? 'fa-file-lines' :
                    asset.category === 'Contract' ? 'fa-file-contract' :
                    'fa-file'
                  } text-blue-600 text-xl`}></i>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{asset.file_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{asset.category}</span>
                    {asset.file_size && (
                      <span className="text-xs text-gray-400">
                        {(asset.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                    {asset.is_public_to_broadcaster && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDownloadFile(asset.id, asset.file_name)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Download"
                  >
                    <i className="fa-solid fa-download"></i>
                  </button>
                  <button
                    onClick={() => onDeleteFile(asset.id, asset.file_name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <i className="fa-solid fa-folder-open text-4xl mb-3 opacity-30"></i>
            <p>No files uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Finance Tab Component
function FinanceTab({ project }) {
  const totalExpense = project.finances
    ?.filter(f => f.type === 'Expense')
    .reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0;

  const totalIncome = project.finances
    ?.filter(f => f.type === 'Income' && f.status === 'Received')
    .reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm mb-1">Total Income</p>
          <p className="text-3xl font-bold">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-white">
          <p className="text-red-100 text-sm mb-1">Total Expense</p>
          <p className="text-3xl font-bold">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Net Balance</p>
          <p className="text-3xl font-bold">{formatRupiah(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
        
        {project.finances && project.finances.length > 0 ? (
          <div className="space-y-3">
            {project.finances.slice(0, 10).map((finance) => (
              <div key={finance.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    finance.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <i className={`fa-solid ${finance.type === 'Income' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{finance.category}</p>
                    <p className="text-sm text-gray-500">{formatDateShort(finance.transaction_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${finance.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {finance.type === 'Income' ? '+' : '-'}{formatRupiah(finance.amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(finance.status)}`}>
                    {finance.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <i className="fa-solid fa-receipt text-4xl mb-3 opacity-30"></i>
            <p>No transactions recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}