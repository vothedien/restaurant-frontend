/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api";
import { Plus, Upload, Edit, Trash2, X, Save } from "lucide-react";

export default function MenuTab() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", price: 0, categoryId: "", imageUrl: "", isAvailable: true
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [menuData, catData] = await Promise.all([adminApi.getMenuItems(), adminApi.getCategories()]);
    setItems(menuData);
    setCategories(catData);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: res.imageUrl }));
    } catch (e) { alert("Upload ảnh thất bại!"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && editing.id) await adminApi.updateMenuItem(editing.id, formData);
      else await adminApi.createMenuItem(formData);
      
      alert("Lưu món ăn thành công!");
      setEditing(null);
      loadData();
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa món này khỏi menu?")) {
      await adminApi.deleteMenuItem(id);
      loadData();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#431407" }}>Quản lý Thực đơn</h2>
        <button 
          onClick={() => { setEditing({}); setFormData({ name: "", price: 0, categoryId: categories[0]?.id || "", imageUrl: "", isAvailable: true }); }}
          style={{ background: "#ea580c", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", gap: 8, fontWeight: "bold" }}
        >
          <Plus size={18} /> Thêm Món
        </button>
      </div>

      {editing ? (
        <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", maxWidth: 600 }}>
          <h3 style={{ marginBottom: 16 }}>{editing.id ? "Sửa món ăn" : "Thêm món mới"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Tên món:</label>
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} 
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Giá bán (VNĐ):</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} 
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Danh mục:</label>
              <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Hình ảnh:</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />}
                <label style={{ cursor: "pointer", background: "#f3f4f6", padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Upload size={16} /> {uploading ? "Đang tải lên..." : "Chọn ảnh"}
                  <input type="file" hidden onChange={handleUpload} accept="image/*" />
                </label>
              </div>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" style={{ flex: 1, background: "#16a34a", color: "white", padding: 12, borderRadius: 8, border: "none", cursor: "pointer", display: 'flex', justifyContent: 'center', gap: 6 }}>
                <Save size={18} /> Lưu món
              </button>
              <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, background: "#ef4444", color: "white", padding: 12, borderRadius: 8, border: "none", cursor: "pointer", display: 'flex', justifyContent: 'center', gap: 6 }}>
                <X size={18} /> Hủy
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: "white", borderRadius: 16, border: "1px solid #fed7aa", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <img src={item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt={item.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 18, color: "#431407" }}>{item.name}</h4>
                  <span style={{ fontSize: 16, fontWeight: "bold", color: "#ea580c" }}>{item.price?.toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => { setEditing(item); setFormData(item); }} style={{ flex: 1, background: "#eff6ff", color: "#2563eb", border: "none", padding: 8, borderRadius: 6, cursor: "pointer", display: "flex", justifyContent: "center" }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ flex: 1, background: "#fef2f2", color: "#dc2626", border: "none", padding: 8, borderRadius: 6, cursor: "pointer", display: "flex", justifyContent: "center" }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}