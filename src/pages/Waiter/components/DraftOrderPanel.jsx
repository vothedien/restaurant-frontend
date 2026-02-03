// DraftOrderPanel.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { getDraftByTable, confirmOrder, rejectOrder } from "../../../api/waiter.api";
import AddItemForm from "./AddItemForm";
import OrderItemRow from "./OrderItemRow";

export default function DraftOrderPanel({ table, reloadTables }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const orderId = useMemo(() => order?.orderId || null, [order]);

  const loadDraft = useCallback(async () => {
    setError("");
    try {
      const data = await getDraftByTable(table.id);
      setOrder(data);
    } catch (e) {
      setOrder(null);
      setError(e?.response?.data?.message || "Không có đơn nháp cho bàn này.");
    }
  }, [table.id]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const handleConfirm = async () => {
    if (!orderId) return;
    if (!window.confirm("Xác nhận đơn (DRAFT → ACTIVE)?")) return;

    try {
      setActionLoading(true);
      await confirmOrder(orderId);

      // reload tables để currentOrderId / status cập nhật
      await reloadTables();

      // reload draft để UI mất draft ngay (API draft sẽ fail -> setOrder(null))
      await loadDraft();
    } catch (e) {
      alert("Lỗi confirm: " + (e?.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!orderId) return;
    const reason = window.prompt("Lý do từ chối đơn?", "Hết món, vui lòng chọn món khác");
    if (!reason) return;

    try {
      setActionLoading(true);
      await rejectOrder(orderId, reason);

      await reloadTables();
      await loadDraft();
    } catch (e) {
      alert("Lỗi reject: " + (e?.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const itemsList = order?.items || [];

  // ✅ style nút để khỏi “dính” do box-shadow của .addBtn chồng nhau
  const btnBase = {
    width: "100%",
    padding: "14px",
    borderRadius: 16,
    boxShadow: "none", // quan trọng: bỏ shadow to của .addBtn
    margin: 0,
  };

  return (
    <div className="sectionCard">
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">📝</div>
          <h2 className="menuTitle">Draft - Bàn {table.code}</h2>
        </div>
        <div className="flex gap-2">
          <span className="menuBadge">{table.status}</span>
          {orderId && <span className="menuBadge bg-white border-gray-300">#{orderId}</span>}
          <span className="menuBadge bg-white border-gray-300">DRAFT</span>
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        {itemsList.length > 0 ? (
          itemsList.map((it) => (
            <OrderItemRow
              key={it.itemId || it.id}
              item={it}
              orderId={orderId}
              reload={loadDraft}
              orderStatus={"DRAFT"}
              hideStatusSelect={true}
            />
          ))
        ) : (
          <div className="menuDesc" style={{ textAlign: "center", padding: "20px" }}>
            {error ? <span style={{ color: "orange" }}>{error}</span> : "Chưa có món nào trong draft."}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #ddd", paddingTop: "15px", opacity: actionLoading ? 0.6 : 1 }}>
        <AddItemForm orderId={orderId} reload={loadDraft} orderStatus={"DRAFT"} />
      </div>

      {/* ✅ Nút Confirm/Reject: tách rõ + spacer */}
      <div style={{ marginTop: "20px", borderTop: "2px solid #eee", paddingTop: "15px" }}>
        <button
          onClick={handleConfirm}
          className="addBtn"
          style={{
            ...btnBase,
            background: "var(--mq-brown)",
            opacity: actionLoading ? 0.7 : 1,
            cursor: actionLoading ? "not-allowed" : "pointer",
          }}
          disabled={actionLoading || !orderId || itemsList.length === 0}
          title={itemsList.length === 0 ? "Draft chưa có món" : ""}
        >
          {actionLoading ? "Đang xử lý..." : "Xác nhận đơn (Confirm)"}
        </button>

        {/* spacer chắc chắn nhìn thấy */}
        <div style={{ height: 14 }} />

        <button
          onClick={handleReject}
          className="addBtn"
          style={{
            ...btnBase,
            background: "#ef4444",
            opacity: actionLoading ? 0.7 : 1,
            cursor: actionLoading ? "not-allowed" : "pointer",
          }}
          disabled={actionLoading || !orderId}
        >
          {actionLoading ? "Đang xử lý..." : "Từ chối (Reject)"}
        </button>
      </div>
    </div>
  );
}
