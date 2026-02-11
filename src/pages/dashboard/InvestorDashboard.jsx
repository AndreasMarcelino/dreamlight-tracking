import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { formatRupiah } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function InvestorDashboard() {
  const [data, setData] = useState({
    totalInvestment: 0,
    totalExpenseReal: 0,
    totalIncomeReal: 0,
    totalAR: 0,
    roiPercentage: 0,
    projectStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await projectService.getInvestorProjects();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load investment data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const netProfit = data.totalIncomeReal - data.totalExpenseReal;
  const isProfit = netProfit >= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-500">Loading investment portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Investment Portfolio 💰
            </h1>
            <p className="text-emerald-100">Track your ROI and project performance</p>
          </div>

          {/* Financial Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Investment */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-hand-holding-dollar text-blue-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">Total Investment</p>
                  <p className="text-xl font-bold text-white">{formatRupiah(data.totalInvestment)}</p>
                </div>
              </div>
            </div>

            {/* Total Expense */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-arrow-trend-down text-red-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">Total Expense</p>
                  <p className="text-xl font-bold text-white">{formatRupiah(data.totalExpenseReal)}</p>
                </div>
              </div>
            </div>

            {/* Total Income */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-arrow-trend-up text-emerald-300 text-xl"></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">Total Income</p>
                  <p className="text-xl font-bold text-white">{formatRupiah(data.totalIncomeReal)}</p>
                </div>
              </div>
            </div>

            {/* ROI */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl ${isProfit ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                  <i className={`fa-solid fa-chart-line ${isProfit ? 'text-emerald-300' : 'text-red-300'} text-xl`}></i>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase">ROI</p>
                  <p className={`text-xl font-bold ${isProfit ? 'text-white' : 'text-red-200'}`}>
                    {isProfit ? '+' : ''}{data.roiPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="mt-4">
            <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl ${isProfit ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                    <i className={`fa-solid ${isProfit ? 'fa-circle-check' : 'fa-circle-exclamation'} ${isProfit ? 'text-emerald-300' : 'text-red-300'} text-2xl`}></i>
                  </div>
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold uppercase">Net Profit/Loss</p>
                    <p className={`text-3xl font-bold ${isProfit ? 'text-white' : 'text-red-200'}`}>
                      {formatRupiah(Math.abs(netProfit))}
                    </p>
                  </div>
                </div>
                {data.totalAR > 0 && (
                  <div className="text-right">
                    <p className="text-emerald-100 text-xs font-semibold uppercase">Accounts Receivable</p>
                    <p className="text-lg font-bold text-white">{formatRupiah(data.totalAR)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Project Performance Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-emerald-600"></i>
            Project Performance Analysis
          </h2>
          <p className="text-sm text-gray-500 mt-1">Budget efficiency and production progress</p>
        </div>

        {data.projectStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Budget</th>
                  <th className="px-6 py-4 font-semibold">Actual Expense</th>
                  <th className="px-6 py-4 font-semibold">Burn Rate</th>
                  <th className="px-6 py-4 font-semibold">Progress</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                {data.projectStats.map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                          {project.title.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{project.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatRupiah(project.budget)}</td>
                    <td className="px-6 py-4 font-semibold">{formatRupiah(project.expense_real)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${
                              project.burn_rate > project.production_progress + 10 ? 'bg-red-500' :
                              project.burn_rate > project.production_progress ? 'bg-orange-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(project.burn_rate, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-800 w-12 text-right">{project.burn_rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-ocean-500 rounded-full"
                            style={{ width: `${project.production_progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-800 w-12 text-right">{project.production_progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        project.status === 'Overbudget' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {project.status}
                      </span>
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
                <i className="fa-solid fa-chart-line text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Projects Yet</h3>
              <p className="text-gray-500">Your invested projects will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-ocean-500 rounded-2xl p-6 text-white">
          <i className="fa-solid fa-lightbulb text-3xl mb-4 opacity-80"></i>
          <h3 className="text-lg font-bold mb-2">Portfolio Health</h3>
          <p className="text-sm text-blue-100">
            {isProfit 
              ? 'Your portfolio is performing well with positive returns!'
              : 'Some projects need attention to improve profitability.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-ocean-500 to-pink-600 rounded-2xl p-6 text-white">
          <i className="fa-solid fa-chart-pie text-3xl mb-4 opacity-80"></i>
          <h3 className="text-lg font-bold mb-2">Total Projects</h3>
          <p className="text-3xl font-bold">{data.projectStats.length}</p>
          <p className="text-sm text-sky-100 mt-1">Active investments</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <i className="fa-solid fa-triangle-exclamation text-3xl mb-4 opacity-80"></i>
          <h3 className="text-lg font-bold mb-2">Budget Alerts</h3>
          <p className="text-3xl font-bold">
            {data.projectStats.filter(p => p.status === 'Overbudget').length}
          </p>
          <p className="text-sm text-orange-100 mt-1">Projects over budget</p>
        </div>
      </div>
    </div>
  );
}
