import { api } from "./client";
import { EP } from "./endpoints";

// TABLES
export const adminListTables = async () => (await api.get(EP.admin.tables)).data;
export const adminCreateTable = async (payload) => (await api.post(EP.admin.tables, payload)).data;
export const adminUpdateTable = async (id, payload) => (await api.put(EP.admin.tableById(id), payload)).data;
export const adminDeleteTable = async (id) => (await api.delete(EP.admin.tableById(id))).data;

// CATEGORIES
export const adminListCategories = async () => (await api.get(EP.admin.categories)).data;
export const adminCreateCategory = async (payload) => (await api.post(EP.admin.categories, payload)).data;

// MENU ITEMS
export const adminListMenuItems = async () => (await api.get(EP.admin.menuItems)).data;
export const adminCreateMenuItem = async (payload) => (await api.post(EP.admin.menuItems, payload)).data;
export const adminUpdateMenuItem = async (id, payload) => (await api.put(EP.admin.menuItemById(id), payload)).data;
export const adminDeleteMenuItem = async (id) => (await api.delete(EP.admin.menuItemById(id))).data;

export const adminUploadMenuImage = async (file) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post(EP.admin.uploadMenuImage, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { imageUrl: "..." }
};
// TRANSACTIONS (Page)
export const adminListTransactions = async (params) => {
  // params: { page, size, from, to }
  const res = await api.get(EP.admin.transactions, { params });
  return res.data; // Spring Page object
};

// INVOICE
export const adminGetInvoice = async (paymentId) => {
  const res = await api.get(EP.admin.invoiceByPaymentId(paymentId));
  return res.data; // InvoiceDto
};
