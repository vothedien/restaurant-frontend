import { api } from "./client";

// --- TABLES ---
export const getTables = async () => (await api.get("/api/admin/tables")).data;
export const createTable = async (data) => (await api.post("/api/admin/tables", data)).data;
export const updateTable = async (id, data) => (await api.put(`/api/admin/tables/${id}`, data)).data;
export const deleteTable = async (id) => (await api.delete(`/api/admin/tables/${id}`)).data;

// --- CATEGORIES ---
export const getCategories = async () => (await api.get("/api/admin/categories")).data;
export const createCategory = async (data) => (await api.post("/api/admin/categories", data)).data;

// --- MENU ITEMS ---
export const getMenuItems = async () => (await api.get("/api/admin/menu-items")).data;
export const createMenuItem = async (data) => (await api.post("/api/admin/menu-items", data)).data;
export const updateMenuItem = async (id, data) => (await api.put(`/api/admin/menu-items/${id}`, data)).data;
export const deleteMenuItem = async (id) => (await api.delete(`/api/admin/menu-items/${id}`)).data;

// --- UPLOAD IMAGE (ImgBB) ---
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return (await api.post("/api/admin/uploads/menu-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data;
};

// --- TRANSACTIONS ---
export const getTransactions = async () => (await api.get("/api/admin/transactions")).data;