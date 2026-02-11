import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projectService } from '../../services/projectService';
import { formatNumberInput, parseNumberInput } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [broadcasters, setBroadcasters] = useState([]);
  const [investors, setInvestors] = useState([]);

  const budgetDisplay = watch('budget_display');
  const incomeDisplay = watch('income_display');

  

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (budgetDisplay) {
      const value = parseNumberInput(budgetDisplay);
      setValue('total_budget_plan', value);
    }
  }, [budgetDisplay, setValue]);

  useEffect(() => {
    if (incomeDisplay) {
      const value = parseNumberInput(incomeDisplay);
      setValue('target_income', value);
    }
  }, [incomeDisplay, setValue]);

  const fetchData = async () => {
    try {
      const [projectRes] = await Promise.all([
        projectService.getById(id),
        fetchUsers(),
      ]);

      const project = projectRes.data;

      // Set form values
      setValue('title', project.title);
      setValue('client_id', project.client_id || '');
      setValue('investor_id', project.investor_id || '');
      setValue('type', project.type);
      setValue('budget_display', formatNumberInput(project.total_budget_plan.toString()));
      setValue('total_budget_plan', project.total_budget_plan);
      setValue('income_display', formatNumberInput(project.target_income.toString()));
      setValue('target_income', project.target_income);
      setValue('start_date', project.start_date.split('T')[0]);
      setValue('deadline_date', project.deadline_date.split('T')[0]);
      setValue('global_status', project.global_status);
      setValue('description', project.description || '');

    } catch (error) {
      toast.error('Gagal memuat data project');
      console.error(error);
      navigate('/projects');
    } finally {
      setFetching(false);
    }
  };

  const fetchUsers = async () => {
  try {
    const response = await api.get('/auth/users');
    const users = response.data.data;
    
    setBroadcasters(users.filter(u => u.role === 'broadcaster'));
    setInvestors(users.filter(u => u.role === 'investor'));
    setProducers(users.filter(u => u.role === 'producer')); // ✨ ADD
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        title: data.title,
        client_id: data.client_id || null,
        investor_id: data.investor_id || null,
        type: data.type,
        total_budget_plan: data.total_budget_plan,
        target_income: data.target_income,
        start_date: data.start_date,
        deadline_date: data.deadline_date,
        global_status: data.global_status,
        description: data.description,
      };

      await projectService.update(id, payload);
      toast.success('Project berhasil diupdate!');
      navigate(`/projects/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInput = (e, field) => {
    const formatted = formatNumberInput(e.target.value);
    setValue(field, formatted);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-500">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Gradient */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition font-medium text-sm group"
        >
          <i className="fa-solid fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
          Back to Detail
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 rounded-3xl p-8 shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-pen-to-square text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Edit Project</h1>
                <p className="text-fuchsia-100 mt-1">Update project information</p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-violet-600"></i>
              Informasi Dasar
            </h2>
            <p className="text-sm text-gray-500 mb-6">Detail utama project</p>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Judul Project <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Judul harus diisi' })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition`}
                  placeholder="Contoh: FTV Cinta di Semarang"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Project Type */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Movie', 'Series', 'TVC', 'Event'].map((type) => (
                  <label
                    key={type}
                    className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-violet-300 transition group"
                  >
                    <input
                      type="radio"
                      {...register('type', { required: 'Pilih tipe project' })}
                      value={type}
                      className="sr-only peer"
                    />
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-violet-50 peer-checked:bg-violet-600 transition">
                        <i className={`fa-solid ${
                          type === 'Movie' ? 'fa-film' :
                          type === 'Series' ? 'fa-tv' :
                          type === 'TVC' ? 'fa-bullhorn' : 'fa-calendar-days'
                        } text-gray-500 group-hover:text-violet-600 peer-checked:text-white transition`}></i>
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-violet-600 peer-checked:text-violet-600 transition">
                        {type === 'TVC' ? 'TVC / Iklan' : type}
                      </span>
                    </div>
                    <i className="fa-solid fa-circle-check text-transparent peer-checked:text-violet-600 text-xl"></i>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Client & Investor */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-handshake text-violet-600"></i>
              Klien & Investor
            </h2>
            <p className="text-sm text-gray-500 mb-6">Pilih broadcaster dan sumber pendanaan</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Broadcaster / Klien
                </label>
                <select
                  {...register('client_id')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                >
                  <option value="">Internal / Tanpa Klien</option>
                  {broadcasters.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Investor / Pendana
                </label>
                <select
                  {...register('investor_id')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                >
                  <option value="">Internal Funding</option>
                  {investors.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-wallet text-violet-600"></i>
              Informasi Keuangan
            </h2>
            <p className="text-sm text-gray-500 mb-6">Budget dan target pendapatan</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Budget Plan (Cost) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    {...register('budget_display')}
                    onChange={(e) => handleNumberInput(e, 'budget_display')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                    placeholder="500.000.000"
                  />
                  <input type="hidden" {...register('total_budget_plan', { required: true })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Target Income <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    {...register('income_display')}
                    onChange={(e) => handleNumberInput(e, 'income_display')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                    placeholder="750.000.000"
                  />
                  <input type="hidden" {...register('target_income', { required: true })} />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-violet-600"></i>
              Timeline Project
            </h2>
            <p className="text-sm text-gray-500 mb-6">Tentukan jadwal produksi</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('start_date', { required: 'Tanggal mulai harus diisi' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Deadline Delivery <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('deadline_date', { required: 'Deadline harus diisi' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-flag text-violet-600"></i>
              Project Status
            </h2>
            <p className="text-sm text-gray-500 mb-6">Lifecycle status project</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { value: 'Draft', label: 'Draft', icon: 'fa-file', color: 'gray' },
                { value: 'In Progress', label: 'In Progress', icon: 'fa-spinner', color: 'blue' },
                { value: 'On Hold', label: 'On Hold', icon: 'fa-pause', color: 'orange' },
                { value: 'Completed', label: 'Completed', icon: 'fa-check-circle', color: 'emerald' },
              ].map((status) => (
                <label
                  key={status.value}
                  className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-violet-300 transition group"
                >
                  <input
                    type="radio"
                    {...register('global_status')}
                    value={status.value}
                    className="sr-only peer"
                  />
                  <div className="flex-1 flex flex-col items-center text-center gap-2">
                    <div className={`w-12 h-12 rounded-xl bg-${status.color}-50 flex items-center justify-center peer-checked:bg-${status.color}-500 transition`}>
                      <i className={`fa-solid ${status.icon} text-${status.color}-500 peer-checked:text-white transition`}></i>
                    </div>
                    <span className="font-semibold text-gray-700 text-sm peer-checked:text-violet-600 transition">
                      {status.label}
                    </span>
                  </div>
                  <i className="fa-solid fa-circle-check absolute top-2 right-2 text-transparent peer-checked:text-violet-600 text-lg"></i>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Deskripsi Project
            </label>
            <textarea
              {...register('description')}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition resize-none"
              placeholder="Ceritakan lebih detail tentang project ini..."
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${id}`)}
            className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-violet-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-save"></i>
                Save Changes
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}