import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import Toast from "../components/common/Toast";
import { useSound } from "../hooks/useSound";
import "../styles/kds.css";

export default function KitchenKDS() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { playAlert } = useSound();
  const { toasts, showToast, removeToast } = useToast();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/active").then(res => setOrders(res.data));

    socket.on("order:new", (order) => {
      playAlert();
      setOrders(prev => {
        const exists = prev.find(o => o._id === order._id);
        if (exists) return prev;
        showToast("New order received!", "success");
        return [order, ...prev];
      });
    });

    socket.on("order:update", (updated) => {
      setOrders(prev =>
        prev.map(o => o._id === updated._id ? updated : o)
      );
    });

    socket.on("order:completed", (completed) => {
      setOrders(prev =>
        prev.filter(o => o._id !== completed._id)
      );
    });

    return () => {
      socket.off("order:new");
      socket.off("order:update");
      socket.off("order:completed");
    };
  }, []);

  const updateStatus = async (orderId, index, status) => {
    try {
      await api.put("/orders/item-status", {
        orderId,
        itemIndex: index,
        status
      });
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  return (
    <div className="kds-shell">

      {/* TOPBAR */}
      <div className="kds-topbar">
        <h2>🍳 Kitchen Display</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ opacity: 0.5, fontSize: 13 }}>
            {orders.length} active orders
          </span>
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
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
            <span>🍽</span>
            <p>No active orders</p>
          </div>
        ) : (
          orders.map(order => (
            <TicketCard
              key={order._id}
              order={order}
              onUpdate={updateStatus}
            />
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

function TicketCard({ order, onUpdate }) {
  const [elapsed, setElapsed] = useState("0:00");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const created = new Date(order.createdAt);
      const now = new Date();
      const diff = Math.floor((now - created) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      setIsUrgent(mins >= 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const allReady = order.items.every(i => i.status === "ready");
  const pendingCount = order.items.filter(
    i => i.status === "pending"
  ).length;

  return (
    <div className={`kds-ticket glass-card ${allReady ? "all-ready" : ""} ${isUrgent ? "urgent" : ""}`}>

      {/* TICKET HEADER */}
      <div className="ticket-header">
        <div>
          <h3 style={{ margin: 0 }}>
            Table {order.table?.tableNumber}
          </h3>
          <small style={{ opacity: 0.5, fontSize: 12 }}>
            {order.items.length} items •{" "}
            {pendingCount} pending
          </small>
        </div>
        <span className={`kds-timer ${isUrgent ? "urgent" : ""}`}>
          {elapsed}
        </span>
      </div>

      {/* ITEMS */}
      <div className="ticket-items">
        {order.items.map((item, index) => (
          <div
            key={index}
            className={`ticket-item ${item.status}`}
          >
            <span className="ticket-item-name">
              {item.quantity} × {item.name}
            </span>

            <div className="ticket-actions">
              {item.status === "pending" && (
                <button
                  className="kds-btn start"
                  onClick={() =>
                    onUpdate(order._id, index, "in_progress")
                  }
                >
                  Start
                </button>
              )}
              {item.status === "in_progress" && (
                <button
                  className="kds-btn ready"
                  onClick={() =>
                    onUpdate(order._id, index, "ready")
                  }
                >
                  ✓ Ready
                </button>
              )}
              {item.status === "ready" && (
                <span className="ready-label">
                  ✓ Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ALL READY BADGE */}
      {allReady && (
        <div className="all-ready-badge">
          ✅ All Items Ready — Awaiting Pickup
        </div>
      )}

    </div>
  );
}