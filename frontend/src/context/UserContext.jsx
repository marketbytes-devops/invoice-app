import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

const MEDIA_URL = 'http://127.0.0.1:8000';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: '',
    avatar: null,
    firstName: '',
    lastName: '',
    email: ''
  });

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/profile/');
      const data = response.data;
      setUser({
        username: data.username || 'User',
        avatar: data.avatar ? `${MEDIA_URL}${data.avatar}` : 'https://via.placeholder.com/80',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUser(prev => ({
        ...prev,
        avatar: 'https://via.placeholder.com/80',
        username: 'User'
      }));
    }
  }, []);

  const updateUserAvatar = useCallback((avatarPath) => {
    setUser(prev => ({
      ...prev,
      avatar: avatarPath ? `${MEDIA_URL}${avatarPath}` : 'https://via.placeholder.com/80'
    }));
  }, []);

  const updateUserInfo = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      refreshUser,
      updateUserAvatar,
      updateUserInfo
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
