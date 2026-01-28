/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { checkoutOrder } from "../../../api/cashier.api";

export default function CheckoutForm({ bill, orderId, onSuccess }) {
  const [method, ] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [tax, ] = useState(0); 
  const [fee, ] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Logic tính tổng tiền món
  const calculateSubTotal = () => {
    if (bill.subTotal) return bill.subTotal;
    if (!bill.items) return 0;
    
    return bill.items.reduce((sum, item) => {
      const price = item.unitPrice || item.price || 0;
      return sum + (price * item.qty);
    }, 0);
  };

  const subTotal = calculateSubTotal();

  // Tự động tính lại tổng tiền khi input thay đổi
  useEffect(() => {
    const d = Number(discount) || 0;
    const t = Number(tax) || 0;
    const f = Number(fee) || 0;
    
    // Nếu subTotal là 0 thì finalTotal cũng là 0 (tránh âm tiền nếu lỡ nhập giảm giá)
    if (subTotal === 0) {
      setFinalTotal(0);
    } else {
      const total = subTotal - d + t + f;
      setFinalTotal(total > 0 ? total : 0);
    }
  }, [subTotal, discount, tax, fee]);

  const handleCheckout = async () => {
    // --- ĐOẠN SỬA LOGIC KIỂM TRA 0 ĐỒNG ---
    const isZeroAmount = finalTotal <= 0;

    // Thay đổi câu hỏi xác nhận tùy theo có tiền hay không
    const confirmMessage = isZeroAmount
      ? "Bàn này chưa gọi món (0đ). Bạn có chắc chắn muốn kết thúc và TRẢ BÀN VỀ TRẠNG THÁI TRỐNG?"
      : `Xác nhận thanh toán ${finalTotal.toLocaleString()}đ?`;

    if(!window.confirm(confirmMessage)) return;

    try {
      // Vẫn gọi API checkout bình thường để Backend cập nhật trạng thái bàn
      await checkoutOrder(orderId, {
        method,
        discountAmount: Number(discount),
        taxAmount: Number(tax),
        serviceFeeAmount: Number(fee)
      });

      alert(isZeroAmount 
        ? "✅ Đã trả bàn về trạng thái trống!" 
        : "✅ Thanh toán thành công! Bàn sẽ chuyển sang trạng thái dọn dẹp."
      );
      
      onSuccess(); 
    } catch (err) {
      alert("Lỗi xử lý: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ background: '#fafaf9', padding: '15px', borderRadius: '12px' }}>
      
      {/* Input Giảm giá / Phí */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
           <label className="block text-xs font-bold text-gray-500 mb-1">Giảm giá (VNĐ)</label>
           <input 
             type="number" 
             value={discount} 
             onChange={e => setDiscount(e.target.value)} 
             disabled={subTotal === 0} // Khóa giảm giá nếu không có món
             className="w-full p-2 rounded border" 
             placeholder="0" 
           />
        </div>
        {/* Bạn có thể thêm input tax/fee ở đây nếu cần */}
      </div>

      {/* Hiển thị tổng kết */}
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

      {/* Nút bấm thay đổi màu sắc và nội dung dựa trên số tiền */}
      <button 
        onClick={handleCheckout}
        className="addBtn w-full mt-4 py-3 text-lg shadow-lg"
        style={{ 
          background: finalTotal === 0 ? '#6b7280' : 'var(--mq-brown)', // Màu xám nếu 0đ, màu nâu nếu có tiền
          color: '#fff' 
        }}
      >
        {finalTotal === 0 ? "HUỶ ĐƠN / TRẢ BÀN" : "HOÀN TẤT THANH TOÁN"}
      </button>
    </div>
  );
}