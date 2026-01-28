import { updateItemStatus } from "../../../api/waiter.api";

export default function ItemStatusSelect({ item, orderId, reload }) {
  // Màu sắc trạng thái
  const getStatusColor = (s) => {
    if (s === 'READY') return '#16a34a';
    if (s === 'COOKING') return '#ea580c';
    if (s === 'SERVED') return '#78350f';
    if (s === 'CANCELED') return '#dc2626';
    return '#666';
  };

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    // API yêu cầu body: { newStatus, cancelReason }
    await updateItemStatus(orderId, item.itemId, { status: newStatus });
    reload();
  };

  return (
    <select
      className="menuBadge"
      style={{ 
        border: `1px solid ${getStatusColor(item.status)}`,
        color: getStatusColor(item.status),
        background: 'white',
        cursor: 'pointer',
        outline: 'none'
      }}
      value={item.status}
      onChange={handleChange}
    >
      <option value="DRAFT">DRAFT</option>
      <option value="PENDING">PENDING</option>
      <option value="COOKING">COOKING</option>
      <option value="READY">READY</option>
      <option value="SERVED">SERVED</option>
      <option value="CANCELED">CANCELED</option>
    </select>
  );
}