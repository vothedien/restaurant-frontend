import AuthGate from "../../auth/AuthGate";
import BillPanel from "./components/BillPanel";
import { ChefHat } from "lucide-react";

export default function CashierPage() {
  return (
    <AuthGate
      title="Cashier Login (Basic Auth)"
      allowedRoles={["ROLE_CASHIER", "ROLE_ADMIN"]}
    >
      <div className="staffPage">
        <header className="staffHeader">
          <div className="staffHeaderInner">
            <div className="staffBrand">
              <div className="brandIcon">
                <ChefHat size={22} color="#78350f" />
              </div>
              <div>
                <h1 className="staffBrandTitle">Mộc Quán</h1>
                <p className="staffBrandSub">THANH TOÁN & HÓA ĐƠN</p>
              </div>
            </div>

            <div className="staffRolePill">
              <span className="staffRoleDot" />
              CASHIER
            </div>
          </div>
          <div className="headerLine" />
        </header>

        <main className="staffMain">
          <div className="staffCard">
            <div className="staffCardTitle">
              <h2>Bill & Checkout</h2>
              <div className="staffCardHint">Lấy bill → checkout → hoàn tất</div>
            </div>

            <BillPanel />
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
