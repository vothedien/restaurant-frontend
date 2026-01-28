// src/api/admin.api.js
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";
import { getBasicAuthHeader } from "../auth/authStore";

// helper
function authHeaders(extra = {}) {
  const h = getBasicAuthHeader();
  return h ? { ...extra, Authorization: h } : { ...extra };
}

/** ---------- TABLES ---------- */
export async function adminListTables() {
  const res = await api.get(ENDPOINTS.admin.tables, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function adminCreateTable(body) {
  const res = await api.post(ENDPOINTS.admin.tables, body, {
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  return res.data;
}

export async function adminUpdateTable(id, body) {
  const res = await api.put(`${ENDPOINTS.admin.tables}/${id}`, body, {
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  return res.data;
}

export async function adminDeleteTable(id) {
  const res = await api.delete(`${ENDPOINTS.admin.tables}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
}

/** ---------- CATEGORIES ---------- */
export async function adminListCategories() {
  const res = await api.get(ENDPOINTS.admin.categories, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function adminCreateCategory(body) {
  const res = await api.post(ENDPOINTS.admin.categories, body, {
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  return res.data;
}

/** ---------- MENU ITEMS ---------- */
export async function adminListMenuItems() {
  const res = await api.get(ENDPOINTS.admin.menuItems, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function adminCreateMenuItem(body) {
  const res = await api.post(ENDPOINTS.admin.menuItems, body, {
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  return res.data;
}

export async function adminUpdateMenuItem(id, body) {
  const res = await api.put(`${ENDPOINTS.admin.menuItems}/${id}`, body, {
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  return res.data;
}

export async function adminDeleteMenuItem(id) {
  const res = await api.delete(`${ENDPOINTS.admin.menuItems}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
}

/** upload ảnh (multipart/form-data) */
export async function adminUploadMenuImage(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post(ENDPOINTS.admin.uploadMenuImage, fd, {
    // axios tự set multipart boundary, mình chỉ thêm Authorization
    headers: authHeaders(),
  });
  return res.data; // { imageUrl }
}

/** ---------- TRANSACTIONS ---------- */
export async function adminListTransactions(params = {}) {
  const res = await api.get(ENDPOINTS.admin.transactions, {
    params,
    headers: authHeaders(),
  });
  return res.data; // Spring Page
}

export async function adminGetInvoice(paymentId) {
  const res = await api.get(ENDPOINTS.admin.invoice(paymentId), {
    headers: authHeaders(),
  });
  return res.data;
}
