import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { baseURL } from "../http";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${baseURL}/user-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.log('User fetch failed', err);
      localStorage.removeItem('token');
    }

    setLoading(false);
  };

  const updateUserProfile = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${baseURL}/update-profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setUser(res.data.user); // ✅ Only set updated user data
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    await axios.post(`${baseURL}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.removeItem('token');
    setUser(null);
    window.location.reload();
  };

  const upgradePlan = async (plan) => {
    const token = localStorage.getItem('token');
    await axios.post(`${baseURL}/upgrade-plan`, { plan }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUser(); // Refresh user info
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, upgradePlan, fetchUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
