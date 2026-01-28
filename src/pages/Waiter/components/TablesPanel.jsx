import { useEffect, useMemo, useRef, useState } from "react";
import {
  listTables,
  openTable,
  requestBill,
  setCleaning,
  setAvailable,
} from "../../../api/tables.api";
import {
  getDraftByTable,
  confirmDraft,
  rejectDraft,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
} from "../../../api/orders.api";
import { getPublicMenu } from "../../../api/public.api";
import {
  RefreshCcw,
  LayoutGrid,
  ClipboardList,
  Check,
  X,
  Plus,
  UtensilsCrossed,
  DoorOpen,
  Receipt,
  SprayCan,
  BadgeCheck,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";

function badgeClass(status) {
  if (status === "AVAILABLE") return "badge available";
  if (status === "OCCUPIED") return "badge occupied";
  if (status === "REQUESTING_BILL") return "badge request";
  if (status === "CLEANING") return "badge cleaning";
  return "badge";
}

function formatVND(x) {
  const n = Number(x) || 0;
  return n.toLocaleString("vi-VN") + " ₫";
}

function normalizeItems(draft) {
  // backend có thể trả nhiều kiểu: items, orderItems, orderItems.items, orderItems.content...
  let arr =
    draft?.items ??
    draft?.orderItems ??
    draft?.orderItems?.items ??
    draft?.orderItems?.content ??
    draft?.data?.items ??
    [];

  // nếu backend trả object thay vì array
  if (!Array.isArray(arr)) arr = [];

  return arr.map((it, idx) => ({
    id: it?.id ?? it?.itemId ?? it?.orderItemId ?? `${idx}`,
    name: it?.name ?? it?.menuItemName ?? it?.menuName ?? `Item #${idx + 1}`,
    qty: Number(it?.qty ?? it?.quantity ?? 1) || 1,
    unitPrice: Number(it?.unitPrice ?? it?.price ?? it?.menuPrice ?? 0) || 0,
    note: it?.note ?? it?.customerNote ?? "",
  }));
}

// normalize public menu item (tuỳ BE có thể khác field)
function normalizeMenuItem(mi) {
  return {
    id: mi?.id ?? mi?.menuItemId,
    name: mi?.name ?? mi?.title ?? mi?.menuItemName ?? "Unknown",
    price: Number(mi?.price ?? mi?.unitPrice ?? 0) || 0,
    isAvailable:
      mi?.isAvailable ?? mi?.available ?? mi?.isActive ?? mi?.enabled ?? true,
    categoryName: mi?.categoryName ?? mi?.category?.name ?? "",
  };
}

export default function TablesPanel() {
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);

  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // public menu for waiter add item
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");

  // add item UI
  const [addMenuItemId, setAddMenuItemId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [addNote, setAddNote] = useState("");

  // edit mode
  const [editMode, setEditMode] = useState(false);
  const [editMap, setEditMap] = useState({});
  const [savingId, setSavingId] = useState(null);

  // ✅ scroll lên bảng món sau khi thêm
  const invoiceTableRef = useRef(null);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  const items = useMemo(() => normalizeItems(draft), [draft]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
    [items]
  );

  // sync editMap when draft/items change
  useEffect(() => {
    const next = {};
    for (const it of items) next[it.id] = { qty: it.qty, note: it.note || "" };
    setEditMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.id, items.length]);

  async function loadTables() {
    setErr("");
    setMsg("");
    try {
      setLoading(true);
      const data = await listTables();
      setTables(Array.isArray(data) ? data : []);
      if (!selectedTableId && Array.isArray(data) && data.length) {
        setSelectedTableId(data[0].id);
      }
    } catch (e) {
      setErr(e?.message || "Load tables failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadDraft(tableId) {
    setErr("");
    try {
      const d = await getDraftByTable(tableId);
      setDraft(d || null);
    } catch (_) {
      setDraft(null);
    }
  }

  async function loadMenu() {
    setErr("");
    try {
      setMenuLoading(true);
      const data = await getPublicMenu();
      const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
      const normalized = (Array.isArray(arr) ? arr : []).map(normalizeMenuItem);
      setMenu(normalized);
    } catch (e) {
      setMenu([]);
      setErr(e?.message || "Load public menu failed");
    } finally {
      setMenuLoading(false);
    }
  }

  useEffect(() => {
    loadTables();
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTableId) loadDraft(selectedTableId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTableId]);

  async function doAction(fn, successMsg) {
    setErr("");
    setMsg("");
    try {
      setLoading(true);
      await fn();
      setMsg(successMsg);
      await loadTables();
      if (selectedTableId) await loadDraft(selectedTableId);
    } catch (e) {
      setErr(e?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  function canOpen(t) {
    return t?.status === "AVAILABLE";
  }
  function canRequestBill(t) {
    return t?.status === "OCCUPIED";
  }
  function canSetCleaning(t) {
    return t?.status === "REQUESTING_BILL";
  }
  function canSetAvailable(t) {
    return t?.status === "CLEANING";
  }

  async function handleConfirm() {
    if (!draft?.id) return;
    await doAction(() => confirmDraft(draft.id), "Đã confirm DRAFT → ACTIVE");
  }

  async function handleReject() {
    if (!draft?.id) return;
    const reason = prompt("Lý do từ chối?") || "";
    await doAction(() => rejectDraft(draft.id, reason), "Đã reject order");
  }

  async function handleAddItem() {
  setErr("");
  setMsg("");

  if (!draft?.id) return setErr("Chưa có draft order cho bàn này.");

  const menuItemId = Number(addMenuItemId);
  if (!menuItemId || menuItemId <= 0) return setErr("Chưa chọn món hợp lệ.");

  const qty = Number(addQty);
  if (!qty || qty <= 0) return setErr("qty phải > 0");

  // lấy info món từ menu để optimistic append
  const picked = menu.find((m) => Number(m.id) === menuItemId);

  // ✅ Optimistic: cho món lên ngay trên phiếu (dù backend update chậm)
  const optimisticItem = {
    id: `tmp-${Date.now()}`,
    name: picked?.name || `#${menuItemId}`,
    qty,
    unitPrice: picked?.price || 0,
    note: addNote || "",
  };

  // đẩy ngay lên UI
  setDraft((prev) => {
    if (!prev) return prev;
    const prevItems = Array.isArray(prev.items)
      ? prev.items
      : Array.isArray(prev.orderItems)
      ? prev.orderItems
      : [];
    return {
      ...prev,
      // ưu tiên nhét vào items để normalize đọc được
      items: [...prevItems, optimisticItem],
    };
  });

  try {
    setLoading(true);

    const res = await addOrderItem(draft.id, { menuItemId, qty, note: addNote || "" });

    setMsg("Đã thêm món vào order");

    // ✅ Nếu API trả về order mới -> setDraft luôn (đỡ phụ thuộc loadDraft)
    if (res && (res.id || res.items || res.orderItems)) {
      setDraft(res);
    } else {
      // fallback: reload draft từ server
      await loadDraft(selectedTableId);
    }

    // reset form
    setAddMenuItemId("");
    setAddQty(1);
    setAddNote("");
    setMenuQuery("");
  } catch (e) {
    setErr(e?.message || "Add item failed");

    // nếu fail thì reload lại để bỏ optimistic item
    await loadDraft(selectedTableId);
  } finally {
    setLoading(false);
  }
}


  function onEditChange(itemId, key, value) {
    setEditMap((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [key]: value },
    }));
  }

  async function handleSaveItem(itemId) {
    if (!draft?.id) return;
    const v = editMap[itemId];
    const qty = Number(v?.qty);
    const note = (v?.note ?? "").toString();
    if (!qty || qty <= 0) return setErr("Qty phải > 0");

    try {
      setErr("");
      setMsg("");
      setSavingId(itemId);
      await updateOrderItem(draft.id, itemId, { qty, note });
      setMsg("Đã cập nhật item");
      await loadDraft(selectedTableId);
    } catch (e) {
      setErr(e?.message || "Update item failed");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteItem(itemId) {
    if (!draft?.id) return;
    const ok = window.confirm("Xóa món này khỏi order?");
    if (!ok) return;

    try {
      setErr("");
      setMsg("");
      setSavingId(itemId);
      await deleteOrderItem(draft.id, itemId);
      setMsg("Đã xóa item");
      await loadDraft(selectedTableId);
    } catch (e) {
      setErr(e?.message || "Delete item failed");
    } finally {
      setSavingId(null);
    }
  }

  const filteredMenu = useMemo(() => {
    const q = (menuQuery || "").trim().toLowerCase();
    const base = menu.filter((m) => m?.isAvailable !== false);
    if (!q) return base.slice(0, 80);
    return base
      .filter((m) => (m.name || "").toLowerCase().includes(q))
      .slice(0, 80);
  }, [menu, menuQuery]);

  return (
    <div className="staffGrid">
      {/* LEFT */}
      <div className="staffCard">
        <div className="staffCardHeader">
          <div className="staffCardHeaderLeft">
            <div className="staffIcon">
              <LayoutGrid size={20} />
            </div>
            <div>
              <div className="cardTitle">Danh sách bàn</div>
              <div className="cardSub">Chọn bàn để thao tác</div>
            </div>
          </div>

          <button className="btn btnOutline" onClick={loadTables} disabled={loading} type="button">
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>

        {err && <div className="msgErr">{err}</div>}
        {msg && <div className="msgOk">{msg}</div>}

        <div className="tableList">
          {tables.map((t) => {
            const active = t.id === selectedTableId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTableId(t.id)}
                className={`tableBtn ${active ? "active" : ""}`}
              >
                <div className="tableTopRow">
                  <div className="tableCode">{t.code || `Table #${t.id}`}</div>
                  <span className={badgeClass(t.status)}>{t.status}</span>
                </div>

                {"capacity" in t && <div className="tableCap">Sức chứa: {t.capacity}</div>}
              </button>
            );
          })}
          {tables.length === 0 && <div className="muted">Chưa có bàn.</div>}
        </div>
      </div>

      {/* RIGHT */}
      <div className="staffRight">
        {/* Selected table */}
        <div className="staffCard">
          <div className="staffCardHeader">
            <div className="staffCardHeaderLeft">
              <div className="staffIcon">
                <ClipboardList size={20} />
              </div>
              <div>
                <div className="cardTitle">Bàn đang chọn</div>
                <div className="cardSub">Trạng thái & thao tác</div>
              </div>
            </div>

            {selectedTable ? (
              <span className={badgeClass(selectedTable.status)}>{selectedTable.status}</span>
            ) : null}
          </div>

          {!selectedTable ? (
            <div className="muted">Chọn 1 bàn.</div>
          ) : (
            <>
              <div className="selectedRow">
                <div>
                  <strong>
                    {selectedTable.code}{" "}
                    <span className="muted" style={{ fontWeight: 850 }}>
                      (ID: {selectedTable.id})
                    </span>
                  </strong>
                </div>
                <span className={badgeClass(selectedTable.status)}>{selectedTable.status}</span>
              </div>

              <div className="actionsRow">
                <button
                  className="btn btnOrange"
                  disabled={loading || !canOpen(selectedTable)}
                  onClick={() =>
                    doAction(() => openTable(selectedTable.id), "Đã mở bàn: AVAILABLE → OCCUPIED")
                  }
                  type="button"
                >
                  <DoorOpen size={18} />
                  Open table
                </button>

                <button
                  className="btn btnOutline"
                  disabled={loading || !canRequestBill(selectedTable)}
                  onClick={() =>
                    doAction(() => requestBill(selectedTable.id), "Đã request bill: OCCUPIED → REQUESTING_BILL")
                  }
                  type="button"
                >
                  <Receipt size={18} />
                  Request bill
                </button>

                <button
                  className="btn btnOutline"
                  disabled={loading || !canSetCleaning(selectedTable)}
                  onClick={() =>
                    doAction(() => setCleaning(selectedTable.id), "Đã set cleaning: REQUESTING_BILL → CLEANING")
                  }
                  type="button"
                >
                  <SprayCan size={18} />
                  Set cleaning
                </button>

                <button
                  className="btn btnOutline"
                  disabled={loading || !canSetAvailable(selectedTable)}
                  onClick={() =>
                    doAction(() => setAvailable(selectedTable.id), "Đã set available: CLEANING → AVAILABLE")
                  }
                  type="button"
                >
                  <BadgeCheck size={18} />
                  Set available
                </button>
              </div>
            </>
          )}
        </div>

        {/* Draft */}
        <div className="staffCard">
          <div className="staffCardHeader">
            <div className="staffCardHeaderLeft">
              <div className="staffIcon">
                <UtensilsCrossed size={20} />
              </div>
              <div>
                <div className="cardTitle">Draft order (theo bàn)</div>
                <div className="cardSub">Customer submit → chờ waiter confirm</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                className="btn btnOutline"
                disabled={loading || !selectedTableId}
                onClick={() => setEditMode((v) => !v)}
                type="button"
                title="Bật/tắt chỉnh sửa món"
              >
                <Pencil size={18} />
                {editMode ? "Đang chỉnh" : "Chỉnh sửa"}
              </button>

              <button
                className="btn btnOutline"
                disabled={loading || !selectedTableId}
                onClick={() => selectedTableId && loadDraft(selectedTableId)}
                type="button"
              >
                <RefreshCcw size={18} />
                Reload
              </button>
            </div>
          </div>

          {!selectedTableId ? (
            <div className="muted">Chọn bàn để xem draft.</div>
          ) : !draft ? (
            <div className="muted">Không có draft order.</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              <div className="invoiceBox">
                <div className="invoiceHeader">
                  <div>
                    <div className="invoiceTitle">PHIẾU TẠM (DRAFT)</div>
                    <div className="invoiceMeta">
                      Order: <b>#{draft.id}</b> &nbsp;•&nbsp; Status: <b>{draft.status}</b>
                      <div>
                        Table: <b>{selectedTable?.code || "—"}</b>
                      </div>
                    </div>
                  </div>

                  <span className="miniTag">{items.length} món</span>
                </div>

                <div ref={invoiceTableRef} />

                <table className="invoiceTable">
                  <colgroup>
                    <col style={{ width: "55%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "17.5%" }} />
                    <col style={{ width: "17.5%" }} />
                  </colgroup>

                  <thead>
                    <tr>
                      <th className="colName">MÓN</th>
                      <th className="colQty">SL</th>
                      <th className="colPrice">ĐƠN GIÁ</th>
                      <th className="colTotal">THÀNH TIỀN</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((it) => {
                      const v = editMap[it.id] || { qty: it.qty, note: it.note };
                      const isSaving = savingId === it.id;

                      return (
                        <tr key={it.id}>
                          <td className="colName">
                            <div className="invoiceName">{it.name}</div>

                            {editMode ? (
                              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                                <input
                                  className="inp"
                                  placeholder="Ghi chú (note)"
                                  value={v.note ?? ""}
                                  onChange={(e) => onEditChange(it.id, "note", e.target.value)}
                                  disabled={isSaving}
                                />
                              </div>
                            ) : it.note ? (
                              <div className="invoiceNote">“{it.note}”</div>
                            ) : null}
                          </td>

                          <td className="colQty">
                            {editMode ? (
                              <input
                                className="inp"
                                type="number"
                                min={1}
                                value={v.qty ?? 1}
                                onChange={(e) => onEditChange(it.id, "qty", e.target.value)}
                                disabled={isSaving}
                                style={{ width: 90 }}
                              />
                            ) : (
                              it.qty
                            )}
                          </td>

                          <td className="colPrice">{formatVND(it.unitPrice)}</td>

                          <td className="colTotal">
                            {formatVND((Number(v.qty ?? it.qty) || 1) * it.unitPrice)}

                            {editMode ? (
                              <div
                                style={{
                                  marginTop: 10,
                                  display: "flex",
                                  gap: 8,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  className="btn btnPrimary"
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleSaveItem(it.id)}
                                  title="Lưu thay đổi"
                                >
                                  <Save size={18} />
                                  Lưu
                                </button>

                                <button
                                  className="btn btnOutline"
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleDeleteItem(it.id)}
                                  title="Xóa món"
                                >
                                  <Trash2 size={18} />
                                  Xóa
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}

                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="muted">
                          Chưa có item trong draft.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>

                {/* ADD ITEM BY MENU (edit mode) */}
                {editMode ? (
                  <>
                    <hr className="hrSoft" />

                    <div className="menuPicker">
                      <div className="menuPickerHead">
                        <div className="menuPickerTitle">Thêm món (chọn từ menu)</div>

                        <button
                          className="btn btnOutline"
                          type="button"
                          onClick={loadMenu}
                          disabled={menuLoading}
                          title="Reload menu"
                        >
                          <RefreshCcw size={18} />
                          Menu
                        </button>
                      </div>

                      <div className="menuPickerGrid">
                        <input
                          className="inp"
                          placeholder="Tìm món... (vd: cơm, trà sữa)"
                          value={menuQuery}
                          onChange={(e) => setMenuQuery(e.target.value)}
                        />

                        <select
                          className="inp"
                          value={addMenuItemId}
                          onChange={(e) => setAddMenuItemId(e.target.value)}
                          disabled={menuLoading}
                        >
                          <option value="">-- Chọn món --</option>
                          {filteredMenu.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({formatVND(m.price)})
                              {m.categoryName ? ` • ${m.categoryName}` : ""}
                            </option>
                          ))}
                        </select>

                        <input
                          className="inp"
                          type="number"
                          min={1}
                          placeholder="qty"
                          value={addQty}
                          onChange={(e) => setAddQty(e.target.value)}
                        />

                        <input
                          className="inp"
                          placeholder="note (optional)"
                          value={addNote}
                          onChange={(e) => setAddNote(e.target.value)}
                        />

                        <button
                          className="btn btnOrange"
                          disabled={loading || menuLoading || !addMenuItemId}
                          onClick={handleAddItem}
                          type="button"
                        >
                          <Plus size={18} />
                          Thêm món
                        </button>
                      </div>

                      {menuLoading ? (
                        <div className="muted" style={{ marginTop: 8 }}>
                          Đang tải menu...
                        </div>
                      ) : null}

                      {!menuLoading && menu.length === 0 ? (
                        <div className="muted" style={{ marginTop: 8 }}>
                          Menu rỗng hoặc API trả về không đúng format.
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                <div className="invoiceRowTotal">
                  <div>Tổng tạm tính</div>
                  <div className="invoiceGrand">{formatVND(total)}</div>
                </div>
              </div>

              <div className="actionsRow">
                <button className="btn btnPrimary" disabled={loading} onClick={handleConfirm} type="button">
                  <Check size={18} />
                  Confirm
                </button>

                <button className="btn btnOutline" disabled={loading} onClick={handleReject} type="button">
                  <X size={18} />
                  Reject
                </button>

                <div />
                <div />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
