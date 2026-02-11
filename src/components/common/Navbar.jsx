import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
            {pageTitle || "Overview"}
          </h2>
        </div>
      </div>

      {/* Right: Profile & Notif */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button className="relative bg-white p-3 rounded-xl shadow-sm text-gray-500 hover:text-ocean-500 transition">
          <i className="fa-regular fa-bell text-xl"></i>
          <span className="absolute top-2 right-3 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <Link
          to="/profile"
          className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm cursor-pointer hover:shadow-md transition"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=2872A1&color=fff`}
            className="h-10 w-10 rounded-full border-2 border-sky-200"
            alt="Avatar"
          />
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-gray-800 leading-none">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {user?.role || "Visitor"}
            </p>
          </div>
          <i className="fa-solid fa-chevron-down text-xs text-gray-400 ml-2 hidden sm:block"></i>
        </Link>
      </div>
    </header>
  );
}
