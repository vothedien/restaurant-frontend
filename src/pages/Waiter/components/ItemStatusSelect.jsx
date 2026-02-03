import { setItemStatus } from "../../../api/waiter.api";

export default function ItemStatusSelect({ item, orderId, reload, disabled = false }) {
  const itemId = item.itemId ?? item.id;
  const status = item.status || "DRAFT"; // ✅ hợp lý hơn: item mới thường là DRAFT

  const getStatusColor = (s) => {
    if (s === "READY") return "#16a34a";
    if (s === "COOKING") return "#ea580c";
    if (s === "SERVED") return "#78350f";
    if (s === "CANCELED") return "#dc2626";
    if (s === "PENDING") return "#0ea5e9";
    return "#666";
  };

  // ✅ Rule đúng spec:
  // DRAFT -> PENDING -> COOKING -> READY -> SERVED
  // Huỷ: PENDING/COOKING -> CANCELED
  const allowedNext = (cur) => {
    switch (cur) {
      case "DRAFT":
        return ["PENDING"]; // ✅ bỏ CANCELED
      case "PENDING":
        return ["COOKING", "CANCELED"];
      case "COOKING":
        return ["READY", "CANCELED"];
      case "READY":
        return ["SERVED"];
      case "SERVED":
      case "CANCELED":
        return [];
      default:
        return ["PENDING"];
    }
  };

  const options = allowedNext(status);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (!orderId) return alert("Thiếu orderId!");
    if (!itemId) return alert("Thiếu itemId!");

    let cancelReason = "";
    if (newStatus === "CANCELED") {
      cancelReason = window.prompt("Lý do hủy món?", "Khách đổi món / Hết món") || "";
      if (!cancelReason.trim()) {
        await reload(); // revert
        return;
      }
    }

    try {
      await setItemStatus(orderId, itemId, newStatus, cancelReason);
      await reload();
    } catch (err) {
      alert("Lỗi đổi trạng thái: " + (err.response?.data?.message || err.message));
      await reload();
    }
  };

  const isLocked = disabled || status === "SERVED" || status === "CANCELED";
  const borderColor = getStatusColor(status);

  // Không có bước tiếp theo => chỉ show current, disable
  if (options.length === 0) {
    return (
      <select
        className="menuBadge"
        disabled
        style={{
          border: `1px solid ${borderColor}`,
          color: borderColor,
          background: "white",
          cursor: "not-allowed",
          outline: "none",
        }}
        value={status}
        readOnly
      >
        <option value={status}>{status}</option>
      </select>
    );
  }

  return (
    <select
      className="menuBadge"
      disabled={isLocked}
      style={{
        border: `1px solid ${borderColor}`,
        color: borderColor,
        background: "white",
        cursor: isLocked ? "not-allowed" : "pointer",
        outline: "none",
      }}
      value={status}
      onChange={handleChange}
    >
      <option value={status}>{status}</option>

      {options.map((s) => (
        <option key={s} value={s}>
          → {s}
        </option>
      ))}
    </select>
  );
}
