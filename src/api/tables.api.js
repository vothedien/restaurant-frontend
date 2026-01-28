// src/api/tables.api.js
import client, { api } from "./client";
import { ENDPOINTS } from "./endpoints";

// Public
export async function fetchTableInfoByToken(token) {
  if (!token) throw new Error("Missing token");
  const res = await api.get(ENDPOINTS.public.tableInfo(token));
  // BE trả: { tableId, code, status } -> bạn muốn table.id thì map lại:
  const t = res.data;
  return { id: t.tableId ?? t.id, code: t.code, status: t.status };
}

// Staff (để Waiter page khỏi báo thiếu export)
export async function listTables() {
  const res = await client.get(ENDPOINTS.tables.list);
  return res.data;
}
export async function openTable(tableId) {
  const res = await client.post(ENDPOINTS.tables.open(tableId));
  return res.data;
}
export async function requestBill(tableId) {
  const res = await client.post(ENDPOINTS.tables.requestBill(tableId));
  return res.data;
}
export async function setCleaning(tableId) {
  const res = await client.post(ENDPOINTS.tables.setCleaning(tableId));
  return res.data;
}
export async function setAvailable(tableId) {
  const res = await client.post(ENDPOINTS.tables.setAvailable(tableId));
  return res.data;
}
