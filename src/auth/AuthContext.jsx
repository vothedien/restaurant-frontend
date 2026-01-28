import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import client, { setBasicAuth, clearAuth } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

const AuthContext = createContext(null);

const LS_KEY = "restaurant_auth_v1";

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null); // { username, roles: [] }
  const [loading, setLoading] = useState(true);
  const [basic, setBasic] = useState(null); // { username, password }

  // restore
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.username && saved?.password) {
          setBasic({ username: saved.username, password: saved.password });
          setBasicAuth(saved.username, saved.password);
        }
      }
    } catch (_) { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!basic?.username || !basic?.password) return;
      try {
        const res = await client.get(ENDPOINTS.ME);
        setMe(res.data);
      } catch (err) {
        // token sai => clear
        setMe(null);
        setBasic(null);
        clearAuth();
        localStorage.removeItem(LS_KEY);
      }
    };
    run();
  }, [basic?.username, basic?.password]);

  const login = async (username, password) => {
    // set header trước rồi verify bằng /api/me
    setBasicAuth(username, password);
    const res = await client.get(ENDPOINTS.ME); // 200 ok, 401 throw
    setMe(res.data);
    setBasic({ username, password });
    localStorage.setItem(LS_KEY, JSON.stringify({ username, password }));
    return res.data;
  };

  const logout = () => {
    setMe(null);
    setBasic(null);
    clearAuth();
    localStorage.removeItem(LS_KEY);
  };

  const hasRole = (roles = []) => {
    if (!me?.roles?.length) return false;
    return roles.some((r) => me.roles.includes(r));
  };

  const value = useMemo(
    () => ({ me, loading, login, logout, hasRole }),
    [me, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
