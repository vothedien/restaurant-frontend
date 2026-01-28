// src/api/public.api.js
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

// Lấy info bàn theo token (customer)
export async function getTableByToken(token) {
  const res = await api.get(ENDPOINTS.public.tableInfo(token));
  return res.data;
}

// ✅ Public menu để customer/waiter lấy danh sách món đang bán
export async function getPublicMenu() {
  const res = await api.get(ENDPOINTS.public.menu);
  return res.data;
}

// Customer submit order draft theo token (customer)
export async function submitDraftOrder(token, data) {
  const res = await api.post(ENDPOINTS.public.submitOrder(token), data);
  return res.data;
}
