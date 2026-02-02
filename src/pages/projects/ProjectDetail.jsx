import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { formatRupiah, formatDateShort, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data);
    } catch (error) {
      toast.error('Gagal memuat detail project');
      console.error(error);
    } finally {
      setLoading(false);
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
        {activeTab === 'crew' && <CrewTab project={project} />}
        {activeTab === 'episodes' && <EpisodesTab project={project} />}
        {activeTab === 'files' && <FilesTab project={project} />}
      </div>
    </div>
  );
}

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

// Crew Tab Component
function CrewTab({ project }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Team Members</h3>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
          <i className="fa-solid fa-user-plus"></i>
          Assign Crew
        </button>
      </div>

      {project.milestones && project.milestones.length > 0 ? (
        <div className="space-y-3">
          {project.milestones.map((milestone) => (
            <div key={milestone.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-sm">
                      {milestone.user?.name?.substring(0, 2).toUpperCase() || '??'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{milestone.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{milestone.task_name} • {milestone.phase_category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(milestone.work_status)}`}>
                    {milestone.work_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <i className="fa-solid fa-users-slash text-4xl mb-3 opacity-30"></i>
          <p>No crew members assigned yet</p>
        </div>
      )}
    </div>
  );
}

// Episodes Tab Component
function EpisodesTab({ project }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Episodes</h3>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
          <i className="fa-solid fa-plus"></i>
          Add Episode
        </button>
      </div>

      {project.episodes && project.episodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.episodes.map((episode) => (
            <div key={episode.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-gray-800">#{episode.episode_number}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(episode.status)}`}>
                  {episode.status}
                </span>
              </div>
              <p className="font-semibold text-gray-700 mb-2 line-clamp-2">{episode.title}</p>
              {episode.airing_date && (
                <p className="text-xs text-gray-500">Airing: {formatDateShort(episode.airing_date)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <i className="fa-solid fa-film text-4xl mb-3 opacity-30"></i>
          <p>No episodes created yet</p>
        </div>
      )}
    </div>
  );
}

// Files Tab Component  
function FilesTab({ project }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Project Files</h3>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
          <i className="fa-solid fa-cloud-arrow-up"></i>
          Upload File
        </button>
      </div>

      {project.assets && project.assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.assets.map((asset) => (
            <div key={asset.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-file text-blue-600 text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{asset.file_name}</p>
                  <p className="text-xs text-gray-500">{asset.category}</p>
                </div>
                <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition shrink-0">
                  <i className="fa-solid fa-download text-xs"></i>
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
  );
}