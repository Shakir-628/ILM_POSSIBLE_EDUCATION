import React, { useState } from 'react';
import Navbar from './Navbar';
import SidebarWithSubmenu from './SidebarWithSubmenu';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarWithSubmenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="relative z-40">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

