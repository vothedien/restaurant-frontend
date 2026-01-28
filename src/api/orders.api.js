// src/api/orders.api.js
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

export async function submitCustomerOrder(token, body) {
  const res = await api.post(ENDPOINTS.public.submitOrder(token), body);
  return res.data;
}

export async function getDraftByTable(tableId) {
  const res = await api.get(ENDPOINTS.orders.draftByTable(tableId));
  return res.data;
}

export async function confirmDraft(orderId) {
  const res = await api.post(ENDPOINTS.orders.confirm(orderId));
  return res.data;
}

export async function rejectDraft(orderId, reason) {
  const res = await api.post(ENDPOINTS.orders.reject(orderId), { reason });
  return res.data;
}

export async function getOrderDetail(orderId) {
  const res = await api.get(ENDPOINTS.orders.detail(orderId));
  return res.data;
}

export async function addOrderItem(orderId, body) {
  const res = await api.post(ENDPOINTS.orders.addItem(orderId), body);
  return res.data;
}

export async function updateOrderItem(orderId, itemId, body) {
  const res = await api.put(ENDPOINTS.orders.updateItem(orderId, itemId), body);
  return res.data;
}

export async function deleteOrderItem(orderId, itemId) {
  const res = await api.delete(ENDPOINTS.orders.deleteItem(orderId, itemId));
  return res.data;
}

export async function updateItemStatus(orderId, itemId, body) {
  const res = await api.post(
    ENDPOINTS.orders.updateItemStatus(orderId, itemId),
    body
  );
  return res.data;
}

export async function getBill(orderId) {
  const res = await api.get(ENDPOINTS.orders.bill(orderId));
  return res.data;
}

export async function checkout(orderId, body) {
  const res = await api.post(ENDPOINTS.orders.checkout(orderId), body);
  return res.data;
}
