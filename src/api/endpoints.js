export const EP = {
  health: "/api/health",

  public: {
    tableInfo: (token) => `/api/public/tables/${encodeURIComponent(token)}`,
    menu: "/api/public/menu",
    submitOrder: (token) => `/api/public/tables/${encodeURIComponent(token)}/submit`,
  },

  tables: {
    list: "/api/tables",
    open: (tableId) => `/api/tables/${tableId}/open`,
    requestBill: (tableId) => `/api/tables/${tableId}/request-bill`,
    setCleaning: (tableId) => `/api/tables/${tableId}/set-cleaning`,
    setAvailable: (tableId) => `/api/tables/${tableId}/set-available`,
  },

  orders: {
    draftByTable: (tableId) => `/api/orders/draft?tableId=${tableId}`,
    confirm: (orderId) => `/api/orders/${orderId}/confirm`,
    detail: (orderId) => `/api/orders/${orderId}`,

    addItem: (orderId) => `/api/orders/${orderId}/items`,
    updateItem: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}`,
    removeItem: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}`,
    updateItemStatus: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}/status`,

    bill: (orderId) => `/api/orders/${orderId}/bill`,
    checkout: (orderId) => `/api/orders/${orderId}/checkout`,
  },
   admin: {
    tables: "/api/admin/tables",
    tableById: (id) => `/api/admin/tables/${id}`,
    categories: "/api/admin/categories",
    menuItems: "/api/admin/menu-items",
    menuItemById: (id) => `/api/admin/menu-items/${id}`,
    uploadMenuImage: "/api/admin/uploads/menu-image",
    transactions: "/api/admin/transactions",
    invoiceByPaymentId: (paymentId) => `/api/admin/invoices/${paymentId}`,
  },

};
