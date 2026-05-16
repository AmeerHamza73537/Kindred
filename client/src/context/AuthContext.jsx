import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import * as usersApi from '../api/users.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async (opts) => {
    const signal = opts?.signal;
    try {
      const { data } = await usersApi.getMe(signal ? { signal } : {});
      if (signal?.aborted) return;
      if (data.success) setUser(data.data.user);
      else setUser(null);
    } catch {
      if (signal?.aborted) return;
      setUser(null);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    loadMe({ signal: ac.signal });
    return () => ac.abort();
  }, [loadMe]);

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload);
    if (data.success) setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    if (data.success) setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* still clear local session */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser: loadMe }),
    [user, loading, login, register, logout, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}
