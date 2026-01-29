import React, { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api";

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    adminApi.getTransactions().then(setTransactions).catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#431407", marginBottom: 20 }}>Lịch sử giao dịch</h2>
      
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #fed7aa" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#fff7ed", color: "#9a3412" }}>
            <tr>
              <th style={{ padding: 16, borderBottom: "2px solid #fed7aa" }}>Mã GD</th>
              <th style={{ padding: 16, borderBottom: "2px solid #fed7aa" }}>Mã Order</th>
              <th style={{ padding: 16, borderBottom: "2px solid #fed7aa" }}>Số tiền</th>
              <th style={{ padding: 16, borderBottom: "2px solid #fed7aa" }}>Phương thức</th>
              <th style={{ padding: 16, borderBottom: "2px solid #fed7aa" }}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: 16, fontWeight: "bold" }}>#{tx.id}</td>
                <td style={{ padding: 16 }}>#{tx.orderId}</td>
                <td style={{ padding: 16, fontWeight: "bold", color: "#16a34a" }}>
                  {tx.amount?.toLocaleString()}đ
                </td>
                <td style={{ padding: 16 }}>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold",
                    background: tx.method === "CASH" ? "#dcfce7" : "#dbeafe",
                    color: tx.method === "CASH" ? "#166534" : "#1e40af"
                  }}>
                    {tx.method}
                  </span>
                </td>
                <td style={{ padding: 16, color: "#6b7280" }}>
                  {new Date(tx.createdAt).toLocaleString('vi-VN')}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: 30, textAlign: "center", color: "#888" }}>Chưa có giao dịch nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}