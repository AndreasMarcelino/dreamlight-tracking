import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatRupiah, formatDateShort, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function FinanceList() {
  const navigate = useNavigate();
  const [finances, setFinances] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    month: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinances();
  }, [filters]);

  const fetchFinances = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.month) params.append('month', filters.month);

      const response = await api.get(`/finance?${params}`);
      setFinances(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Add edit handler
  const handleEdit = (financeId) => {
    // Navigate to edit page or open modal
    navigate(`/finance/edit/${financeId}`);
  };

  // ✅ FIX: Add delete handler
  const handleDelete = async (financeId, category) => {
    const result = await Swal.fire({
      title: 'Delete Transaction?',
      html: `Are you sure you want to delete <strong>${category}</strong>?<br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/finance/${financeId}`);
        toast.success('Transaction deleted successfully');
        fetchFinances(); // Refresh list
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete transaction');
      }
    }
  };

  // ✅ FIX: Add view details handler
  const handleViewDetails = (financeId) => {
    navigate(`/finance/${financeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-500">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Finance & Payroll</h1>
                    <p className="text-emerald-100">Manage budgets and crew payments</p>
                </div>
                <div className="flex gap-3">
                    <Link
                      to="/finance/payroll"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                    >
                      <i className="fa-solid fa-users"></i>
                      Payroll
                    </Link>
                    <Link
                      to="/finance/create"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      New Transaction
                    </Link>
                </div>
            </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-arrow-trend-up text-emerald-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">Total Income</p>
                  <p className="text-2xl font-bold text-white">{formatRupiah(summary.totalIncome || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-arrow-trend-down text-red-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">Total Expense</p>
                  <p className="text-2xl font-bold text-white">{formatRupiah(summary.totalExpense || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-wallet text-blue-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">Net Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {formatRupiah((summary.totalIncome || 0) - (summary.totalExpense || 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Received">Received</option>
            <option value="Pending">Pending</option>
          </select>

          <input
            type="month"
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: e.target.value})}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
          />

          <button
            onClick={() => setFilters({ type: '', status: '', month: '' })}
            className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-600 font-semibold"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
              {finances.length > 0 ? (
                finances.map((finance) => (
                  <tr key={finance.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateShort(finance.transaction_date)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/projects/${finance.project_id}`}
                        className="text-emerald-600 hover:underline font-semibold"
                      >
                        {finance.project?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{finance.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        finance.type === 'Income' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {finance.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatRupiah(finance.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(finance.status)}`}>
                        {finance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* ✅ FIX: Working Action Buttons */}
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(finance.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => handleEdit(finance.id)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(finance.id, finance.category)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-solid fa-receipt text-4xl mb-3 opacity-30"></i>
                      <p className="text-lg mb-2">No transactions found</p>
                      <p className="text-sm">Try adjusting your filters or create a new transaction</p>
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