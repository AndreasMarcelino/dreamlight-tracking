import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { financeService } from '../../services/financeService';
import { projectService } from '../../services/projectService';
import { formatNumberInput, parseNumberInput } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function FinanceCreate() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const amountDisplay = watch('amount_display');
  const transactionType = watch('type');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (amountDisplay) {
      const value = parseNumberInput(amountDisplay);
      setValue('amount', value);
    }
  }, [amountDisplay, setValue]);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        project_id: parseInt(data.project_id),
        type: data.type,
        category: data.category,
        amount: data.amount,
        transaction_date: data.transaction_date,
        status: data.status,
        description: data.description
      };

      await financeService.create(payload);
      toast.success('Transaksi berhasil dicatat!');
      navigate('/finance');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mencatat transaksi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInput = (e, field) => {
    const formatted = formatNumberInput(e.target.value);
    setValue(field, formatted);
  };

  // Predefined categories
  const expenseCategories = [
    'Equipment Rental',
    'Location Fee',
    'Talent Fee',
    'Crew Meal',
    'Transportation',
    'Props & Costume',
    'Post-Production',
    'Marketing',
    'Other Operational'
  ];

  const incomeCategories = [
    'Client Payment - Termin 1',
    'Client Payment - Termin 2',
    'Client Payment - Final',
    'Ad Revenue',
    'Sponsorship',
    'Other Income'
  ];

  const categories = transactionType === 'Expense' ? expenseCategories : incomeCategories;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/finance')}
          className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-6 transition font-medium text-sm group"
        >
          <i className="fa-solid fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
          Back to Finance
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 rounded-3xl p-8 shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-coins text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">New Transaction</h1>
                <p className="text-emerald-100 mt-1">Record income or expense</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Transaction Type */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-emerald-600"></i>
              Transaction Type
            </h2>
            <p className="text-sm text-gray-500 mb-6">Select income or expense</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex items-center p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 transition group">
                <input
                  type="radio"
                  {...register('type', { required: 'Transaction type is required' })}
                  value="Income"
                  className="sr-only peer"
                />
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-emerald-50 peer-checked:bg-emerald-600 transition">
                    <i className="fa-solid fa-arrow-trend-up text-2xl text-gray-500 group-hover:text-emerald-600 peer-checked:text-white transition"></i>
                  </div>
                  <div>
                    <span className="font-bold text-lg text-gray-700 group-hover:text-emerald-600 peer-checked:text-emerald-600 transition block">
                      Income
                    </span>
                    <span className="text-xs text-gray-500">Money received</span>
                  </div>
                </div>
                <i className="fa-solid fa-circle-check text-2xl text-transparent peer-checked:text-emerald-600"></i>
              </label>

              <label className="relative flex items-center p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-red-300 transition group">
                <input
                  type="radio"
                  {...register('type', { required: 'Transaction type is required' })}
                  value="Expense"
                  className="sr-only peer"
                />
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-red-50 peer-checked:bg-red-600 transition">
                    <i className="fa-solid fa-arrow-trend-down text-2xl text-gray-500 group-hover:text-red-600 peer-checked:text-white transition"></i>
                  </div>
                  <div>
                    <span className="font-bold text-lg text-gray-700 group-hover:text-red-600 peer-checked:text-red-600 transition block">
                      Expense
                    </span>
                    <span className="text-xs text-gray-500">Money spent</span>
                  </div>
                </div>
                <i className="fa-solid fa-circle-check text-2xl text-transparent peer-checked:text-red-600"></i>
              </label>
            </div>
            {errors.type && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Project Selection */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-clapperboard text-emerald-600"></i>
              Project
            </h2>
            <p className="text-sm text-gray-500 mb-6">Select related project</p>

            <select
              {...register('project_id', { required: 'Project is required' })}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.project_id ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              } focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition`}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} ({project.type})
                </option>
              ))}
            </select>
            {errors.project_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errors.project_id.message}
              </p>
            )}
          </div>

          {/* Transaction Details */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-file-invoice-dollar text-emerald-600"></i>
              Transaction Details
            </h2>
            <p className="text-sm text-gray-500 mb-6">Amount and category information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    {...register('amount_display', { required: 'Amount is required' })}
                    onChange={(e) => handleNumberInput(e, 'amount_display')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                    placeholder="10.000.000"
                  />
                  <input type="hidden" {...register('amount', { required: true })} />
                </div>
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('transaction_date', { required: 'Date is required' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                >
                  <option value="">Select status</option>
                  {transactionType === 'Income' ? (
                    <>
                      <option value="Received">Received</option>
                      <option value="Pending">Pending</option>
                    </>
                  ) : (
                    <>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition resize-none"
                placeholder="Additional notes about this transaction..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/finance')}
            className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-save"></i>
                Save Transaction
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}