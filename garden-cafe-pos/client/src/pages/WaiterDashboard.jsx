import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import Toast from "../components/common/Toast";
import MenuGrid from "../components/waiter/MenuGrid";
import CartPanel from "../components/waiter/CartPanel";
import SettlementModal from "../components/SettlementModal";
import "../styles/waiter.css";

export default function WaiterDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [tables, setTables] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [showSettlement, setShowSettlement] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const loadData = useCallback(async () => {
    const [tablesRes, itemsRes] = await Promise.all([
      api.get("/tables"),
      api.get("/menu/item")
    ]);
    setTables(tablesRes.data);
    setItems(itemsRes.data);
  }, []);

  useEffect(() => {
    loadData();

    socket.on("table:update", (updatedTable) => {
      setTables(prev =>
        prev.map(t => t._id === updatedTable._id ? updatedTable : t)
      );
      setSelectedTable(prev =>
        prev?._id === updatedTable._id ? updatedTable : prev
      );
    });

    socket.on("order:new", () => {
      if (selectedTable) loadActiveOrder(selectedTable._id);
    });

    socket.on("order:update", (updated) => {
      if (activeOrder?._id === updated._id) {
        setActiveOrder(updated);
      }
    });

    return () => {
      socket.off("table:update");
      socket.off("order:new");
      socket.off("order:update");
    };
  }, [loadData]);

  const loadActiveOrder = async (tableId) => {
    try {
      const res = await api.get(`/orders/active-by-table/${tableId}`);
      setActiveOrder(res.data);
    } catch {
      setActiveOrder(null);
    }
  };

  const handleTableSelect = async (table) => {
    setLoadingTable(true);
    setSelectedTable(table);
    setCart([]);
    setShowSettlement(false);

    if (table.status !== "available") {
      await loadActiveOrder(table._id);
    } else {
      setActiveOrder(null);
    }

    setLoadingTable(false);
  };

  const handleViewBill = async () => {
    try {
      const res = await api.get(
        `/orders/active-by-table/${selectedTable._id}`
      );
      setActiveOrder(res.data);
      setShowSettlement(true);
    } catch {
      showToast("No active order found", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getTableColor = (status, isSelected) => {
    const colors = {
      available: "#4caf50",
      occupied: "#d4af37",
      bill_requested: "#e53935"
    };
    return colors[status] || "#ccc";
  };

  return (
    <div className="waiter-shell">

      {/* TOPBAR */}
      <div className="waiter-topbar glass-card">
        <h3>🌿 GARDEN & CAFE</h3>
        <span className="waiter-date">
          {new Date().toDateString()}
        </span>
        <span className="waiter-name">
          {user?.name?.toUpperCase()}
        </span>
        <button
          className="gold-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* TABLE STRIP */}
      <div className="table-strip">
        {tables.map(table => (
          <div
            key={table._id}
            className={`table-pill ${selectedTable?._id === table._id ? "selected" : ""}`}
            style={{ background: getTableColor(table.status) }}
            onClick={() => handleTableSelect(table)}
          >
            <span>T{table.tableNumber}</span>
          </div>
        ))}
      </div>

      {/* BODY */}
      <div className="waiter-body">

        {/* MENU GRID */}
        <div className="menu-section">
          {!selectedTable ? (
            <div className="select-table-msg">
              <span>👆</span>
              <p>Select a table to start ordering</p>
            </div>
          ) : (
            <>
              {/* ACTIVE ORDER DISPLAY */}
              {activeOrder && (
                <div className="active-order-display glass-card">
                  <h4>Current Order</h4>
                  {activeOrder.items.map((item, i) => (
                    <div key={i} className="active-order-row">
                      <span>{item.quantity} × {item.name}</span>
                      <span className={`item-status-badge ${item.status}`}>
                        {item.status}
                      </span>
                      <span>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="active-order-total">
                    Running Total: ₹{activeOrder.totalAmount?.toFixed(2)}
                  </div>
                </div>
              )}

              <MenuGrid
                items={items}
                cart={cart}
                setCart={setCart}
                disabled={
                  selectedTable?.status === "bill_requested"
                }
              />
            </>
          )}
        </div>

        {/* CART PANEL */}
        <CartPanel
          cart={cart}
          setCart={setCart}
          selectedTable={selectedTable}
          onViewBill={handleViewBill}
          showToast={showToast}
        />

      </div>

      {/* SETTLEMENT MODAL */}
      {showSettlement && activeOrder && (
        <SettlementModal
          order={activeOrder}
          onClose={() => setShowSettlement(false)}
          onComplete={() => {
            setShowSettlement(false);
            setSelectedTable(null);
            setActiveOrder(null);
            setCart([]);
            showToast("Payment completed successfully!", "success");
            loadData();
          }}
        />
      )}

      {/* TOAST NOTIFICATIONS */}
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