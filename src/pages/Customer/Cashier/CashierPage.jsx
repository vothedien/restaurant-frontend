import BillPanel from "./components/BillPanel";

export default function CashierPage() {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-lg font-semibold">Cashier Dashboard</div>
        <div className="text-sm text-slate-500">
          Load Bill • Checkout • Lưu Payment • Chuyển bàn sang CLEANING
        </div>
      </div>
      <BillPanel />
    </div>
  );
}
