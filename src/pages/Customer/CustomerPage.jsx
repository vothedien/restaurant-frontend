import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MenuList from "./components/MenuList";
import * as tableApi from "../../api/tables.api";
import * as menuApi from "../../api/menu.api";
import * as orderApi from "../../api/orders.api";
import {
  ShoppingBag,
  UtensilsCrossed,
  Info,
  ClipboardEdit,
  ChefHat,
  Sparkles,
} from "lucide-react";

export default function CustomerPage() {
  const params = useParams();
  const [sp] = useSearchParams();
  const initialToken = (params.token || sp.get("token") || "").trim();

  const [token, setToken] = useState(initialToken);
  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ Khóa menu sau khi gửi order (đúng flow nhà hàng)
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(
    async (forcedToken) => {
      const tk = (forcedToken ?? token).trim();
      if (!tk) return;

      setErr("");
      setMsg("");
      try {
        setLoading(true);
        const [t, m] = await Promise.all([
          tableApi.fetchTableInfoByToken(tk),
          menuApi.getPublicMenu(),
        ]);
        setTable(t);
        setMenu(Array.isArray(m) ? m : []);

        // ✅ nếu đổi token / tải lại bàn => reset trạng thái submit
        setSubmitted(false);
        setCart({});
        setCustomerNote("");
      } catch (e) {
        setErr("Không tìm thấy thông tin bàn hoặc menu của quán.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  const cartItems = useMemo(
    () => Object.entries(cart).map(([id, v]) => ({ id: Number(id), ...v })),
    [cart]
  );

  const totalAmount = cartItems.reduce(
    (s, it) => s + it.qty * (it.price || 0),
    0
  );

  const onAdd = (item) => {
    if (submitted) return; // ✅ đã gửi rồi thì không cho thêm
    setCart((prev) => ({
      ...prev,
      [item.id]: {
        ...(prev[item.id] || { qty: 0, name: item.name, price: item.price }),
        qty: (prev[item.id]?.qty || 0) + 1,
      },
    }));
  };

  const onDec = (itemId) => {
    if (submitted) return; // ✅ đã gửi rồi thì không cho sửa
    setCart((prev) => {
      if (!prev[itemId]) return prev;
      if (prev[itemId].qty <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: { ...prev[itemId], qty: prev[itemId].qty - 1 },
      };
    });
  };

  const onSubmit = async () => {
    const tk = (token || "").trim();
    if (!tk) {
      setErr("Thiếu mã bàn (token).");
      return;
    }
    if (cartItems.length === 0) {
      setErr("Bạn chưa chọn món.");
      return;
    }
    if (submitted) return;

    try {
      setLoading(true);
      setErr("");
      setMsg("");

      const body = {
        customerNote: customerNote || "",
        items: cartItems.map((it) => ({
          menuItemId: it.id,
          qty: it.qty,
          note: "", // nếu muốn note theo từng món thì nâng cấp sau
        })),
      };

      console.log("SUBMIT ORDER:", tk, body);

      await orderApi.submitCustomerOrder(tk, body);

      // ✅ đúng nghiệp vụ: khách gửi xong => chờ waiter xác nhận
      setMsg("Đơn đã gửi. Vui lòng chờ nhân viên xác nhận 🙏");
      setSubmitted(true);
      setCart({});
      setCustomerNote("");
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          "Có lỗi khi gửi đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasCart = cartItems.length > 0;

  return (
    <div className={`customerPage ${hasCart ? "hasCart" : ""}`}>
      {/* Header */}
      <header className="customerHeader">
        <div className="customerHeaderInner">
          <div className="brandLeft">
            <div className="brandIcon">
              <ChefHat size={22} color="#78350f" />
            </div>

            <div>
              <h1 className="brandTitle">Mộc Quán</h1>
              {table && <p className="brandSub">Vị trí: Bàn {table.code}</p>}
            </div>
          </div>

          <UtensilsCrossed size={22} color="#fcd34d" style={{ opacity: 0.7 }} />
        </div>

        <div className="headerLine" />
      </header>

      {/* Main */}
      <main className="customerMain">
        {err && <div className="msgErr">{err}</div>}

        {msg && (
          <div className="msgOk">
            <Sparkles size={18} />
            {msg}
          </div>
        )}

        {/* Nhập mã bàn (khi chưa có table) */}
        {!table && (
          <div className="sectionCard">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Info size={18} />
              <div style={{ fontWeight: 800 }}>
                Chào quý khách, vui lòng nhập mã bàn:
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ví dụ: T01"
                style={{
                  flex: "1 1 260px",
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: "1px solid rgba(252,211,77,0.65)",
                  outline: "none",
                  fontWeight: 700,
                  color: "var(--mq-text)",
                  background: "rgba(255,247,237,0.8)",
                }}
              />

              <button
                type="button"
                onClick={() => load(token)}
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: "none",
                  fontWeight: 900,
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "var(--mq-orange)",
                  color: "#fff",
                  boxShadow: "0 14px 30px rgba(249,115,22,0.28)",
                }}
              >
                {loading ? "Đang tải..." : "Tải Menu"}
              </button>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="sectionCard">
          <MenuList
            menu={menu}
            onAdd={onAdd}
            loading={loading}
            disabled={submitted} // ✅ khóa menu sau submit
          />
          {submitted && (
            <div style={{ marginTop: 12, fontWeight: 800, opacity: 0.8 }}>
              ✅ Bạn đã gửi order. Nhân viên sẽ xác nhận và xử lý sớm.
            </div>
          )}
        </div>

        {/* Giỏ hàng */}
        {hasCart && !submitted && (
          <div className="sectionCard">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <ShoppingBag size={20} color="#b45309" />
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                Món Quý Khách Đã Chọn
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cartItems.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    background: "rgba(255,247,237,0.8)",
                    border: "1px solid rgba(252,211,77,0.35)",
                    borderRadius: 18,
                    padding: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 900,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {it.name}
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "rgba(120,53,15,0.75)",
                        fontSize: 13,
                      }}
                    >
                      {(it.price || 0).toLocaleString()}đ
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "white",
                      border: "1px solid rgba(252,211,77,0.35)",
                      borderRadius: 16,
                      padding: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onDec(it.id)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 900,
                        background: "rgba(255,247,237,0.9)",
                        color: "var(--mq-text)",
                      }}
                    >
                      -
                    </button>

                    <div
                      style={{
                        width: 28,
                        textAlign: "center",
                        fontWeight: 900,
                      }}
                    >
                      {it.qty}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAdd(it)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 900,
                        background: "var(--mq-brown)",
                        color: "#fff",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                <ClipboardEdit size={18} />
                Lưu ý cho nhà bếp:
              </div>

              <textarea
                rows={4}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Ví dụ: Không cay, ít hành, thêm đá..."
                style={{
                  width: "100%",
                  resize: "none",
                  borderRadius: 18,
                  border: "1px solid rgba(252,211,77,0.35)",
                  padding: 12,
                  outline: "none",
                  background: "rgba(255,247,237,0.8)",
                  color: "var(--mq-text)",
                  fontStyle: "italic",
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer đặt món */}
      {hasCart && !submitted && (
        <div
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 20,
            zIndex: 40,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              margin: "0 auto",
              background: "var(--mq-brown)",
              border: "2px solid rgba(217,119,6,0.9)",
              borderRadius: 28,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              boxShadow: "0 20px 50px rgba(0,0,0,0.30)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "#fcd34d",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Tổng hóa đơn
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                {totalAmount.toLocaleString()}đ
              </div>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 22,
                padding: "14px 18px",
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                background: "#fcd34d",
                color: "#3b2a22",
                boxShadow: "0 14px 30px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Đang gửi..." : "ĐẶT MÓN"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
