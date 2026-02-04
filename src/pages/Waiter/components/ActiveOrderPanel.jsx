/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getDraftByTable,
  getOrder,
  confirmOrder,
  rejectOrder,
  requestBill,
  setCleaning,
  setAvailable,
  setItemStatus,
} from "../../../api/waiter.api";

import AddItemForm from "./AddItemForm";
import OrderItemRow from "./OrderItemRow";

export default function ActiveOrderPanel({ table, reloadTables }) {
  const [order, setOrder] = useState(null); // draft hoặc active
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const orderId = useMemo(
    () => order?.orderId || table.currentOrderId || null,
    [order, table.currentOrderId]
  );

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) ưu tiên DRAFT theo tableId
      const draft = await getDraftByTable(table.id);
      setOrder(draft);
    } catch (err) {
      // 2) không có draft -> load ACTIVE bằng currentOrderId
      const currentId = table.currentOrderId;

      if (currentId) {
        try {
          const active = await getOrder(currentId);
          setOrder(active);
          return;
        } catch (e2) {
          console.warn("Không load được ACTIVE order:", e2);
          setOrder(null);
          setError(e2?.response?.data?.message || "Không tải được đơn ACTIVE.");
        }
      } else {
        setOrder(null);
        setError("Không tìm thấy đơn nháp và bàn không có currentOrderId.");
      }
    } finally {
      setLoading(false);
    }
  }, [table.id, table.currentOrderId]);

  // Load lần đầu khi đổi bàn / đổi currentOrderId
  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // ✅ CHỈ reload khi cashier (hoặc tab khác) bắn event
  useEffect(() => {
    // BroadcastChannel chỉ hoạt động giữa các tab cùng origin (localhost:5173)
    const ch = new BroadcastChannel("mq_order_events");

    const onMessage = (ev) => {
      const msg = ev?.data;
      if (!msg || typeof msg !== "object") return;

      // ví dụ msg:
      // { type: "ITEM_STATUS_UPDATED", orderId: 19, itemId: 123, status: "COOKING" }
      // { type: "ORDER_UPDATED", orderId: 19 }

      // Nếu orderId khớp order đang mở thì reload
      const sameOrder =
        msg.orderId != null && String(msg.orderId) === String(orderId);

      // Hoặc nếu msg có tableId và trùng bàn
      const sameTable =
        msg.tableId != null && String(msg.tableId) === String(table.id);

      if (sameOrder || sameTable) {
        // chỉ reload nếu không đang bấm thao tác (đỡ giật)
        if (!actionLoading) {
          loadOrder();
          if (typeof reloadTables === "function") reloadTables();
        }
      }
    };

    ch.addEventListener("message", onMessage);

    return () => {
      ch.removeEventListener("message", onMessage);
      ch.close();
    };
  }, [orderId, table.id, loadOrder, reloadTables, actionLoading]);

  const orderStatus = order?.status;
  const isDraft = orderStatus === "DRAFT";
  const isActive = orderStatus === "ACTIVE";

  const handleConfirm = async () => {
    if (!orderId) return;
    if (!window.confirm("Xác nhận chuyển đơn vào bếp?")) return;

    try {
      setActionLoading(true);

      await confirmOrder(orderId);

      // Ép item DRAFT -> PENDING
      const draftItems =
        order?.items?.filter((i) => !i.status || i.status === "DRAFT") || [];
      if (draftItems.length > 0) {
        await Promise.all(
          draftItems.map((item) => {
            const itemId = item.itemId || item.id;
            return setItemStatus(orderId, itemId, "PENDING", "");
          })
        );
      }

      await reloadTables();
      await loadOrder();

      // bắn event để tab khác biết (optional)
      try {
        const ch = new BroadcastChannel("mq_order_events");
        ch.postMessage({ type: "ORDER_UPDATED", orderId, tableId: table.id });
        ch.close();
      } catch {}
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
      await loadOrder();

      try {
        const ch = new BroadcastChannel("mq_order_events");
        ch.postMessage({ type: "ORDER_UPDATED", orderId, tableId: table.id });
        ch.close();
      } catch {}
    } catch (e) {
      alert("Lỗi reject: " + (e?.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestBill = async () => {
    if (!window.confirm("Khách yêu cầu thanh toán?")) return;

    try {
      setActionLoading(true);
      await requestBill(table.id);
      await reloadTables();
      await loadOrder();

      try {
        const ch = new BroadcastChannel("mq_order_events");
        ch.postMessage({ type: "TABLE_UPDATED", tableId: table.id, orderId });
        ch.close();
      } catch {}
    } catch (e) {
      alert("Lỗi yêu cầu tính tiền: " + (e?.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetCleaning = async () => {
    if (!window.confirm("Chuyển sang trạng thái CLEANING?")) return;

    try {
      setActionLoading(true);
      await setCleaning(table.id);
      await reloadTables();
      await loadOrder();

      try {
        const ch = new BroadcastChannel("mq_order_events");
        ch.postMessage({ type: "TABLE_UPDATED", tableId: table.id, orderId });
        ch.close();
      } catch {}
    } catch (e) {
      alert("Lỗi set cleaning: " + (e?.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishCleaning = async () => {
    if (!window.confirm("Dọn xong, trả bàn AVAILABLE?")) return;

    try {
      setActionLoading(true);
      await setAvailable(table.id);
      await reloadTables();
      await loadOrder();

      try {
        const ch = new BroadcastChannel("mq_order_events");
        ch.postMessage({ type: "TABLE_UPDATED", tableId: table.id, orderId });
        ch.close();
      } catch {}
    } catch (e) {
      alert("Lỗi trả bàn: " + (e?.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualReset = async () => {
    const confirmMsg =
      `⚠️ RESET BÀN (THEO TRANSITION)\n\n` +
      `Hệ thống sẽ cố đưa bàn về AVAILABLE theo trạng thái hiện tại:\n` +
      `- OCCUPIED -> REQUESTING_BILL -> CLEANING -> AVAILABLE\n` +
      `- REQUESTING_BILL -> CLEANING -> AVAILABLE\n` +
      `- CLEANING -> AVAILABLE\n\nBạn chắc chắn?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);

      if (table.status === "OCCUPIED") {
        await requestBill(table.id);
        await setCleaning(table.id);
        await setAvailable(table.id);
      } else if (table.status === "REQUESTING_BILL") {
        await setCleaning(table.id);
        await setAvailable(table.id);
      } else if (table.status === "CLEANING") {
        await setAvailable(table.id);
      } else {
        await setAvailable(table.id);
      }

      alert("✅ Đã reset bàn về AVAILABLE!");
      await reloadTables();
      await loadOrder();

      try {
        const ch = new BroadcastChannel("mq_order_events");
        ch.postMessage({ type: "TABLE_UPDATED", tableId: table.id, orderId });
        ch.close();
      } catch {}
    } catch (err) {
      alert("❌ Reset thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const itemsList = order?.items || [];

  const btnBase = {
    width: "100%",
    padding: "14px",
    borderRadius: 16,
    boxShadow: "none",
    margin: 0,
  };

  return (
    <div className="sectionCard">
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">🔥</div>
          <h2 className="menuTitle">Bàn: {table.code}</h2>
        </div>

        <div className="flex gap-2">
          <span className="menuBadge">{table.status}</span>
          {orderStatus && (
            <span
              className={`menuBadge ${
                isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}
            >
              {orderStatus}
            </span>
          )}
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        {loading ? (
          <div className="menuDesc" style={{ textAlign: "center", padding: "20px" }}>
            Đang tải order...
          </div>
        ) : itemsList.length > 0 ? (
          itemsList.map((it) => (
            <OrderItemRow
              key={it.itemId || it.id}
              item={it}
              orderId={orderId}
              reload={loadOrder}
              orderStatus={orderStatus}
              hideStatusSelect={isDraft}
            />
          ))
        ) : (
          <div className="menuDesc" style={{ textAlign: "center", padding: "20px" }}>
            {error ? <span style={{ color: "orange" }}>{error}</span> : "Chưa có món nào được gọi."}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #ddd", paddingTop: "15px", opacity: actionLoading ? 0.7 : 1 }}>
        <AddItemForm orderId={orderId} reload={loadOrder} orderStatus={orderStatus} />
      </div>

      <div style={{ marginTop: "20px", borderTop: "2px solid #eee", paddingTop: "15px" }}>
        {isDraft && (
          <div>
            <button
              onClick={handleConfirm}
              className="addBtn"
              style={{
                ...btnBase,
                background: "var(--mq-brown)",
                opacity: actionLoading ? 0.7 : 1,
                cursor: actionLoading ? "not-allowed" : "pointer",
              }}
              disabled={actionLoading || !orderId}
            >
              {actionLoading ? "Đang xử lý..." : "Xác nhận đơn (Gửi bếp)"}
            </button>

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
        )}

        {isActive && table.status === "OCCUPIED" && (
          <button
            onClick={handleRequestBill}
            className="addBtn"
            style={{ ...btnBase, background: "var(--mq-orange)", boxShadow: "none", marginTop: 0 }}
            disabled={actionLoading}
          >
            {actionLoading ? "Đang xử lý..." : "Yêu cầu tính tiền"}
          </button>
        )}

        {!isDraft && table.status === "REQUESTING_BILL" && (
          <button
            onClick={handleSetCleaning}
            className="addBtn"
            style={{ ...btnBase, background: "#0ea5e9", boxShadow: "none" }}
            disabled={actionLoading}
          >
            {actionLoading ? "Đang xử lý..." : "Set cleaning"}
          </button>
        )}

        {!isDraft && table.status === "CLEANING" && (
          <button
            onClick={handleFinishCleaning}
            className="addBtn"
            style={{ ...btnBase, background: "#10b981", boxShadow: "none" }}
            disabled={actionLoading}
          >
            {actionLoading ? "Đang xử lý..." : "Dọn xong (Available)"}
          </button>
        )}

        {!isDraft && table.status !== "AVAILABLE" && (
          <>
            <div style={{ height: 12 }} />
            <button
              onClick={handleManualReset}
              className="addBtn"
              style={{
                ...btnBase,
                background: "#ef4444",
                fontSize: "0.9rem",
                padding: "10px",
                boxShadow: "none",
              }}
              disabled={actionLoading}
            >
              🛠️ Reset / Trả bàn thủ công (Dùng khi lỗi)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
