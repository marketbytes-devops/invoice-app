import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion } from 'framer-motion';
import apiClient from '../../api/apiClient';

const MEDIA_URL = 'http://127.0.0.1:8000';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userAvatar, setUserAvatar] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/profile/');
        setUserAvatar(response.data.avatar ? `${MEDIA_URL}${response.data.avatar}` : 'https://via.placeholder.com/80');
        setUsername(response.data.username || 'User');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setUserAvatar('https://via.placeholder.com/80');
        setUsername('User');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-200 via-gray-100 to-gray-50">
      <Topbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        userAvatar={userAvatar}
        username={username}
      />
      <div className="flex flex-1 p-4 pt-20 gap-4 h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <motion.main
          className="flex-1 overflow-auto rounded-3xl bg-white border border-gray-100 shadow-sm"
          initial={false}
          animate={{
            marginLeft: isSidebarOpen ? 296 : 0,
            width: isSidebarOpen ? 'calc(100% - 296px)' : '100%'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-8 max-w-full mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;