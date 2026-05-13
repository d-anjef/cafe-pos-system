import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import socket from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/common/Toast";
import DesignerCanvas from "../../components/layoutDesigner/DesignerCanvas";
import MenuGrid from "../../components/waiter/MenuGrid";
import CartPanel from "../../components/waiter/CartPanel";
import SettlementModal from "../../components/SettlementModal";
import "../../styles/designer.css";
import "../../styles/waiter.css";

export default function WaiterFloorPlan() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [layout, setLayout] = useState(null);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [layoutRes, tablesRes, menuRes] = await Promise.all([
        api.get("/layout"),
        api.get("/tables"),
        api.get("/menu/item")
      ]);
      setLayout(layoutRes.data);
      setTables(tablesRes.data);
      setMenuItems(menuRes.data);
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    socket.on("table:update", (updated) => {
      setTables(prev =>
        prev.map(t => t._id === updated._id ? updated : t)
      );
      setSelectedTable(prev =>
        prev?._id === updated._id ? updated : prev
      );
    });

    socket.on("order:update", (updated) => {
      if (activeOrder?._id === updated._id) {
        setActiveOrder(updated);
      }
    });

    socket.on("order:completed", () => {
      setShowPanel(false);
      setShowSettlement(false);
      setSelectedTable(null);
      setActiveOrder(null);
      setCart([]);
      loadData();
    });

    return () => {
      socket.off("table:update");
      socket.off("order:update");
      socket.off("order:completed");
    };
  }, [loadData]);

  const handleTableClick = async (tableMeta) => {
    if (!tableMeta) return;

    setSelectedTable(tableMeta);
    setCart([]);
    setShowSettlement(false);

    if (tableMeta.status === "available") {
      setActiveOrder(null);
      setShowPanel(true);
      return;
    }

    try {
      const res = await api.get(
        `/orders/active-by-table/${tableMeta._id}`
      );
      setActiveOrder(res.data);
    } catch {
      setActiveOrder(null);
    }

    if (tableMeta.status === "bill_requested") {
      setShowSettlement(true);
      setShowPanel(false);
    } else {
      setShowPanel(true);
      setShowSettlement(false);
    }
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

  if (loading) return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      color: "var(--primary-gold)"
    }}>
      <div style={{ fontSize: 40 }}>🌿</div>
      <p style={{ fontSize: 18 }}>Loading Floor Plan...</p>
    </div>
  );

  return (
    <div className="designer-shell">

      {/* TOPBAR */}
      <div className="designer-topbar">
        <h3>🌿 GARDEN & CAFE</h3>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot"
              style={{ background: "#4caf50" }}
            />
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot"
              style={{ background: "#d4af37" }}
            />
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot"
              style={{ background: "#e53935" }}
            />
            <span>Bill Requested</span>
          </div>
        </div>

        <span style={{ fontSize: 13, opacity: 0.6 }}>
          {new Date().toDateString()}
        </span>
        <span style={{
          fontWeight: 700,
          color: "var(--primary-gold)"
        }}>
          {user?.name?.toUpperCase()}
        </span>
        <button
          className="gold-btn"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {/* BODY */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: showPanel ? "1fr 380px" : "1fr",
        overflow: "hidden",
        transition: "grid-template-columns 0.3s ease"
      }}>

        {/* CANVAS */}
        <DesignerCanvas
          layout={layout}
          setLayout={setLayout}
          tables={tables}
          selectedIdx={null}
          setSelectedIdx={() => {}}
          isAdminMode={false}
          onTableClick={handleTableClick}
        />

        {/* ORDER PANEL */}
        {showPanel && selectedTable && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid var(--border-soft)",
            overflow: "hidden",
            background: "white"
          }}>

            {/* PANEL HEADER */}
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-soft)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "white"
            }}>
              <div>
                <strong style={{ fontSize: 16 }}>
                  Table {selectedTable.tableNumber}
                </strong>
                <span style={{
                  marginLeft: 10,
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background:
                    selectedTable.status === "available"
                      ? "rgba(76,175,80,0.12)"
                      : selectedTable.status === "occupied"
                        ? "rgba(212,175,55,0.15)"
                        : "rgba(229,57,53,0.1)",
                  color:
                    selectedTable.status === "available"
                      ? "#4caf50"
                      : selectedTable.status === "occupied"
                        ? "#d4af37"
                        : "#e53935",
                  fontWeight: 700,
                  textTransform: "capitalize"
                }}>
                  {selectedTable.status.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowPanel(false);
                  setSelectedTable(null);
                  setCart([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  opacity: 0.5
                }}
              >
                ✕
              </button>
            </div>

            {/* ACTIVE ORDER */}
            {activeOrder && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(212,175,55,0.06)",
                borderBottom: "1px solid var(--border-soft)"
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8
                }}>
                  Current Order
                </div>
                {activeOrder.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "4px 0"
                  }}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background:
                        item.status === "ready"
                          ? "rgba(76,175,80,0.12)"
                          : item.status === "in_progress"
                            ? "rgba(212,175,55,0.15)"
                            : "rgba(255,152,0,0.12)",
                      color:
                        item.status === "ready"
                          ? "#4caf50"
                          : item.status === "in_progress"
                            ? "#d4af37"
                            : "#ff9800",
                      fontWeight: 700
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
                <div style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px solid var(--border-soft)",
                  fontWeight: 700,
                  color: "var(--primary-gold)",
                  fontSize: 14
                }}>
                  Running Total: ₹{activeOrder.totalAmount?.toFixed(2)}
                </div>
              </div>
            )}

            {/* MENU GRID */}
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              <MenuGrid
                items={menuItems}
                cart={cart}
                setCart={setCart}
                disabled={
                  selectedTable?.status === "bill_requested"
                }
              />
            </div>

            {/* CART */}
            <CartPanel
              cart={cart}
              setCart={setCart}
              selectedTable={selectedTable}
              onViewBill={handleViewBill}
              showToast={showToast}
            />

          </div>
        )}
      </div>

      {/* SETTLEMENT */}
      {showSettlement && activeOrder && (
        <SettlementModal
          order={activeOrder}
          onClose={() => setShowSettlement(false)}
          onComplete={() => {
            setShowSettlement(false);
            setShowPanel(false);
            setSelectedTable(null);
            setActiveOrder(null);
            setCart([]);
            showToast("Payment completed!", "success");
            loadData();
          }}
        />
      )}

      {/* TOASTS */}
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