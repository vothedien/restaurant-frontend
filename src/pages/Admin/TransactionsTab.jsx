import { useEffect, useMemo, useState } from "react";
import { getErrMsg } from "../../utils/httpError";
import { formatVND } from "../../utils/money";
import { adminGetInvoice, adminListTransactions } from "../../api/admin.api";

function toIsoLocal(dt) {
  if (!dt) return null;
  return dt.length === 16 ? `${dt}:00` : dt;
}

function fmtDateTime(v) {
  if (!v) return "";
  // hỗ trợ cả ISO string / epoch / whatever
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

export default function TransactionsTab() {
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [data, setData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const content = data?.content || [];
  const totalPages = data?.totalPages ?? 0;

  async function load(p = page, s = size) {
    setOkMsg("");
    setErrMsg("");
    try {
      setLoading(true);
      const params = { page: p, size: s };
      const f = toIsoLocal(from);
      const t = toIsoLocal(to);
      if (f) params.from = f;
      if (t) params.to = t;

      const res = await adminListTransactions(params);
      setData(res);
    } catch (e) {
      setErrMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  async function openInvoice(paymentId) {
    setOkMsg("");
    setErrMsg("");
    try {
      setInvoiceLoading(true);
      const res = await adminGetInvoice(paymentId);
      setInvoice(res);
    } catch (e) {
      setErrMsg(getErrMsg(e));
    } finally {
      setInvoiceLoading(false);
    }
  }

  function applyFilter() {
    // reset về page 0 rồi load
    setPage(0);
    load(0, size);
    setOkMsg("✅ Đã áp dụng bộ lọc.");
  }

  function resetFilter() {
    setFrom("");
    setTo("");
    setPage(0);
    load(0, size);
    setOkMsg("✅ Đã reset bộ lọc.");
  }

  const summary = useMemo(() => {
    return content.reduce((acc, x) => acc + Number(x.totalAmount || 0), 0);
  }, [content]);

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Lịch sử giao dịch</div>
          <button
            onClick={() => load(page, size)}
            disabled={loading}
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-3 grid md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm font-medium">From</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">To</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Page size</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={size}
              onChange={(e) => {
                const n = Number(e.target.value);
                setPage(0);
                setSize(n);
                load(0, n);
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={applyFilter}
              className="flex-1 rounded-xl bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={loading}
            >
              Lọc
            </button>
            <button
              onClick={resetFilter}
              className="flex-1 rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </div>

        {errMsg && <div className="mt-3 text-sm text-red-600">{errMsg}</div>}
        {okMsg && <div className="mt-3 text-sm text-emerald-700">{okMsg}</div>}

        <div className="mt-3 text-xs text-slate-500">
          Tổng tiền (trang hiện tại): <b>{formatVND(summary)}</b>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Transactions</div>
          <div className="text-xs text-slate-500">
            Page {page + 1} / {totalPages || 1}
          </div>
        </div>

        <table className="mt-3 w-full text-sm">
          <thead className="text-slate-600 border-b">
            <tr>
              <th className="text-left py-2 pr-2">Payment</th>
              <th className="text-left py-2 pr-2">Order</th>
              <th className="text-left py-2 pr-2">Table</th>
              <th className="text-left py-2 pr-2">Total</th>
              <th className="text-left py-2 pr-2">Method</th>
              <th className="text-left py-2 pr-2">Paid at</th>
              <th className="text-left py-2 pr-2">Cashier</th>
              <th className="text-right py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {content.map((t) => (
              <tr key={t.paymentId} className="border-b">
                <td className="py-2 pr-2">{t.paymentId}</td>
                <td className="py-2 pr-2">{t.orderId}</td>
                <td className="py-2 pr-2">
                  {t.tableCode} (id={t.tableId})
                </td>
                <td className="py-2 pr-2 font-semibold">{formatVND(t.totalAmount)}</td>
                <td className="py-2 pr-2">{t.method}</td>
                <td className="py-2 pr-2">{fmtDateTime(t.paidAt)}</td>
                <td className="py-2 pr-2">{t.cashierUsername || t.cashierUserId || "-"}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => openInvoice(t.paymentId)}
                    disabled={loading}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-60"
                  >
                    View invoice
                  </button>
                </td>
              </tr>
            ))}

            {content.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-slate-500">
                  Không có giao dịch (hoặc chưa checkout đơn nào).
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between">
          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={loading || page <= 0}
          >
            Prev
          </button>

          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || (totalPages ? page >= totalPages - 1 : true)}
          >
            Next
          </button>
        </div>
      </div>

      {invoice && (
        <InvoiceModal invoice={invoice} loading={invoiceLoading} onClose={() => setInvoice(null)} />
      )}
    </div>
  );
}

function InvoiceModal({ invoice, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl bg-white border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">Invoice #{invoice.paymentId}</div>
          <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">
            Close
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="p-4 grid gap-3">
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border p-3">
                <div>
                  <b>Table:</b> {invoice.tableCode} (id={invoice.tableId})
                </div>
                <div>
                  <b>Order:</b> {invoice.orderId}
                </div>
                <div>
                  <b>Paid at:</b> {String(invoice.paidAt || "")}
                </div>
                <div>
                  <b>Method:</b> {invoice.method}
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div>
                  <b>Cashier:</b> {invoice.cashierUsername || invoice.cashierUserId || "-"}
                </div>
                <div>
                  <b>Subtotal:</b> {formatVND(invoice.subtotal)}
                </div>
                <div>
                  <b>Discount:</b> {formatVND(invoice.discountAmount)}
                </div>
                <div>
                  <b>Tax:</b> {formatVND(invoice.taxAmount)}
                </div>
                <div>
                  <b>Service fee:</b> {formatVND(invoice.serviceFeeAmount)}
                </div>
                <div className="mt-1 text-base font-semibold">
                  Total: {formatVND(invoice.totalAmount)}
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="font-semibold mb-2">Items</div>
              <div className="grid gap-2">
                {(invoice.items || []).map((it) => (
                  <div
                    key={it.itemId}
                    className="flex items-center justify-between border rounded-xl p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-slate-600">
                        {formatVND(it.unitPrice)} × {it.qty} — <b>{it.status}</b>
                      </div>
                      {it.note ? (
                        <div className="text-xs text-slate-500">Note: {it.note}</div>
                      ) : null}
                    </div>
                    <div className="font-semibold">{formatVND(it.lineTotal)}</div>
                  </div>
                ))}
                {(invoice.items || []).length === 0 && (
                  <div className="text-sm text-slate-500">Không có items.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
