// src/api/menu.api.js
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

export async function getPublicMenu() {
  const res = await api.get(ENDPOINTS.public.menu);
  const list = Array.isArray(res.data) ? res.data : [];

  return list.map((it) => ({
    id: it.id,
    name: it.name ?? "Món chưa đặt tên",
    price: Number(it.price ?? 0),
    imageUrl: it.imageUrl ?? "",
    isAvailable: it.isAvailable !== false,
    description: it.description ?? "",
  }));
}
