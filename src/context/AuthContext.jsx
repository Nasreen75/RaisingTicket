import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  try {
    if (storedUser && token && storedUser !== 'undefined') {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser && typeof parsedUser === 'object') {
        setUser(parsedUser);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      if (storedUser === 'undefined') {
        localStorage.removeItem('user');
      }

      if (!storedUser || storedUser === 'undefined') {
        localStorage.removeItem('token');
      }
    }
  } catch (error) {
    console.error('Error restoring user session:', error);

    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } finally {
    setLoading(false);
  }
}, []);
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};