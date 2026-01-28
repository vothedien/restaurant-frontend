// src/auth/authStore.js
const KEY = "auth";

/**
 * Lấy auth từ localStorage
 * { username, password, roles }
 */
export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

/**
 * Lưu auth sau khi login thành công
 */
export function setAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

/**
 * Xoá auth (logout)
 */
export function clearAuth() {
  localStorage.removeItem(KEY);
}

/**
 * Check đã login chưa
 */
export function isLoggedIn() {
  const a = getAuth();
  return !!(a?.username && a?.password && Array.isArray(a?.roles));
}

/**
 * Check role
 * requiredRoles: ["ROLE_ADMIN", ...]
 */
export function hasRole(requiredRoles = []) {
  if (!requiredRoles.length) return true;
  const a = getAuth();
  const roles = a?.roles || [];
  return requiredRoles.some((r) => roles.includes(r));
}

/**
 * Header Basic Auth cho axios
 */
export function getBasicAuthHeader() {
  const a = getAuth();
  if (!a?.username || !a?.password) return null;
  return "Basic " + btoa(`${a.username}:${a.password}`);
}
