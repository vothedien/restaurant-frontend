// src/api/waiter.api.js
import api from "./client";

// Tables
export const getTables = async () => (await api.get("/api/tables")).data;

export const openTable = async (tableId) =>
  (await api.post(`/api/tables/${tableId}/open`)).data;

export const requestBill = async (tableId) =>
  (await api.post(`/api/tables/${tableId}/request-bill`)).data;

export const setCleaning = async (tableId) =>
  (await api.post(`/api/tables/${tableId}/set-cleaning`)).data;

export const setAvailable = async (tableId) =>
  (await api.post(`/api/tables/${tableId}/set-available`)).data;

// Orders
export const getDraftByTable = async (tableId) =>
  (await api.get(`/api/orders/draft?tableId=${tableId}`)).data;

export const getOrder = async (orderId) =>
  (await api.get(`/api/orders/${orderId}`)).data;

export const confirmOrder = async (orderId) =>
  (await api.post(`/api/orders/${orderId}/confirm`)).data;

export const rejectOrder = async (orderId, reason) =>
  (await api.post(`/api/orders/${orderId}/reject`, { reason })).data;

export const addItem = async (orderId, body) =>
  (await api.post(`/api/orders/${orderId}/items`, body)).data;

export const updateItem = async (orderId, itemId, body) =>
  (await api.put(`/api/orders/${orderId}/items/${itemId}`, body)).data;

export const deleteItem = async (orderId, itemId) =>
  (await api.delete(`/api/orders/${orderId}/items/${itemId}`)).data;

export const setItemStatus = async (orderId, itemId, newStatus, cancelReason = "") =>
  (
    await api.post(`/api/orders/${orderId}/items/${itemId}/status`, {
      newStatus,
      cancelReason,
    })
  ).data;
