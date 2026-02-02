import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

export default function MainLayout({ pageTitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative bg-[#F8F9FE]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 lg:ml-72 w-full transition-all duration-300 flex flex-col min-h-screen">
        <Navbar pageTitle={pageTitle} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
