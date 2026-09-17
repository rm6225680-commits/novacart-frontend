import React, { createContext, useState, useContext } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(localStorage.getItem('user') || null);

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const jwtToken = response.data.token;
      const username = response.data.username;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', username);
      setToken(jwtToken);
      setUser(username);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);