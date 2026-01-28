import { useEffect, useState } from "react";
import { getBill } from "../../../api/cashier.api";
import CheckoutForm from "./CheckoutForm";
import PaymentSummary from "./PaymentSummary";

export default function BillPanel({ table, reloadTables, onClose }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy orderId từ table (Tùy backend trả về currentOrderId hay currentOrder.id)
  const orderId = table.currentOrderId || table.currentOrder?.id;

  useEffect(() => {
    if (!orderId) {
      setBill(null);
      return;
    }

    const fetchBill = async () => {
      setLoading(true);
      try {
        const data = await getBill(orderId);
        setBill(data);
      } catch (error) {
        console.error("Lỗi lấy hóa đơn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="sectionCard" style={{ textAlign: 'center', padding: '30px' }}>
        <h2 className="menuTitle">Bàn {table.code} đang trống</h2>
        <p className="menuDesc">Không có đơn hàng nào cần thanh toán.</p>
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
      ) : bill ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          
          {/* Cột 1: Danh sách món ăn (PaymentSummary) */}
          <div>
             <h3 className="menuName" style={{marginBottom: '10px'}}>Chi tiết món</h3>
             <PaymentSummary items={bill.items || []} />
          </div>

          {/* Cột 2: Form thanh toán (CheckoutForm) */}
          <div>
            <h3 className="menuName" style={{marginBottom: '10px'}}>Thanh toán</h3>
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