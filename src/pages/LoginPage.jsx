import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { clearAuth, setAuth } from "../auth/authStore";

/* ====== THEME GỖ ====== */
const wood = {
  bg: "#fbf7f2",
  card: "rgba(255,255,255,0.82)",
  line: "rgba(0,0,0,0.10)",
  text: "#2f1f12",
  sub: "rgba(47,31,18,0.70)",
  btn1: "#7c522e",
  btn2: "#462e1b",
};

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const u = username.trim();
    if (!u || !password) {
      setErr("Vui lòng nhập username và password");
      return;
    }

    // ✅ RẤT QUAN TRỌNG: xoá session cũ (tránh dính role cũ)
    clearAuth();

    try {
      setLoading(true);

      // ✅ Lưu auth trước để interceptor trong api/client.js tự gắn Authorization
      // roles để rỗng trước, lát update sau khi /api/me trả về
      setAuth({ username: u, password, roles: [] });

      // ✅ Gọi /api/me (request sẽ tự có Authorization nhờ interceptor)
      const res = await api.get(ENDPOINTS.me);

      const roles = res.data?.roles || [];
      setAuth({ username: u, password, roles });

      // ✅ Điều hướng CHUẨN theo role
      if (roles.includes("ROLE_ADMIN")) {
        nav("/admin", { replace: true });
      } else if (roles.includes("ROLE_WAITER")) {
        nav("/waiter", { replace: true });
      } else if (roles.includes("ROLE_CASHIER")) {
        nav("/cashier", { replace: true });
      } else {
        nav("/customer", { replace: true });
      }
    } catch (e2) {
      clearAuth();
      setErr(e2?.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow} />
      <div style={styles.bgWood} />

      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.title}>Đăng nhập nhân viên</div>
            <div style={styles.subTitle}>Admin / Waiter / Cashier (Basic Auth)</div>
          </div>

          <form onSubmit={onSubmit} style={styles.form}>
            <Field label="Username">
              <input
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vd: admin"
                autoComplete="username"
              />
            </Field>

            <Field label="Password">
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>

            {err && <div style={styles.error}>{err}</div>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>

            <div style={styles.hint}>Sau khi đăng nhập sẽ tự chuyển trang theo role.</div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ====== COMPONENT PHỤ ====== */
function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: wood.sub }}>{label}</div>
      {children}
    </div>
  );
}

/* ====== STYLE ====== */
const styles = {
  page: {
    minHeight: "100vh",
    background: wood.bg,
    position: "relative",
    overflow: "hidden",
    fontFamily: "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial",
    color: wood.text,
  },

  bgGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(900px 500px at 20% 0%, rgba(154,106,61,.20), transparent 60%), radial-gradient(800px 500px at 85% 15%, rgba(95,63,36,.14), transparent 55%), linear-gradient(180deg, rgba(251,247,242,1), rgba(255,255,255,1))",
    zIndex: 0,
  },

  bgWood: {
    position: "absolute",
    inset: 0,
    opacity: 0.22,
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(154,106,61,.12) 0px, rgba(154,106,61,.12) 10px, rgba(95,63,36,.10) 10px, rgba(95,63,36,.10) 20px)",
    zIndex: 0,
    pointerEvents: "none",
  },

  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    position: "relative",
    zIndex: 1,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: wood.card,
    border: `1px solid ${wood.line}`,
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(47,31,18,.10)",
    backdropFilter: "blur(10px)",
  },

  header: {
    padding: 20,
    background: "linear-gradient(135deg, rgba(154,106,61,.20), rgba(95,63,36,.10))",
    borderBottom: `1px solid ${wood.line}`,
  },

  title: { fontSize: 22, fontWeight: 800 },
  subTitle: { marginTop: 6, fontSize: 13, color: wood.sub },

  form: { padding: 20, display: "grid", gap: 14 },

  input: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(154,106,61,.25)",
    background: "rgba(255,255,255,.95)",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
  },

  button: {
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 800,
    color: "white",
    cursor: "pointer",
    background: `linear-gradient(135deg, ${wood.btn1}, ${wood.btn2})`,
    boxShadow: "0 12px 25px rgba(95,63,36,.22)",
  },

  error: {
    borderRadius: 16,
    padding: "10px 12px",
    border: "1px solid rgba(239,68,68,.25)",
    background: "rgba(239,68,68,.08)",
    color: "rgb(185,28,28)",
    fontSize: 13,
  },

  hint: { fontSize: 12, color: wood.sub },
};
