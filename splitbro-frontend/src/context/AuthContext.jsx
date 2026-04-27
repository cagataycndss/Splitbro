import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
        } else {
          setUser(decoded);
          const myId = decoded.id || decoded._id;
          api.get(`/users/${myId}/profile`).then(res => {
            if(res.data?.data) {
                setUser({...decoded, ...res.data.data});
            }
          }).catch(err => {
              console.warn("Kullanıcı detayları alınamadı");
          })
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token || response.data.data?.token;
      
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Giriş başarısız oldu' 
      };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await api.post('/auth/register', { 
        firstName, lastName, email, password 
      });
      const token = response.data.token || response.data.data?.token;
      
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Kayıt başarısız oldu' 
      };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const token = response.data.token || response.data.data?.token;

      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google ile giriş başarısız oldu'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
