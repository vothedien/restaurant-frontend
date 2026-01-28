// src/api/endpoints.js
export const ENDPOINTS = {
  health: "/api/health",

  public: {
    tableInfo: (token) => `/api/public/tables/${encodeURIComponent(token)}`,
    menu: "/api/public/menu",
    submitOrder: (token) =>
      `/api/public/tables/${encodeURIComponent(token)}/submit`,
  },

  me: "/api/me",

  tables: {
    list: "/api/tables",
    open: (tableId) => `/api/tables/${tableId}/open`,
    requestBill: (tableId) => `/api/tables/${tableId}/request-bill`,
    setCleaning: (tableId) => `/api/tables/${tableId}/set-cleaning`,
    setAvailable: (tableId) => `/api/tables/${tableId}/set-available`,
  },

  orders: {
    draftByTable: (tableId) => `/api/orders/draft?tableId=${tableId}`,
    detail: (orderId) => `/api/orders/${orderId}`,
    confirm: (orderId) => `/api/orders/${orderId}/confirm`,
    reject: (orderId) => `/api/orders/${orderId}/reject`,

    addItem: (orderId) => `/api/orders/${orderId}/items`,
    updateItem: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}`,
    deleteItem: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}`,
    updateItemStatus: (orderId, itemId) =>
      `/api/orders/${orderId}/items/${itemId}/status`,

    bill: (orderId) => `/api/orders/${orderId}/bill`,
    checkout: (orderId) => `/api/orders/${orderId}/checkout`,
  },

  admin: {
    tables: "/api/admin/tables",
    categories: "/api/admin/categories",
    menuItems: "/api/admin/menu-items",
    uploadMenuImage: "/api/admin/uploads/menu-image",
    transactions: "/api/admin/transactions",
    invoice: (paymentId) => `/api/admin/invoices/${paymentId}`,
  },
};

// ✅ alias để code cũ dùng EP vẫn chạy
export const EP = ENDPOINTS;
