import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    const { user, token } = data || {};
    if (!token || !user?.id) {
      console.error('[auth] Login response missing token or user', data);
      throw new Error('Invalid login response from server.');
    }
    localStorage.setItem('token', token);
    setUser(user);
  };

  const register = async (email, password, name) => {
    const data = await authApi.register(email, password, name);
    const { user, token } = data || {};
    if (!token || !user?.id) {
      console.error('[auth] Register response missing token or user', data);
      throw new Error('Invalid registration response from server.');
    }
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
