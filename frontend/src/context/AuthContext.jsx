import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eventora_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('eventora_access_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/profile/');
          setUser(res.data);
        } catch {
          localStorage.removeItem('eventora_access_token');
          localStorage.removeItem('eventora_refresh_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    localStorage.removeItem('eventora_logged_out');
    const res = await api.post('/auth/login/', { email, password });
    localStorage.setItem('eventora_access_token', res.data.access);
    localStorage.setItem('eventora_refresh_token', res.data.refresh);
    setToken(res.data.access);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    localStorage.removeItem('eventora_logged_out');
    const res = await api.post('/auth/register/', data);
    if (res.data?.access) {
      localStorage.setItem('eventora_access_token', res.data.access);
      localStorage.setItem('eventora_refresh_token', res.data.refresh);
      setToken(res.data.access);
      setUser(res.data.user);
    } else {
      // Automatically log in after registration
      await login(data.email, data.password);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.setItem('eventora_logged_out', 'true');
    localStorage.removeItem('eventora_access_token');
    localStorage.removeItem('eventora_refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isOrganizer: user?.role === 'organizer' || user?.role === 'admin' || user?.is_staff,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
