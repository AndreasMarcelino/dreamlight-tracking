import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Anda akan keluar dari sesi ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Sidebar */}
        <div className="h-24 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fa-solid fa-film text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
              Dreamlight
            </h1>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-red-500"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>

          <Link
            to="/dashboard"
            className={`flex items-center px-6 py-4 rounded-2xl transition-all duration-200 group ${
              isActive('/dashboard')
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <i className="fa-solid fa-chart-pie text-lg mr-4 w-6 text-center"></i>
            <span className="font-medium">Dashboard</span>
          </Link>

          {['admin', 'producer'].includes(user?.role) && (
            <Link
              to="/projects"
              className={`flex items-center px-6 py-4 rounded-2xl transition-all duration-200 group ${
                isActive('/projects')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <i className="fa-solid fa-clapperboard text-lg mr-4 w-6 text-center"></i>
              <span className="font-medium">Projects</span>
            </Link>
          )}

          {['admin', 'producer'].includes(user?.role) && (
            <Link
              to="/finance"
              className={`flex items-center px-6 py-4 rounded-2xl transition-all duration-200 group ${
                isActive('/finance')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <i className="fa-solid fa-wallet text-lg mr-4 w-6 text-center"></i>
              <span className="font-medium">Finance & Payroll</span>
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-50">
          <div
            onClick={handleLogout}
            className="bg-indigo-50 rounded-2xl p-4 relative overflow-hidden group cursor-pointer transition hover:bg-red-50"
          >
            <div className="relative z-10 flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600 group-hover:text-red-600 transition-colors">
                <i className="fa-solid fa-right-from-bracket"></i>
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 group-hover:text-red-600 transition-colors">
                  Sign Out
                </h4>
                <p className="text-xs text-indigo-600 group-hover:text-red-400 transition-colors">
                  End session
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-200 rounded-full opacity-50 group-hover:bg-red-200 group-hover:scale-150 transition-transform duration-500"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
