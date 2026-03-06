import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../components/Services/AuthServices';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);

      if (data?.token) {
          const normalizedRole = data.role ? data.role.toLowerCase() : undefined;
          localStorage.setItem('token', data.token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: data._id,
              name: data.name,
              email: data.email,
              role: normalizedRole,
              subscriptionPlan: data.subscriptionPlan,
              specialization: data.specialization,
            })
          );

          setUser({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: normalizedRole,
            subscriptionPlan: data.subscriptionPlan,
            specialization: data.specialization,
          });

          return { success: true, role: normalizedRole };
        }

      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);

      if (data?.token) {
          const normalizedRole = data.role ? data.role.toLowerCase() : undefined;
          localStorage.setItem('token', data.token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: data._id,
              name: data.name,
              email: data.email,
              role: normalizedRole,
              subscriptionPlan: data.subscriptionPlan,
              specialization: data.specialization,
            })
          );

          setUser({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: normalizedRole,
            subscriptionPlan: data.subscriptionPlan,
            specialization: data.specialization,
          });

          return { success: true, role: normalizedRole };
        }

      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

