export default function PaymentSummary({ items }) {
  // Tính tổng tạm tính tại client để hiển thị
  const subTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div style={{ 
      background: '#fff', 
      padding: '15px', 
      borderRadius: '12px', 
      border: '1px dashed #ccc' 
    }}>
      <table style={{ width: '100%', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee', color: '#666' }}>
            <th style={{textAlign: 'left', paddingBottom: '8px'}}>Món</th>
            <th style={{textAlign: 'center', paddingBottom: '8px'}}>SL</th>
            <th style={{textAlign: 'right', paddingBottom: '8px'}}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px dashed #eee' }}>
              <td style={{ padding: '8px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'center' }}>x{item.qty}</td>
              <td style={{ textAlign: 'right' }}>
                {(item.price * item.qty).toLocaleString()}đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Tổng món:</span>
        <span>{subTotal.toLocaleString()}đ</span>
      </div>
    </div>
  );
}