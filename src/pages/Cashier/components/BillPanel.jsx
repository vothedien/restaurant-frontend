import { useEffect, useState } from "react";
import { getBill } from "../../../api/cashier.api";
import CheckoutForm from "./CheckoutForm";
import PaymentSummary from "./PaymentSummary";

export default function BillPanel({ table, reloadTables, onClose }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const orderId = table.currentOrderId || table.currentOrder?.id;

  useEffect(() => {
    const fetchBill = async () => {
      setErr("");

      if (!orderId) {
        setBill(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getBill(orderId);
        setBill(data);
      } catch (error) {
        console.error("Lỗi lấy hóa đơn:", error);
        setBill(null);
        setErr(error?.response?.data?.message || "Không thể tải thông tin hóa đơn.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [orderId]);

  // ✅ nếu bàn không còn trạng thái yêu cầu tính tiền nữa -> đóng
  if (table.status !== "REQUESTING_BILL") {
    return (
      <div className="sectionCard" style={{ textAlign: "center", padding: "30px" }}>
        <h2 className="menuTitle">Bàn {table.code}</h2>
        <p className="menuDesc">Bàn không ở trạng thái yêu cầu thanh toán nữa.</p>
        <button
          className="addBtn"
          onClick={() => {
            reloadTables();
            onClose();
          }}
          style={{ marginTop: 12, background: "var(--mq-brown)" }}
        >
          Đóng
        </button>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="sectionCard" style={{ textAlign: "center", padding: "30px" }}>
        <h2 className="menuTitle">Bàn {table.code} không có order</h2>
        <p className="menuDesc">Không có đơn hàng nào cần thanh toán.</p>
        <button
          className="addBtn"
          onClick={() => {
            reloadTables();
            onClose();
          }}
          style={{ marginTop: 12, background: "var(--mq-brown)" }}
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="sectionCard">
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">🧾</div>
          <h2 className="menuTitle">Hóa đơn: {table.code}</h2>
        </div>
        <span className="menuBadge">Đơn #{orderId}</span>
      </div>

      {loading ? (
        <div className="p-4 text-center">Đang tải chi tiết hóa đơn...</div>
      ) : err ? (
        <div className="p-4 text-center text-red-500">{err}</div>
      ) : bill ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div>
            <h3 className="menuName" style={{ marginBottom: "10px" }}>
              Chi tiết món
            </h3>
            <PaymentSummary items={bill.items || []} />
          </div>

          <div>
            <h3 className="menuName" style={{ marginBottom: "10px" }}>
              Thanh toán
            </h3>
            <CheckoutForm
              bill={bill}
              orderId={orderId}
              onSuccess={() => {
                reloadTables();
                onClose();
              }}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-red-500">Không thể tải thông tin hóa đơn.</div>
      )}
    </div>
  );
}
