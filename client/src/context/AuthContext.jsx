import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (userData) => {
      const { data } = await api.put('/users/profile', userData);
      // Update local state but keep token
      const updatedUser = { ...data, token: user.token };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return data;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
