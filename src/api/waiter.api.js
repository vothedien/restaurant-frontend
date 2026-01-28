import { api } from "../api/client";

// --- TABLES ---
export const getTables = async () => 
  (await api.get("/api/tables")).data;

export const openTable = async (tableId) => 
  (await api.post(`/api/tables/${tableId}/open`)).data;

export const requestBill = async (tableId) => 
  (await api.post(`/api/tables/${tableId}/request-bill`)).data;

export const setCleaning = async (tableId) => 
  (await api.post(`/api/tables/${tableId}/set-cleaning`)).data;

export const setAvailable = async (tableId) => 
  (await api.post(`/api/tables/${tableId}/set-available`)).data;

// Lấy Draft 
export const getDraftByTable = async (tableId) => 
  (await api.get(`/api/orders/draft?tableId=${tableId}`)).data;

// Xác nhận đơn
export const confirmOrder = async (orderId) => 
  (await api.post(`/api/orders/${orderId}/confirm`)).data;

// Thêm món vào đơn
export const addOrderItem = async (orderId, payload) => 
  (await api.post(`/api/orders/${orderId}/items`, payload)).data;

// Xóa món khỏi đơn
export const removeOrderItem = async (orderId, itemId) => 
  (await api.delete(`/api/orders/${orderId}/items/${itemId}`)).data;

// Cập nhật trạng thái món
export const updateItemStatus = async (orderId, itemId, { status, reason = "" }) => 
  (await api.post(`/api/orders/${orderId}/items/${itemId}/status`, { 
    newStatus: status, 
    cancelReason: reason 
  })).data;

export const getMenu = async () => 
  (await api.get("/api/public/menu")).data;