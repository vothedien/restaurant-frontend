/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api";
import { Edit, Trash2, Plus, Save, X, ExternalLink, Copy, QrCode } from "lucide-react";

export default function TablesTab() {
  const [tables, setTables] = useState([]);
  const [editing, setEditing] = useState(null); 
  const [formData, setFormData] = useState({ code: "", capacity: 4, status: "AVAILABLE" });

  // Lấy domain hiện tại (ví dụ: http://localhost:5173)
  const appUrl = window.location.origin;

  useEffect(() => { loadTables(); }, []);

  const loadTables = async () => {
    try {
      const data = await adminApi.getTables();
      setTables(data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && editing.id) {
        await adminApi.updateTable(editing.id, formData);
        alert("Cập nhật bàn thành công!");
      } else {
        await adminApi.createTable(formData);
        alert("Thêm bàn mới thành công!");
      }
      setEditing(null);
      loadTables();
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa bàn này?")) {
      await adminApi.deleteTable(id);
      loadTables();
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    alert("Đã copy token: " + token);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#431407" }}>Quản lý Bàn ăn</h2>
        <button 
          onClick={() => { setEditing({}); setFormData({ code: "", capacity: 4, status: "AVAILABLE" }); }}
          style={{ background: "#ea580c", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, display: "flex", gap: 8, cursor: "pointer", fontWeight: "bold" }}
        >
          <Plus size={18} /> Thêm Bàn
        </button>
      </div>

      {editing ? (
        <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", maxWidth: 500 }}>
          <h3 style={{ marginBottom: 16, color: '#431407', fontWeight: 700 }}>{editing.id ? "Sửa thông tin bàn" : "Thêm bàn mới"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Tên bàn (Mã):</label>
              <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} 
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} placeholder="VD: T01" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Sức chứa (người):</label>
              <input type="number" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} 
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Trạng thái mặc định:</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
                <option value="AVAILABLE">Trống (AVAILABLE)</option>
                <option value="OCCUPIED">Có khách (OCCUPIED)</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" style={{ flex: 1, background: "#16a34a", color: "white", border: "none", padding: 12, borderRadius: 8, fontWeight: "bold", cursor: "pointer", display: 'flex', justifyContent:'center', gap: 6 }}>
                <Save size={18} /> Lưu lại
              </button>
              <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, background: "#ef4444", color: "white", border: "none", padding: 12, borderRadius: 8, fontWeight: "bold", cursor: "pointer", display: 'flex', justifyContent:'center', gap: 6 }}>
                <X size={18} /> Hủy
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {tables.map(table => {
            const token = table.qrToken || "NO_TOKEN";
  
            const customerLink = `${appUrl}/customer/${token}`;
            
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(customerLink)}`;

            return (
              <div key={table.id} style={{ background: "white", padding: 20, borderRadius: 16, border: "1px solid #fed7aa", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: "bold", color: "#ea580c", marginBottom: 4 }}>{table.code}</div>
                        <div style={{ color: "#78716c", fontSize: 14 }}>Sức chứa: {table.capacity} người</div>
                    </div>
                    <span style={{ 
                        padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: "bold",
                        background: table.status === "AVAILABLE" ? "#dcfce7" : "#ffedd5",
                        color: table.status === "AVAILABLE" ? "#166534" : "#9a3412",
                        textTransform: 'uppercase'
                    }}>
                        {table.status}
                    </span>
                </div>

                <div style={{ marginTop: 16, background: "#fff7ed", padding: 12, borderRadius: 12, border: "1px dashed #fdba74", display: 'flex', gap: 12 }}>
                    <div style={{ background: 'white', padding: 4, borderRadius: 8, border: '1px solid #eee' }}>
                        <img 
                           src={qrImageUrl} 
                           alt="QR Code" 
                           style={{ width: 80, height: 80, display: 'block' }} 
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#9a3412", textTransform: "uppercase", marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <QrCode size={12}/> Mã Token:
                        </div>
                        
                        {/* Token Text */}
                        <div 
                          title={token}
                          style={{ 
                            fontSize: 13, fontWeight: 600, color: "#431407", 
                            fontFamily: 'monospace', marginBottom: 8, background: '#fff', 
                            padding: '4px 6px', borderRadius: 4, border: '1px solid #e5e7eb',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}
                        >
                            {token}
                        </div>
                        
                        <div style={{display: 'flex', gap: 8}}>
                             {/* Nút Test Link */}
                            <a 
                                href={customerLink} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: 4, 
                                    fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 
                                }}
                            >
                                <ExternalLink size={12}/> Mở Link
                            </a>
                             {/* Nút Copy */}
                            <button 
                                onClick={() => copyToken(token)}
                                style={{
                                    border: 'none', background: 'none', cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 12, color: '#4b5563', fontWeight: 600
                                }}
                            >
                                <Copy size={12}/> Copy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  <button onClick={() => { setEditing(table); setFormData(table); }} 
                    style={{ background: "#eff6ff", color: "#2563eb", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Edit size={16} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(table.id)} 
                    style={{ background: "#fef2f2", color: "#dc2626", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}