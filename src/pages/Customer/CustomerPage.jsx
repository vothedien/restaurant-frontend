import { useState } from "react";
import MenuList from "./components/MenuList";

export default function CustomerPage() {
  const [cart, setCart] = useState({}); // demo

  function onAdd(item) {
    setCart((prev) => {
      const cur = prev[item.id] || { qty: 0, name: item.name, price: item.price };
      return { ...prev, [item.id]: { ...cur, qty: cur.qty + 1 } };
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MenuList onAdd={onAdd} />
      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold">Cart (demo)</div>
        <pre className="mt-2 text-xs bg-slate-50 p-2 rounded-xl overflow-auto">
          {JSON.stringify(cart, null, 2)}
        </pre>
      </div>
    </div>
  );
}
