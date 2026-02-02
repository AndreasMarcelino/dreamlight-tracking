import { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { formatRupiah, formatDateShort } from '../../utils/formatters';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function PayrollManagement() {
  const [pendingPayrolls, setPendingPayrolls] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayrolls();
  }, []);

  const fetchPendingPayrolls = async () => {
    try {
      const response = await financeService.getPendingPayroll();
      setPendingPayrolls(response.data);
      setTotalPending(response.totalPending || 0);
    } catch (error) {
      toast.error('Failed to load pending payrolls');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pendingPayrolls.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePaySingle = async (milestoneId, crewName, amount) => {
    const result = await Swal.fire({
      title: 'Confirm Payment',
      html: `Pay <strong>${formatRupiah(amount)}</strong> to <strong>${crewName}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Pay Now',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await financeService.payCrew(milestoneId);
        toast.success(`Payment to ${crewName} successful!`);
        fetchPendingPayrolls();
        setSelectedIds([]);
      } catch (error) {
        toast.error('Payment failed');
        console.error(error);
      }
    }
  };

  const handlePayBatch = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one payment');
      return;
    }

    const totalAmount = pendingPayrolls
      .filter(p => selectedIds.includes(p.id))
      .reduce((sum, p) => sum + parseFloat(p.honor_amount), 0);

    const result = await Swal.fire({
      title: 'Confirm Batch Payment',
      html: `Pay <strong>${formatRupiah(totalAmount)}</strong> to <strong>${selectedIds.length}</strong> crew members?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Pay All',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Pay each selected milestone
        for (const id of selectedIds) {
          await financeService.payCrew(id);
        }
        
        toast.success(`${selectedIds.length} payments processed successfully!`);
        fetchPendingPayrolls();
        setSelectedIds([]);
      } catch (error) {
        toast.error('Batch payment failed');
        console.error(error);
      }
    }
  };

  const selectedTotal = pendingPayrolls
    .filter(p => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + parseFloat(p.honor_amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-500">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Payroll Management 💰
              </h1>
              <p className="text-orange-100">Process crew payments efficiently</p>
            </div>
            
            {selectedIds.length > 0 && (
              <button
                onClick={handlePayBatch}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg"
              >
                <i className="fa-solid fa-money-bill-wave"></i>
                Pay Selected ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-clock text-orange-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">{pendingPayrolls.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-wallet text-yellow-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Total Amount</p>
                  <p className="text-2xl font-bold text-white">{formatRupiah(totalPending)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-emerald-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Selected</p>
                  <p className="text-2xl font-bold text-white">{formatRupiah(selectedTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -right-40 -top-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {pendingPayrolls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === pendingPayrolls.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold">Crew Member</th>
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Phase</th>
                  <th className="px-6 py-4 font-semibold">Honor Amount</th>
                  <th className="px-6 py-4 font-semibold">Completed</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                {pendingPayrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(payroll.id)}
                        onChange={() => handleSelectOne(payroll.id)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 font-bold text-sm">
                            {payroll.user?.name?.substring(0, 2).toUpperCase() || '??'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{payroll.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{payroll.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{payroll.task_name}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{payroll.project?.title}</p>
                      {payroll.episode && (
                        <p className="text-xs text-gray-500">Episode {payroll.episode.episode_number}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        payroll.phase_category === 'Pre-Production' ? 'bg-indigo-100 text-indigo-700' :
                        payroll.phase_category === 'Production' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {payroll.phase_category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-emerald-600">
                        {formatRupiah(payroll.honor_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateShort(payroll.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handlePaySingle(payroll.id, payroll.user?.name, payroll.honor_amount)}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ml-auto"
                      >
                        <i className="fa-solid fa-money-bill-wave"></i>
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-check-double text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
              <p className="text-gray-500">No pending crew payments at the moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}