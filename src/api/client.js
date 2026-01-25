import axios from "axios";

export const api = axios.create({
  baseURL: "/", // dùng proxy /api
  timeout: 15000,
});

export function setBasicAuth(username, password) {
  const token = btoa(`${username}:${password}`);
  api.defaults.headers.common["Authorization"] = `Basic ${token}`;
}

export function clearAuth() {
  delete api.defaults.headers.common["Authorization"];
}
