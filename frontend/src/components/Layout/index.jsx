import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, refreshUser } = useUser();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-200 via-gray-100 to-gray-50">
      <Topbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        userAvatar={user.avatar}
        username={user.username}
      />
      <div className="flex flex-1 p-4 pt-20 gap-4 h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <motion.main
          className="flex-1 overflow-auto rounded-3xl bg-white border border-gray-100 shadow-sm relative"
          initial={false}
          animate={{
            marginLeft: isSidebarOpen ? 296 : 0,
            width: isSidebarOpen ? 'calc(100% - 296px)' : '100%'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-8 max-w-full mx-auto min-h-full">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;