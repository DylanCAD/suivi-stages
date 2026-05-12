import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe()
      .then(res => setUser(res.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, mot_de_passe) => {
    const res = await authAPI.login({ email, mot_de_passe });
    // Admin → requires2FA, pas de user ni de cookie encore
    if (res.data.requires2FA) {
      return res.data; // { requires2FA: true, userId }
    }
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  // ── Connexion admin après vérification OTP ──
  const loginWithTokens = useCallback((_accessToken, _refreshToken, userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
};