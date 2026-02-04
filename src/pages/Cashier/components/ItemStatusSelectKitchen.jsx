import { useMemo, useState } from "react";
import { setItemStatus } from "../../../api/waiter.api"; 

const STATUS_OPTIONS = [
  { value: "PENDING", label: "PENDING" },
  { value: "COOKING", label: "COOKING" },
  { value: "READY", label: "READY" },
  
   { value: "CANCELLED", label: "Hủy" },
];

export default function ItemStatusSelectKitchen({ item, orderId, reload }) {
  const [saving, setSaving] = useState(false);

  const itemId = useMemo(
    () => item?.id ?? item?.itemId ?? item?.orderItemId,
    [item]
  );

  const currentStatus = item?.status ?? "PENDING";

  const options = useMemo(() => {
    if (currentStatus === "PENDING") return STATUS_OPTIONS;
    if (currentStatus === "COOKING")
      return STATUS_OPTIONS.filter((s) => s.value !== "PENDING");
    if (currentStatus === "READY")
      return STATUS_OPTIONS.filter((s) => s.value === "READY");
    return STATUS_OPTIONS;
  }, [currentStatus]);

  const missing = !orderId || !itemId;
  const disabled = missing || saving;

  const onChange = async (e) => {
    const nextStatus = e.target.value;
    if (disabled) return;
    if (nextStatus === currentStatus) return;

    let cancelReason = "";

    // Nếu bạn bật CANCELLED ở STATUS_OPTIONS thì dùng đoạn này:
    // if (nextStatus === "CANCELLED") {
    //   cancelReason = window.prompt("Lý do hủy món?")?.trim() || "";
    //   if (!cancelReason) return; // user cancel prompt hoặc để trống
    // }

    setSaving(true);
    try {
      await setItemStatus(orderId, itemId, nextStatus, cancelReason);
      await reload?.();
    } catch (err) {
      console.error("setItemStatus failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <select
        value={currentStatus}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: disabled ? "#f3f4f6" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {missing && (
        <div style={{ fontSize: 12, color: "#ef4444" }}>
          Thiếu {(!orderId ? "orderId" : "")}
          {!orderId && !itemId ? " & " : ""}
          {!itemId ? "itemId" : ""} nên chưa đổi trạng thái được.
        </div>
      )}

      {saving && (
        <div style={{ fontSize: 12, color: "#6b7280" }}>Đang lưu...</div>
      )}
    </div>
  );
}
