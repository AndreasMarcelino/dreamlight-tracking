import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { formatRupiah, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function BroadcasterDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getBroadcasterProjects();
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  });

  const getPhaseColor = (phase) => {
    if (phase === 'Pre-Production') return 'bg-indigo-500';
    if (phase === 'Production') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-orange-600 mb-4"></i>
          <p className="text-gray-500">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Productions 🎬
              </h1>
              <p className="text-orange-100">Track your content production progress</p>
            </div>
            
            {/* Filter Status */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-1 flex gap-1">
              {['all', 'In Progress', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === status
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-film text-orange-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-orange-100 text-xs font-semibold uppercase">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-spinner text-blue-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-orange-100 text-xs font-semibold uppercase">In Progress</p>
                  <p className="text-2xl font-bold text-white">
                    {projects.filter(p => p.status === 'In Progress').length}
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
                  <p className="text-orange-100 text-xs font-semibold uppercase">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {projects.filter(p => p.status === 'Completed').length}
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

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((item) => (
            <ProjectCard key={`${item.project_id}-${item.episode_id || 0}`} project={item} getPhaseColor={getPhaseColor} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-folder-open text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Projects Found</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'You don\'t have any projects yet' 
                : `No ${filterStatus.toLowerCase()} projects`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, getPhaseColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.status)}`}>
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
      <p className="text-sm text-gray-500 mb-4 line-clamp-1">{project.subtitle}</p>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        {Object.entries(project.progress).map(([phase, percentage]) => (
          <div key={phase}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-600 font-semibold">{phase.replace('-', ' ')}</span>
              <span className="text-gray-800 font-bold">{percentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getPhaseColor(phase)} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <Link
          to={`/projects/${project.project_id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-200 transition-all transform hover:scale-105 active:scale-95"
        >
          <i className="fa-solid fa-eye"></i>
          View Details
        </Link>
      </div>
    </div>
  );
}