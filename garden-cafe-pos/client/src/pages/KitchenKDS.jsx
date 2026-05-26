import { useEffect, useState } from "react";
import api from "../services/api";
import socket, { joinBranchRoom } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useBranch } from "../context/BranchContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import Toast from "../components/common/Toast";
import { useSound } from "../hooks/useSound";
import "../styles/kds.css";

export default function KitchenKDS() {
  const { logout, user } = useAuth();
  const { activeBranch } = useBranch();
  const navigate = useNavigate();
  const { playAlert } = useSound();
  const { toasts, showToast, removeToast } = useToast();
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    if (!activeBranch) return;
    try {
      const res = await api.get(`/orders/active?branchId=${activeBranch._id}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!activeBranch) return;

    loadOrders();
    joinBranchRoom(activeBranch._id);

    socket.on("order:new", (order) => {
      playAlert();
      showToast(`New order — Table ${order.table?.tableNumber}`, "success");
      setOrders(prev => {
        const exists = prev.find(o => o._id === order._id);
        if (exists) {
          return prev.map(o => o._id === order._id ? order : o);
        }
        return [order, ...prev];
      });
    });

    socket.on("order:completed", (completed) => {
      setOrders(prev => prev.filter(o => o._id !== completed._id));
    });

    // Auto-refresh every 30s as fallback
    const interval = setInterval(loadOrders, 30000);

    return () => {
      socket.off("order:new");
      socket.off("order:completed");
      clearInterval(interval);
    };
  }, [activeBranch]);

  const orgName = user?.organization?.name || "Kitchen";

  return (
    <div className="kds-shell">

      {/* TOPBAR */}
      <div className="kds-topbar">
        <h2>🍳 {orgName.toUpperCase()} — Kitchen</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{
            background: orders.length > 0 ? "#d4af37" : "#4caf50",
            color: "white",
            padding: "6px 14px",
            borderRadius: 20,
            fontWeight: 700,
            fontSize: 13
          }}>
            {orders.length} active order{orders.length !== 1 ? "s" : ""}
          </span>

          <button
            onClick={loadOrders}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600
            }}
            title="Refresh manually if needed"
          >
            🔄 Refresh
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "white",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* TICKETS */}
      <div className="kds-container">
        {orders.length === 0 ? (
          <div className="kds-empty">
            <span style={{ fontSize: 80 }}>🍽</span>
            <p>No active orders</p>
            <small style={{ opacity: 0.5 }}>Waiting for new orders...</small>
          </div>
        ) : (
          orders.map(order => (
            <TicketCard key={order._id} order={order} />
          ))
        )}
      </div>

      {/* TOAST */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

    </div>
  );
}

// ============================================================
// TICKET CARD — READ-ONLY DISPLAY
// ============================================================
function TicketCard({ order }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="kds-ticket glass-card">

      {/* HEADER */}
      <div className="ticket-header" style={{ borderBottom: "2px solid #d4af37", paddingBottom: 10, marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, color: "#d4af37" }}>
            Table {order.table?.tableNumber}
          </h2>
          <small style={{ opacity: 0.6, fontSize: 12 }}>
            #{order.orderNumber}
          </small>
        </div>
        <div style={{
          background: "#d4af37",
          color: "white",
          padding: "6px 14px",
          borderRadius: 20,
          fontWeight: 700,
          fontSize: 14
        }}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ITEMS — BIG & READABLE */}
      <div className="ticket-items">
        {order.items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "12px 14px",
              marginBottom: 8,
              background: "rgba(212, 175, 55, 0.08)",
              borderLeft: "4px solid #d4af37",
              borderRadius: 8
            }}
          >
            {/* Quantity + Name */}
            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              fontSize: 20,
              fontWeight: 800,
              color: "#1a1a1a"
            }}>
              <span style={{
                background: "#d4af37",
                color: "white",
                padding: "2px 12px",
                borderRadius: 6,
                fontSize: 18,
                minWidth: 40,
                textAlign: "center"
              }}>
                {item.quantity}×
              </span>
              <span>{item.displayName || item.name}</span>
            </div>

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <div style={{
                fontSize: 14,
                opacity: 0.75,
                marginTop: 6,
                paddingLeft: 54,
                fontWeight: 500
              }}>
                {item.variants.map((v, i) => (
                  <span key={i}>
                    {v.groupName}: <strong>{v.optionName}</strong>
                    {i < item.variants.length - 1 ? " · " : ""}
                  </span>
                ))}
              </div>
            )}

            {/* Special requests */}
            {item.specialRequests && (
              <div style={{
                fontSize: 13,
                color: "#e53935",
                marginTop: 6,
                paddingLeft: 54,
                fontWeight: 700
              }}>
                ⚠ {item.specialRequests}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TIME RECEIVED */}
      <div style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: "1px dashed rgba(0,0,0,0.1)",
        fontSize: 12,
        opacity: 0.6,
        textAlign: "center"
      }}>
        Received at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

    </div>
  );
}