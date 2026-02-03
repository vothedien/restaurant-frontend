import { useState, useEffect } from "react";
import { checkoutOrder } from "../../../api/cashier.api";

export default function CheckoutForm({ bill, orderId, onSuccess }) {
  const [method] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const calculateSubTotal = () => {
    if (bill?.subTotal != null) return Number(bill.subTotal) || 0;
    const items = bill?.items || [];
    return items.reduce((sum, item) => {
      const price = item.unitPrice ?? item.price ?? 0;
      const qty = item.qty ?? 0;
      return sum + price * qty;
    }, 0);
  };

  const subTotal = calculateSubTotal();

  useEffect(() => {
    const d = subTotal === 0 ? 0 : Number(discount) || 0;

    if (subTotal === 0) {
      setFinalTotal(0);
      return;
    }

    const total = subTotal - d;
    setFinalTotal(total > 0 ? total : 0);
  }, [subTotal, discount]);

  const handleCheckout = async () => {
    if (!orderId) return alert("Thiếu orderId!");
    if (loading) return;

    const d = subTotal === 0 ? 0 : Number(discount) || 0;
    const isZeroAmount = subTotal === 0 || finalTotal <= 0;

    const confirmMessage = isZeroAmount
      ? "Bàn này không có món (0đ). Bạn có chắc chắn muốn kết thúc order và TRẢ BÀN?"
      : `Xác nhận thanh toán ${finalTotal.toLocaleString()}đ?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      await checkoutOrder(orderId, {
        method,
        discountAmount: d,
        taxAmount: 0,
        serviceFeeAmount: 0,
      });

      alert(isZeroAmount ? "✅ Đã trả bàn!" : "✅ Thanh toán thành công!");
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi không xác định";

      // ✅ Nếu backend báo “đã thanh toán trước đó” => coi như xong, refresh UI
      const lower = String(msg).toLowerCase();
      if (lower.includes("đã được thanh toán") || lower.includes("already paid") || lower.includes("paid before")) {
        alert("Order này đã được thanh toán trước đó. Mình sẽ tải lại danh sách bàn.");
        onSuccess(); // reloadTables + đóng panel
        return;
      }

      alert("Lỗi xử lý: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#fafaf9", padding: "15px", borderRadius: "12px" }}>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Giảm giá (VNĐ)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            disabled={subTotal === 0 || loading}
            className="w-full p-2 rounded border"
            placeholder="0"
          />
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Tạm tính:</span>
          <span>{subTotal.toLocaleString()}đ</span>
        </div>

        <div className="flex justify-between text-xl font-bold text-orange-700 mt-2">
          <span>THỰC THU:</span>
          <span>{finalTotal.toLocaleString()}đ</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="addBtn w-full mt-4 py-3 text-lg shadow-lg"
        style={{
          background: finalTotal === 0 ? "#6b7280" : "var(--mq-brown)",
          color: "#fff",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading
          ? "Đang xử lý..."
          : finalTotal === 0
          ? "HUỶ ĐƠN / TRẢ BÀN"
          : "HOÀN TẤT THANH TOÁN"}
      </button>
    </div>
  );
}
