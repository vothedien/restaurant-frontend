import { useEffect, useMemo, useState } from "react";
import { getErrMsg } from "../../utils/httpError.js";
import { formatVND } from "../../utils/money.js";
import {
  adminListCategories,
  adminCreateCategory,
  adminListMenuItems,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
  adminUploadMenuImage,
} from "../../api/admin.api.js";

export default function MenuTab() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // filter/search
  const [search, setSearch] = useState("");
  const [filterCatId, setFilterCatId] = useState("");

  // toggles
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);

  // create category
  const [catName, setCatName] = useState("");

  // create item form
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  // upload state (ẩn link)
  const [imageUrl, setImageUrl] = useState(""); // lưu ngầm
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    setMsg("");
    try {
      setLoading(true);
      const [c, m] = await Promise.all([adminListCategories(), adminListMenuItems()]);
      setCategories(Array.isArray(c) ? c : []);
      setItems(Array.isArray(m) ? m : []);
    } catch (e) {
      setMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory() {
    setMsg("");
    if (!catName.trim()) return setMsg("Nhập tên category.");
    try {
      setLoading(true);
      await adminCreateCategory({ name: catName.trim() });
      setCatName("");
      setShowCreateCategory(false);
      await load();
      setMsg("✅ Tạo category thành công.");
    } catch (e) {
      setMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file) {
    setMsg("");
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    try {
      setUploading(true);
      const res = await adminUploadMenuImage(file); // { imageUrl }
      setImageUrl(res.imageUrl);
      setMsg("✅ Upload ảnh thành công.");
    } catch (e) {
      setImageUrl("");
      setMsg("Upload ảnh thất bại: " + getErrMsg(e));
    } finally {
      setUploading(false);
    }
  }

  async function createItem() {
    setMsg("");
    if (!categoryId) return setMsg("Chọn category.");
    if (!name.trim()) return setMsg("Nhập tên món.");
    if (!imageUrl) return setMsg("Bạn chưa upload ảnh món ăn.");

    try {
      setLoading(true);
      await adminCreateMenuItem({
        categoryId: Number(categoryId),
        name: name.trim(),
        price: Number(price),
        isAvailable,
        imageUrl,
      });

      setName("");
      setPrice(0);
      setIsAvailable(true);
      setImageUrl("");
      setImagePreview("");
      setShowCreateItem(false);
      await load();
      setMsg("✅ Tạo món thành công.");
    } catch (e) {
      setMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(edit) {
    setMsg("");
    try {
      setLoading(true);
      await adminUpdateMenuItem(edit.id, {
        categoryId: Number(edit.categoryId),
        name: edit.name,
        price: Number(edit.price),
        isAvailable: !!edit.isAvailable,
        imageUrl: edit.imageUrl || null,
      });
      await load();
      setMsg("✅ Đã lưu thay đổi.");
    } catch (e) {
      setMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function delItem(id) {
    setMsg("");
    if (!window.confirm("Xóa món này?")) return;
    try {
      setLoading(true);
      await adminDeleteMenuItem(id);
      await load();
      setMsg("✅ Đã xóa món.");
    } catch (e) {
      setMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      const okName = !q || (it.name || "").toLowerCase().includes(q);
      const okCat = !filterCatId || String(it.categoryId) === String(filterCatId);
      return okName && okCat;
    });
  }, [items, search, filterCatId]);

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Menu Items</div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateCategory((v) => !v)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              {showCreateCategory ? "Đóng category" : "Tạo category"}
            </button>
            <button
              onClick={() => setShowCreateItem((v) => !v)}
              className="rounded-xl bg-black px-3 py-2 text-sm text-white"
            >
              {showCreateItem ? "Đóng tạo món" : "Tạo món"}
            </button>
            <button onClick={load} className="rounded-xl border px-3 py-2 text-sm">
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row md:items-end gap-2">
          <input
            className="rounded-xl border px-3 py-2 text-sm flex-1"
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl border px-3 py-2 text-sm w-60"
            value={filterCatId}
            onChange={(e) => setFilterCatId(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {msg && <div className="mt-3 text-sm text-red-600">{msg}</div>}

        <div className="mt-4 grid gap-3">
          {filtered.map((it) => (
            <MenuItemRow
              key={it.id}
              row={it}
              categories={categories}
              onSave={saveItem}
              onDelete={delItem}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-slate-500">Không có món.</div>
          )}
        </div>
      </div>

      {/* Create category below */}
      {showCreateCategory && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="font-semibold">Create Category</div>
          <div className="mt-3 flex flex-col md:flex-row gap-2 md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Name</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="vd: Đồ uống"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>
            <button
              onClick={createCategory}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Create item below */}
      {showCreateItem && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="font-semibold">Create Menu Item</div>

          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- chọn --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (id={c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Price</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                isAvailable
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Image (Upload to ImgBB)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                type="file"
                accept="image/*"
                onChange={(e) => uploadFile(e.target.files?.[0])}
                disabled={uploading}
              />
              <div className="mt-2 flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="text-xs text-slate-500">
                  {uploading ? "Uploading..." : imageUrl ? "✅ Uploaded" : "Chưa upload"}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={createItem}
                disabled={loading || uploading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Create item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemRow({ row, categories, onSave, onDelete }) {
  const [edit, setEdit] = useState({ ...row });
  const [uploading, setUploading] = useState(false);

  async function uploadNew(file) {
    if (!file) return;
    try {
      setUploading(true);
      const res = await adminUploadMenuImage(file);
      setEdit((p) => ({ ...p, imageUrl: res.imageUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {edit.imageUrl ? (
            <img
              src={edit.imageUrl}
              alt={edit.name}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}
        </div>

        <div className="flex-1 grid gap-2">
          <div className="grid md:grid-cols-2 gap-2">
            <input
              className="rounded-xl border px-3 py-2"
              value={edit.name}
              onChange={(e) => setEdit((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="rounded-xl border px-3 py-2"
              type="number"
              min={0}
              value={edit.price}
              onChange={(e) => setEdit((p) => ({ ...p, price: e.target.value }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <select
              className="rounded-xl border px-3 py-2"
              value={edit.categoryId}
              onChange={(e) => setEdit((p) => ({ ...p, categoryId: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!edit.isAvailable}
                onChange={(e) => setEdit((p) => ({ ...p, isAvailable: e.target.checked }))}
              />
              isAvailable
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">Change image</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              type="file"
              accept="image/*"
              onChange={(e) => uploadNew(e.target.files?.[0])}
              disabled={uploading}
            />
            <div className="mt-1 text-xs text-slate-500">
              {uploading ? "Uploading..." : "Chọn file để đổi ảnh."}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <b>ID:</b> {row.id} • <b>Category:</b> {row.categoryName} • <b>Price:</b> {formatVND(edit.price)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSave(edit)}
                className="rounded-xl bg-black px-4 py-2 text-white"
              >
                Save
              </button>
              <button
                onClick={() => onDelete(row.id)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
