import React from "react";
import { Plus, Sparkles, Leaf, Lock } from "lucide-react";

export default function MenuList({ menu = [], onAdd, loading, disabled = false }) {
  if (!menu || menu.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 18 }}>
        <Leaf size={48} color="#f59e0b" style={{ marginBottom: 12 }} />
        <p style={{ margin: 0, fontWeight: 700, color: "var(--mq-text)" }}>
          Thực đơn đang được chuẩn bị...
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="menuHeader">
        <div className="menuHeaderLeft">
          <div className="menuSpark">
            <Sparkles size={18} color="white" />
          </div>
          <h2 className="menuTitle">Thực Đơn Quán</h2>
        </div>

        <span className="menuBadge">{menu.length} món đặc sắc</span>
      </div>

      {/* ✅ Nếu đã gửi order, hiển thị note nhỏ */}
      {disabled && (
        <div
          style={{
            margin: "6px 0 16px",
            padding: "10px 12px",
            borderRadius: 16,
            background: "rgba(255,247,237,0.9)",
            border: "1px solid rgba(252,211,77,0.35)",
            fontWeight: 800,
            color: "rgba(120,53,15,0.85)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Lock size={16} />
          Bạn đã gửi order. Vui lòng chờ nhân viên xác nhận.
        </div>
      )}

      <div className="menuGrid">
        {menu.map((item) => {
          const isDisabled = disabled || loading || item.isAvailable === false;

          return (
            <div
              key={item.id}
              className="menuCard"
              style={disabled ? { opacity: 0.95 } : undefined}
            >
              <div className="menuMediaWrap">
                <div className="menuMedia">
                  <img
                    src={resolveImage(item.imageUrl)}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x450?text=Moc+Quan";
                    }}
                    style={
                      !item.isAvailable
                        ? { filter: "grayscale(1)", opacity: 0.6 }
                        : undefined
                    }
                  />

                  {!item.isAvailable && (
                    <div className="soldOutOverlay">
                      <span className="soldOutTag">Hết hàng</span>
                    </div>
                  )}

                  <div className="pricePill">
                    {(item.price || 0).toLocaleString()}đ
                  </div>
                </div>
              </div>

              <div className="menuBody">
                <div>
                  <h3 className="menuName">{item.name}</h3>
                  <p className="menuDesc">Hương vị truyền thống Mộc Quán</p>
                </div>

                <button
                  className={`addBtn ${isDisabled ? "disabled" : ""}`}
                  disabled={isDisabled}
                  type="button"
                  onClick={() => onAdd?.(item)}
                  title={
                    disabled
                      ? "Bạn đã gửi order, vui lòng chờ nhân viên xác nhận"
                      : !item.isAvailable
                      ? "Món tạm hết"
                      : ""
                  }
                >
                  {disabled ? (
                    <>
                      <Lock size={18} />
                      Đã gửi
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      {isDisabled ? "Tạm hết" : "Thêm món"}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function resolveImage(url) {
  if (!url) return "https://placehold.co/600x450?text=Moc+Quan";
  if (url.startsWith("http")) return url;
  const BASE_URL = "http://localhost:8080";
  return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}
