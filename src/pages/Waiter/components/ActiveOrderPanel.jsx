/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { getDraftByTable, confirmOrder, requestBill, setAvailable } from "../../../api/waiter.api";
import AddItemForm from "./AddItemForm";
import OrderItemRow from "./OrderItemRow";
import { checkoutOrder } from "../../../api/cashier.api";
export default function ActiveOrderPanel({ table, reloadTables }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const loadOrder = useCallback(async () => {
    try {
      setError(null);
      // Gọi API lấy đơn hàng
      const data = await getDraftByTable(table.id);
      setOrder(data);
    } catch (err) {
      // Nếu lỗi 400 (thường do đơn đã Active mà API chỉ trả Draft)
      console.warn("Không tải được Draft Order (có thể đơn đã Active):", err);
      
      if (table.currentOrderId) {
      }
      
      setOrder(null); 
      setError("Không tìm thấy đơn nháp. Nếu đơn đã xác nhận, vui lòng tải lại trang hoặc kiểm tra API.");
    }
  }, [table.id, table.currentOrderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);


  const handleConfirm = async () => {
    if (order?.orderId && window.confirm("Xác nhận chuyển đơn vào bếp?")) {
      await confirmOrder(order.orderId);
      await reloadTables(); await loadOrder();
    }
  };

  const handleRequestBill = async () => {
    if (window.confirm("Khách yêu cầu thanh toán?")) {
      await requestBill(table.id);
      await reloadTables();
    }
  };
  
  const handleFinishCleaning = async () => {
      await setAvailable(table.id);
      await reloadTables();
  };

  // --- HÀM RESET BÀN THÔNG MINH (Chạy 2 bước) ---
  const handleManualReset = async () => {
    const confirmMsg = `⚠️ RESET BÀN (2 BƯỚC):\n\nHệ thống sẽ thực hiện:\n1. Tự động thanh toán/hủy đơn hiện tại.\n2. Chuyển bàn về trạng thái TRỐNG.\n\nBạn có chắc chắn không?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
        // BƯỚC 1: Nếu bàn đang có Order ID, gọi lệnh Thanh toán giả để chuyển sang CLEANING
        if (order?.orderId || table.currentOrderId) {
            const idToCheckout = order?.orderId || table.currentOrderId;
            try {
                // Gọi API thanh toán của Cashier (giả lập trả 0đ)
                await checkoutOrder(idToCheckout, {
                    method: 'CASH',
                    discountAmount: 0,
                    taxAmount: 0,
                    serviceFeeAmount: 1000
                });
            } catch (e) {
                // Nếu lỗi này xảy ra (ví dụ đơn đã thanh toán rồi), cứ lờ đi và chạy tiếp bước 2
                console.log("Bước 1 (Checkout) bỏ qua: ", e.message);
            }
        }

        // BƯỚC 2: Gọi lệnh Dọn xong để chuyển sang AVAILABLE
        await setAvailable(table.id);
        
        alert("✅ Đã reset bàn thành công!");
        await reloadTables(); // Tải lại sơ đồ

    } catch (err) {
        alert("Vẫn không reset được: " + (err.response?.data?.message || err.message));
    }
  };

  const itemsList = order?.items || [];

  return (
    <div className="sectionCard">
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">🔥</div>
          <h2 className="menuTitle">Bàn: {table.code}</h2>
        </div>
        <div className="flex gap-2">
           <span className="menuBadge">{table.status}</span>
           {(order?.orderId || table.currentOrderId) && (
             <span className="menuBadge bg-white border-gray-300">#{order?.orderId || table.currentOrderId}</span>
           )}
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        {itemsList.length > 0 ? (
          itemsList.map(it => (
            <OrderItemRow 
              key={it.itemId || it.id} 
              item={it} 
              orderId={order?.orderId} 
              reload={loadOrder} 
            />
          ))
        ) : (
          <div className="menuDesc" style={{ textAlign: 'center', padding: '20px' }}>
            {error ? <span style={{color: 'orange'}}>{error}</span> : "Chưa có món nào được gọi."}
          </div>
        )}
      </div>

      {/* Form thêm món */}
      <div style={{ borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
        <AddItemForm orderId={order?.orderId} reload={loadOrder} />
      </div>

      {/* KHU VỰC NÚT BẤM (Đã chỉnh sửa lại layout) */}
      <div style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '15px' }}>
        
        {/* Hàng nút chính */}
        <div className="flex gap-2 mb-3">
            {order?.status === "DRAFT" && (
            <button onClick={handleConfirm} className="addBtn" style={{ background: 'var(--mq-brown)', flex: 1 }}>
                Xác nhận đơn (Confirm)
            </button>
            )}

            {table.status === "OCCUPIED" && (
            <button onClick={handleRequestBill} className="addBtn" style={{ background: 'var(--mq-orange)', flex: 1 }}>
                Yêu cầu tính tiền
            </button>
            )}
            
            {table.status === "CLEANING" && (
            <button onClick={handleFinishCleaning} className="addBtn" style={{ background: '#10b981', flex: 1 }}>
                Dọn xong (Available)
            </button>
            )}
        </div>

        {/* NÚT RESET THỦ CÔNG (Chỉ hiện khi bàn KHÔNG TRỐNG) */}
        {table.status !== "AVAILABLE" && (
            <button 
                onClick={handleManualReset} 
                className="addBtn w-full" 
                style={{ 
                    background: '#ef4444',
                    marginTop: '10px',
                    fontSize: '0.9rem',
                    padding: '10px'
                }}
            >
                🛠️ Reset / Trả bàn thủ công (Dùng khi lỗi)
            </button>
        )}
      </div>
    </div>
  );
}