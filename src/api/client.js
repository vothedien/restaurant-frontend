import axios from "axios";

export const api = axios.create({
  baseURL: "/", // dùng proxy /api -> BE
  timeout: 15000,
});
