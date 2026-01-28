import AuthGate from "../../auth/AuthGate";
import TablesPanel from "./components/TablesPanel";

export default function WaiterPage() {
  return (
    <AuthGate
      title="Waiter Login (Basic Auth)"
      allowedRoles={["ROLE_WAITER", "ROLE_ADMIN"]}
    >
      <TablesPanel />
    </AuthGate>
  );
}
