export default function PaymentSummary({ items = [] }) {
  const lineTotal = (item) => {
    const price = item.unitPrice ?? item.price ?? 0;
    const qty = item.qty ?? 0;
    return price * qty;
  };

  const subTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

  return (
    <div
      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "12px",
        border: "1px dashed #ccc",
      }}
    >
      <table style={{ width: "100%", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee", color: "#666" }}>
            <th style={{ textAlign: "left", paddingBottom: "8px" }}>Món</th>
            <th style={{ textAlign: "center", paddingBottom: "8px" }}>SL</th>
            <th style={{ textAlign: "right", paddingBottom: "8px" }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} className="menuDesc" style={{ padding: "10px 0", textAlign: "center" }}>
                Không có món nào trong hóa đơn.
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const name = item.name || item.menuItemName || item.itemNameSnapshot || "Món";
              const price = item.unitPrice ?? item.price ?? 0;
              const qty = item.qty ?? 0;
              return (
                <tr key={index} style={{ borderBottom: "1px dashed #eee" }}>
                  <td style={{ padding: "8px 0" }}>{name}</td>
                  <td style={{ textAlign: "center" }}>x{qty}</td>
                  <td style={{ textAlign: "right" }}>{(price * qty).toLocaleString()}đ</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>Tổng món:</span>
        <span>{subTotal.toLocaleString()}đ</span>
      </div>
    </div>
  );
}
