import TablesPanel from "./components/TablesPanel";

export default function WaiterPage() {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-lg font-semibold">Waiter Dashboard</div>
        <div className="text-sm text-slate-500">
          Mở bàn • Xem DRAFT • Confirm • Request bill • Đổi trạng thái bàn
        </div>
      </div>
      <TablesPanel />
    </div>
  );
}
