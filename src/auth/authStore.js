import { api, setBasicAuth, clearAuth as clearAxiosAuth } from "../api/client";

const KEY = "auth";

export async function loginWithBasicAuth(username, password, roleHint) {
  setBasicAuth(username, password);

  try {
    const res = await api.get("/api/me"); // BE xác thực thật
    const auth = {
      username,
      password,                 // ✅ lưu password để giữ login
      roleHint: roleHint || null,
      roles: res.data?.roles || [],
    };
    localStorage.setItem(KEY, JSON.stringify(auth));
    return auth;
  } catch (e) {
    clearAxiosAuth();
    throw e;
  }
}

export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ✅ gọi ở main.jsx để auto set Authorization header sau refresh
export function initAuthFromStorage() {
  const a = loadAuth();
  if (a?.username && a?.password) {
    setBasicAuth(a.username, a.password);
  }
  return a;
}

export function logout() {
  localStorage.removeItem(KEY);
  clearAxiosAuth();
}
