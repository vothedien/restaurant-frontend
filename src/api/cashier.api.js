import { api } from "./client";

export const getTables = async () => 
  (await api.get("/api/tables")).data;


// phiếu tạm
export const getBill = async (orderId) => {
  if (!orderId) throw new Error("Thiếu Order ID để lấy hóa đơn");
  // api bill chi tiết
  return (await api.get(`/api/orders/${orderId}/bill`)).data;
};



// Thực hiện thanh toán

export const checkoutOrder = async (orderId, payload) => {
  if (!orderId) throw new Error("Thiếu Order ID để thanh toán");
  
  // Đảm bảo số liệu là number, không phải string
  const cleanPayload = {
    method: payload.method || "CASH",
    discountAmount: Number(payload.discountAmount) || 0,
    taxAmount: Number(payload.taxAmount) || 0,
    serviceFeeAmount: Number(payload.serviceFeeAmount) || 0
  };

  return (await api.post(`/api/orders/${orderId}/checkout`, cleanPayload)).data;
};