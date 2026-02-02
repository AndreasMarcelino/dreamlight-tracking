import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { formatRupiah, formatDateShort, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (error) {
      toast.error('Gagal memuat data project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Project "${title}" akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await projectService.delete(id);
        toast.success('Project berhasil dihapus');
        fetchProjects();
      } catch (error) {
        toast.error('Gagal menghapus project');
        console.error(error);
      }
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Search Filter */}
        <div className="relative w-full sm:w-72 md:w-96">
          <input
            type="text"
            placeholder="Cari nama project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-indigo-100 placeholder-gray-400 bg-white"
          />
          <i className="fa-solid fa-search absolute left-4 top-3.5 text-gray-300"></i>
        </div>

        {/* Add Button */}
        <Link
          to="/projects/create"
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <i className="fa-solid fa-plus"></i> Project Baru
        </Link>
      </div>

      {/* Project Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Judul Project
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Tipe</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Budget Plan
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">
                  Deadline
                </th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          {project.title.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-[150px]">
                          <p
                            className="font-bold text-gray-800 line-clamp-1"
                            title={project.title}
                          >
                            {project.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {project.client_name || 'Internal'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        {project.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          project.global_status
                        )}`}
                      >
                        {project.global_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {formatRupiah(project.total_budget_plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateShort(project.deadline_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/projects/${project.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Detail"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id, project.title)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fa-solid fa-folder-open text-4xl mb-3 opacity-20"></i>
                      <p>Belum ada project.</p>
                      <Link
                        to="/projects/create"
                        className="mt-2 text-indigo-600 hover:underline text-xs font-bold"
                      >
                        Buat Project Baru
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
