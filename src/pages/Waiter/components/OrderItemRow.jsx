import ItemStatusSelect from "./ItemStatusSelect";
import { removeOrderItem } from "../../../api/waiter.api";

export default function OrderItemRow({ item, orderId, reload }) {
  // Lấy tên món từ các trường khả thi của API
  const itemName = item.name || item.itemNameSnapshot || "Món không tên";

  const handleDelete = async () => {
    if (window.confirm(`Xóa món "${itemName}"?`)) {
      // Dùng itemId để xóa chính xác món trong đơn
      await removeOrderItem(orderId, item.itemId || item.id);
      reload();
    }
  };

  return (
    <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px dashed rgba(120, 53, 15, 0.2)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <b className="menuName" style={{ fontSize: '16px' }}>{itemName}</b>
          <span className="menuBadge" style={{ fontSize: '12px' }}>x{item.qty}</span>
        </div>
        {item.note && <div className="menuDesc" style={{fontSize: '13px'}}>📝 {item.note}</div>}
      </div>

      <div className="flex gap-3 items-center">
        {/* Dropdown chỉnh trạng thái (Pending, Cooking, Served...) */}
        <ItemStatusSelect item={item} orderId={orderId} reload={reload} />
        
        {/* Nút xóa món */}
        <button 
          onClick={handleDelete}
          style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
          title="Xóa món"
        >
          ✕
        </button>
      </div>
    </div>
  );
}