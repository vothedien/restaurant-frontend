import React from "react";
import { setItemStatus } from "../../../api/waiter.api";

// ✅ Thêm prop isKitchen (mặc định false)
export default function ItemStatusSelect({ item, orderId, reload, disabled = false, isKitchen = false }) {
  const itemId = item.itemId ?? item.id;
  const status = item.status || "DRAFT"; 

  // Helper màu sắc
  const getStatusColor = (s) => {
    if (s === "READY") return "#16a34a";   // Xanh lá
    if (s === "COOKING") return "#ea580c"; // Cam
    if (s === "SERVED") return "#78350f";  // Nâu
    if (s === "CANCELED") return "#dc2626"; // Đỏ
    if (s === "PENDING") return "#0ea5e9"; // Xanh dương
    return "#666";
  };

  // ✅ LOGIC MỚI: Phân quyền
  const allowedNext = (cur) => {
    // 1. NẾU LÀ BẾP / THU NGÂN (Quyền cao hơn)
    if (isKitchen) {
      switch (cur) {
        case "PENDING": return ["COOKING", "CANCELED"]; // Nhận đơn hoặc Hủy
        case "COOKING": return ["READY", "CANCELED"];   // Nấu xong
        case "READY":   return ["SERVED"];              // Hỗ trợ bấm luôn Served
        case "SERVED":  return [];
        case "CANCELED": return [];
        default: return ["PENDING"]; // Fallback
      }
    }

    // 2. NẾU LÀ WAITER (Chỉ được bưng món)
    switch (cur) {
      case "READY":
        return ["SERVED"]; 
      default:
        return [];
    }
  };

  const options = allowedNext(status);
  const borderColor = getStatusColor(status);

  // Xử lý sự kiện thay đổi
  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === status) return;

    if (!orderId || !itemId) return alert("Thiếu ID!");

    // Nếu hủy món, hỏi lý do
    let cancelReason = "";
    if (newStatus === "CANCELED") {
        cancelReason = window.prompt("Lý do hủy món?", "Hết nguyên liệu / Khách đổi ý");
        if (cancelReason === null) {
             e.target.value = status; // Revert nếu user bấm Cancel
             return;
        }
    }

    try {
      await setItemStatus(orderId, itemId, newStatus, cancelReason); 
      await reload();
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
      e.target.value = status; // Revert
    }
  };

  // --- RENDER GIAO DIỆN ---

  // Trường hợp: Không có action tiếp theo -> Hiển thị Badge tĩnh
  if (options.length === 0) {
    return (
      <div
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          border: `1px solid ${borderColor}`,
          color: borderColor,
          background: "#f9fafb",
          fontWeight: "700",
          fontSize: "12px",
          textAlign: "center",
          whiteSpace: "nowrap",
          opacity: status === "DRAFT" ? 0.6 : 1
        }}
      >
        {status}
      </div>
    );
  }

  // Trường hợp: Có action -> Hiển thị Select
  return (
    <div className="relative">
        <select
        className="menuBadge"
        style={{
            width: "100%",
            padding: "4px 8px",
            borderRadius: "6px",
            border: `2px solid ${borderColor}`,
            color: "white",
            background: borderColor,
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            outline: "none",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
        value={status}
        onChange={handleChange}
        disabled={disabled}
        >
        {/* Option hiện tại */}
        <option value={status} style={{color: 'black'}}> {status} </option>
        
        {/* Các option chuyển đổi */}
        {options.map((s) => (
            <option key={s} value={s} style={{color: 'black'}}>
            ➔ {s}
            </option>
        ))}
        </select>
    </div>
  );
}