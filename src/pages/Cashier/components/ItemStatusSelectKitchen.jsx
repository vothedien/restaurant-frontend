import { useMemo, useState } from "react";
import { setItemStatus } from "../../../api/waiter.api";

// ✅ chuẩn hoá status cho đúng với waiter (CANCELED)
const STATUS_OPTIONS = [
  { value: "PENDING", label: "PENDING" },
  { value: "COOKING", label: "COOKING" },
  { value: "READY", label: "READY" },
  { value: "CANCELED", label: "CANCEL" }, // ✅ English
];

function broadcastUpdate(payload) {
  try {
    const ch = new BroadcastChannel("mq_order_events");
    ch.postMessage(payload);
    ch.close();
  } catch {
    // ignore
  }
}

export default function ItemStatusSelectKitchen({ item, orderId, reload }) {
  const [saving, setSaving] = useState(false);

  const itemId = useMemo(() => item?.id ?? item?.itemId ?? item?.orderItemId, [item]);
  const currentStatus = item?.status ?? "PENDING";

  // rule chuyển trạng thái kiểu bếp:
  // PENDING -> COOKING/READY/CANCELED
  // COOKING -> READY/CANCELED
  // READY -> READY (khóa)
  const options = useMemo(() => {
    if (currentStatus === "PENDING") return STATUS_OPTIONS;
    if (currentStatus === "COOKING")
      return STATUS_OPTIONS.filter((s) => s.value !== "PENDING");
    if (currentStatus === "READY") return STATUS_OPTIONS.filter((s) => s.value === "READY");
    if (currentStatus === "CANCELED") return STATUS_OPTIONS.filter((s) => s.value === "CANCELED");
    return STATUS_OPTIONS;
  }, [currentStatus]);

  const missing = !orderId || !itemId;
  const disabled = missing || saving || currentStatus === "READY" || currentStatus === "CANCELED";

  const onChange = async (e) => {
    const nextStatus = e.target.value;
    if (disabled) return;
    if (nextStatus === currentStatus) return;

    let cancelReason = "";

    // nếu chọn CANCEL thì hỏi lý do
    if (nextStatus === "CANCELED") {
      cancelReason = window.prompt("Cancel reason?", "Out of stock / Customer changed")?.trim() || "";
      if (!cancelReason) return;
    }

    setSaving(true);
    try {
      await setItemStatus(orderId, itemId, nextStatus, cancelReason);
      await reload?.();

      broadcastUpdate({
        type: "ITEM_STATUS_UPDATED",
        orderId,
        itemId,
        status: nextStatus,
      });
    } catch (err) {
      console.error("setItemStatus failed:", err);
      alert("Update status failed: " + (err?.response?.data?.message || err.message));
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
          Missing {(!orderId ? "orderId" : "")}
          {!orderId && !itemId ? " & " : ""}
          {!itemId ? "itemId" : ""} so cannot update.
        </div>
      )}

      {saving && <div style={{ fontSize: 12, color: "#6b7280" }}>Saving...</div>}
    </div>
  );
}
