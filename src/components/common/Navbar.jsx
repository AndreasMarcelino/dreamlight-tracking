import { useAuth } from '../../context/AuthContext';

export default function Navbar({ pageTitle, setIsSidebarOpen }) {
  const { user } = useAuth();

  return (
    <header className="h-24 bg-transparent flex items-center justify-between px-4 sm:px-8 py-4 mb-4">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger Button (Mobile Only) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          <i className="fa-solid fa-bars text-2xl"></i>
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {pageTitle || 'Overview'}
          </h2>
        </div>
      </div>

      {/* Center: Search (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 max-w-lg mx-10">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
          </span>
          <input
            type="text"
            className="w-full bg-white border-none py-3 pl-12 pr-4 rounded-2xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-100 placeholder-gray-400"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right: Profile & Notif */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button className="relative bg-white p-3 rounded-xl shadow-sm text-gray-500 hover:text-indigo-600 transition">
          <i className="fa-regular fa-bell text-xl"></i>
          <span className="absolute top-2 right-3 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm cursor-pointer hover:shadow-md transition">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`}
            className="h-10 w-10 rounded-full border-2 border-indigo-100"
            alt="Avatar"
          />
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-gray-800 leading-none">
              {user?.name || 'Guest'}
            </p>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {user?.role || 'Visitor'}
            </p>
          </div>
          <i className="fa-solid fa-chevron-down text-xs text-gray-400 ml-2 hidden sm:block"></i>
        </div>
      </div>
    </header>
  );
}
