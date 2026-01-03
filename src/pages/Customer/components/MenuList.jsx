import { useEffect, useState } from "react";
import { getPublicMenu } from "../../../api/menu.api";
import { getErrMsg } from "../../../utils/httpError";

export default function MenuList({ onAdd }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadMenu() {
    setMsg("");
    try {
      setLoading(true);
      const data = await getPublicMenu();
      setMenu(data);
    } catch (e) {
      setMsg(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Menu</div>
        <button
          onClick={loadMenu}
          className="text-sm underline disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>

      {msg && <div className="mt-2 text-sm text-red-600">{msg}</div>}

      <div className="mt-3 grid gap-2">
        {menu.map((it) => (
          <div key={it.id} className="flex items-center justify-between rounded-xl border p-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{it.name}</div>
              <div className="text-sm text-slate-600">
                {it.price.toLocaleString("vi-VN")} đ
              </div>
              {!it.isAvailable && (
                <div className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  Hết món
                </div>
              )}
            </div>

            <button
              onClick={() => onAdd?.(it)}
              disabled={!it.isAvailable}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              + Thêm
            </button>
          </div>
        ))}

        {!loading && menu.length === 0 && !msg && (
          <div className="text-sm text-slate-500">Menu đang rỗng (chưa có dữ liệu).</div>
        )}
      </div>
    </div>
  );
}
