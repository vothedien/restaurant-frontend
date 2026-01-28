import { useEffect, useState } from "react";
import { getErrMsg } from "../../utils/httpError.js";
import {
  adminListTables,
  adminCreateTable,
  adminUpdateTable,
  adminDeleteTable,
} from "../../api/admin.api.js";

export default function TablesTab() {
  const [tables, setTables] = useState([]);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // toggle create form
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newCap, setNewCap] = useState(4);

  async function load() {
    setOkMsg("");
    setErrMsg("");
    try {
      setLoading(true);
      const data = await adminListTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setOkMsg("");
    setErrMsg("");
    if (!newCode.trim()) return setErrMsg("Nhập code bàn (vd: T01).");

    try {
      setLoading(true);
      await adminCreateTable({ code: newCode.trim(), capacity: Number(newCap) });
      setNewCode("");
      setNewCap(4);
      setShowCreate(false);
      await load();
      setOkMsg("✅ Tạo bàn thành công.");
    } catch (e) {
      setErrMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function save(edit) {
    setOkMsg("");
    setErrMsg("");
    try {
      setLoading(true);
      await adminUpdateTable(edit.id, {
        code: edit.code,
        capacity: Number(edit.capacity),
        status: edit.status,
      });
      await load();
      setOkMsg("✅ Đã lưu thay đổi.");
    } catch (e) {
      setErrMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    setOkMsg("");
    setErrMsg("");
    if (!window.confirm("Xóa bàn này?")) return;

    try {
      setLoading(true);
      await adminDeleteTable(id);
      await load();
      setOkMsg("✅ Đã xóa bàn.");
    } catch (e) {
      setErrMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function copyToken(token) {
    setOkMsg("");
    setErrMsg("");
    try {
      await navigator.clipboard.writeText(token);
      setOkMsg("✅ Đã copy qrToken.");
    } catch {
      setErrMsg("Không copy được (trình duyệt chặn clipboard). Bạn bôi đen token rồi Ctrl+C nhé.");
    }
  }

  return (
    <div className="grid gap-4">
      {/* Tables list first */}
      <div className="rounded-2xl border bg-white p-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Tables</div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="rounded-xl bg-black px-3 py-2 text-sm text-white"
            >
              {showCreate ? "Đóng tạo bàn" : "Tạo bàn"}
            </button>

            <button
              onClick={load}
              disabled={loading}
              className="rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {errMsg && <div className="mt-3 text-sm text-red-600">{errMsg}</div>}
        {okMsg && <div className="mt-3 text-sm text-emerald-700">{okMsg}</div>}

        <table className="mt-3 w-full text-sm">
          <thead className="text-slate-600 border-b">
            <tr>
              <th className="text-left py-2 pr-2">ID</th>
              <th className="text-left py-2 pr-2">Code</th>
              <th className="text-left py-2 pr-2">Capacity</th>
              <th className="text-left py-2 pr-2">Status</th>
              <th className="text-left py-2 pr-2">qrToken</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <TableRow
                key={t.id}
                row={t}
                onSave={save}
                onDelete={del}
                onCopy={copyToken}
                loading={loading}
              />
            ))}
            {tables.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-slate-500">
                  Chưa có bàn.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-2 text-xs text-slate-500">
          Link cho khách:{" "}
          <span className="font-mono">/customer?token=QR_TOKEN</span>
        </div>
      </div>

      {/* Create form BELOW */}
      {showCreate && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="font-semibold">Create Table</div>

          <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm font-medium">Code</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="T01"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                type="number"
                min={1}
                value={newCap}
                onChange={(e) => setNewCap(e.target.value)}
              />
            </div>
            <button
              onClick={create}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Tạo xong bàn sẽ tự sinh <b>qrToken</b> để bạn copy in QR.
          </div>
        </div>
      )}
    </div>
  );
}

function TableRow({ row, onSave, onDelete, onCopy, loading }) {
  const [edit, setEdit] = useState({ ...row });

  // ✅ sync khi row thay đổi sau refresh/load
  useEffect(() => {
    setEdit({ ...row });
  }, [row]);

  return (
    <tr className="border-b align-top">
      <td className="py-2 pr-2">{row.id}</td>

      <td className="py-2 pr-2">
        <input
          className="w-28 rounded-lg border px-2 py-1"
          value={edit.code ?? ""}
          onChange={(e) => setEdit((p) => ({ ...p, code: e.target.value }))}
        />
      </td>

      <td className="py-2 pr-2">
        <input
          className="w-20 rounded-lg border px-2 py-1"
          type="number"
          min={1}
          value={edit.capacity ?? 1}
          onChange={(e) => setEdit((p) => ({ ...p, capacity: e.target.value }))}
        />
      </td>

      <td className="py-2 pr-2">
        <select
          className="rounded-lg border px-2 py-1"
          value={edit.status ?? "AVAILABLE"}
          onChange={(e) => setEdit((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="OCCUPIED">OCCUPIED</option>
          <option value="REQUESTING_BILL">REQUESTING_BILL</option>
          <option value="CLEANING">CLEANING</option>
        </select>
      </td>

      <td className="py-2 pr-2">
        <div className="font-mono text-xs break-all">{row.qrToken}</div>
        <button
          className="mt-1 text-xs underline"
          onClick={() => onCopy(row.qrToken)}
          disabled={loading}
        >
          Copy
        </button>
      </td>

      <td className="py-2 text-right space-x-2 whitespace-nowrap">
        <button
          onClick={() => onSave(edit)}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-60"
        >
          Save
        </button>
        <button
          onClick={() => onDelete(row.id)}
          disabled={loading}
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-white disabled:opacity-60"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
