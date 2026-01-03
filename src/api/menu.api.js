import { api } from "./client";
import { EP } from "./endpoints";

/**
 * BE expected item fields (khuyến nghị):
 * { id, name, price, imageUrl, isAvailable }
 */
export async function getPublicMenu() {
  const res = await api.get(EP.public.menu);

  const list = Array.isArray(res.data) ? res.data : [];

  // Normalize nhẹ để FE đỡ crash nếu thiếu field
  return list.map((it) => ({
    id: it.id,
    name: it.name ?? "",
    price: Number(it.price ?? 0),
    imageUrl: it.imageUrl ?? "",
    isAvailable: it.isAvailable !== false, // default true
  }));
}
