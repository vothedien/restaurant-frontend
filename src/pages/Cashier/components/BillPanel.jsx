import { useMemo, useState } from "react";
import { checkout, getBill } from "../../../api/orders.api";
import { Receipt, CreditCard, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

function money(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("vi-VN") + "đ";
}

export default function BillPanel() {
  const [orderId, setOrderId] = useState("");
  const [bill, setBill] = useState(null);

  const [method, setMethod] = useState("CASH");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [serviceFeeAmount, setServiceFeeAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const idNum = useMemo(() => Number(orderId), [orderId]);

  async function loadBill() {
    setErr("");
    setMsg("");
    const id = Number(orderId);
    if (!id) return setErr("Nhập orderId hợp lệ");

    try {
      setLoading(true);
      const data = await getBill(id);
      setBill(data || null);
    } catch (e) {
      setBill(null);
      setErr(e?.response?.data?.message || e.message || "Load bill failed");
    } finally {
      setLoading(false);
    }
  }

  async function doCheckout() {
    setErr("");
    setMsg("");
    const id = Number(orderId);
    if (!id) return setErr("Nhập orderId hợp lệ");

    try {
      setLoading(true);
      const body = {
        method,
        discountAmount: Number(discountAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        serviceFeeAmount: Number(serviceFeeAmount) || 0,
      };
      const res = await checkout(id, body);
      setMsg(res?.message || "Checkout thành công");
      await loadBill();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    if (!bill) return null;

    // cố gắng suy đoán vài field hay gặp (tuỳ backend bạn)
    const subtotal =
      bill.subtotal ?? bill.subTotal ?? bill.totalBeforeFees ?? bill.totalItemsAmount;
    const total = bill.total ?? bill.grandTotal ?? bill.amount;

    return {
      subtotal,
      total,
      tableCode: bill.tableCode,
      status: bill.status,
      orderId: bill.orderId ?? bill.id,
    };
  }, [bill]);

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "420px 1fr",
        alignItems: "start",
      }}
    >
      {/* LEFT */}
      <div className="sectionCard" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div className="menuSpark" style={{ width: 40, height: 40, borderRadius: 16 }}>
            <CreditCard size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Cashier — Billing</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(120,53,15,0.65)" }}>
              Nhập Order ID → Load bill → Checkout
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {/* Order id */}
          <div>
            <div style={labelStyle}>Order ID</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="vd: 12"
                style={inputStyle}
              />
              <button className="staffBtn" onClick={loadBill} disabled={loading || !idNum} type="button">
                {loading ? "..." : "Load"}
              </button>
            </div>
          </div>

          {/* method */}
          <div>
            <div style={labelStyle}>Phương thức</div>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            >
              <option value="CASH">CASH</option>
              <option value="CARD">CARD</option>
              <option value="QR">QR</option>
            </select>
          </div>

          {/* fees */}
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <div style={labelStyle}>Discount</div>
              <input
                style={{ ...inputStyle, width: "100%" }}
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
            <div>
              <div style={labelStyle}>Tax</div>
              <input
                style={{ ...inputStyle, width: "100%" }}
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
              />
            </div>
            <div>
              <div style={labelStyle}>Service</div>
              <input
                style={{ ...inputStyle, width: "100%" }}
                type="number"
                value={serviceFeeAmount}
                onChange={(e) => setServiceFeeAmount(e.target.value)}
              />
            </div>
          </div>

          <button
            className="staffBtn"
            onClick={doCheckout}
            disabled={loading || !idNum}
            type="button"
            style={{ width: "100%" }}
          >
            {loading ? "Đang xử lý..." : "Checkout"}
          </button>

          {err && (
            <div className="msgErr" style={{ margin: 0, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertTriangle size={18} />
              {err}
            </div>
          )}
          {msg && (
            <div className="msgOk" style={{ margin: 0 }}>
              <CheckCircle2 size={18} />
              {msg}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="sectionCard" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="menuSpark" style={{ width: 40, height: 40, borderRadius: 16 }}>
              <Receipt size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Bill</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(120,53,15,0.65)" }}>
                Xem thông tin hóa đơn
              </div>
            </div>
          </div>

          <button className="staffBtnGhost" onClick={loadBill} disabled={loading || !idNum} type="button">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <RefreshCw size={16} />
              Reload
            </span>
          </button>
        </div>

        {!bill ? (
          <div style={{ marginTop: 12, fontWeight: 800, color: "rgba(120,53,15,0.60)" }}>
            Chưa load bill.
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "1fr 1fr",
                padding: 14,
                borderRadius: 18,
                border: "1px solid rgba(252, 211, 77, 0.35)",
                background: "rgba(255,247,237,0.70)",
              }}
            >
              <InfoRow label="Order" value={summary?.orderId ?? "-"} />
              <InfoRow label="Table" value={summary?.tableCode ?? "-"} />
              <InfoRow label="Status" value={summary?.status ?? "-"} />
              <InfoRow label="Subtotal" value={summary?.subtotal != null ? money(summary.subtotal) : "-"} />
              <InfoRow label="Total" value={summary?.total != null ? money(summary.total) : "-"} />
            </div>

            {/* Debug raw nếu bạn vẫn muốn */}
            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(252, 211, 77, 0.35)",
                background: "rgba(255,255,255,0.55)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 12, fontWeight: 950, borderBottom: "1px solid rgba(252, 211, 77, 0.25)" }}>
                Raw BillDto
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  fontSize: 12,
                  overflow: "auto",
                  background: "rgba(255,247,237,0.50)",
                }}
              >
                {JSON.stringify(bill, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* responsive */}
      <style>{`
        @media (max-width: 980px){
          .bill-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(120,53,15,0.70)" }}>{label}</div>
      <div style={{ fontWeight: 950 }}>{value}</div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(120,53,15,0.70)",
  marginBottom: 6,
};

const inputStyle = {
  flex: "1 1 auto",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(252,211,77,0.55)",
  outline: "none",
  fontWeight: 800,
  color: "var(--mq-text)",
  background: "rgba(255,247,237,0.75)",
};
