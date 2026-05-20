import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "../../styles/admin.css";

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const tabs = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "menu", label: "🍽 Menu" },
    { key: "tables", label: "🪑 Tables" },
    { key: "orders", label: "📦 Orders" },
    { key: "layout", label: "🗺 Floor Plan" }
  ];

  return (
    <div className="admin-shell">

      {/* SIDEBAR */}
      <div className="admin-sidebar glass-card">

        <div className="admin-logo">
          <span>🌿</span>
          <h2>GARDEN</h2>
        </div>

        <div className="admin-user">
          <span>{user?.name}</span>
          <small>Administrator</small>
        </div>

        <div className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`sidebar-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          className="sidebar-btn logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div className="admin-content">

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "menu" && <MenuTab />}
        {activeTab === "tables" && <TablesTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "layout" && <LayoutTab navigate={navigate} />}

      </div>
    </div>
  );
}

// ============================================================
// ✅ DASHBOARD TAB
// ============================================================

function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/analytics/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    socket.on("order:completed", () => {
      loadAnalytics();
    });

    return () => socket.off("order:completed");
  }, []);

  if (loading) return (
    <div className="tab-loading">Loading analytics...</div>
  );

  if (!data) return (
    <div className="tab-loading">No data available</div>
  );

  const avg = data.revenueToday.count > 0
    ? (data.revenueToday.total / data.revenueToday.count).toFixed(2)
    : "0.00";

  return (
    <div className="dashboard-tab">
      <div className="tab-header">
        <h2>Dashboard</h2>
        <small>{new Date().toDateString()}</small>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-info">
            <h4>Revenue Today</h4>
            <h2>₹ {data.revenueToday.total.toFixed(2)}</h2>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon">📦</div>
          <div className="kpi-info">
            <h4>Orders Today</h4>
            <h2>{data.revenueToday.count}</h2>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon">📈</div>
          <div className="kpi-info">
            <h4>Avg Order Value</h4>
            <h2>₹ {avg}</h2>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon">🏆</div>
          <div className="kpi-info">
            <h4>Total Revenue</h4>
            <h2>₹ {data.totalRevenue?.total?.toFixed(2) || "0.00"}</h2>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="charts-grid">

        {/* Revenue Chart */}
        <div className="chart-card glass-card">
          <h3>Last 7 Days Revenue</h3>
          {data.revenueChart.length === 0 ? (
            <div className="chart-empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.revenueChart}>
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`₹ ${val}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#d4af37"
                  strokeWidth={3}
                  dot={{ fill: "#d4af37", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Items Chart */}
        <div className="chart-card glass-card">
          <h3>Top Selling Items</h3>
          {data.topItems.length === 0 ? (
            <div className="chart-empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topItems}>
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [val, "Qty Sold"]}
                />
                <Bar
                  dataKey="quantity"
                  fill="#d4af37"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* PEAK HOURS */}
      {data.peakHours && data.peakHours.length > 0 && (
        <div className="chart-card glass-card">
          <h3>Peak Hours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.peakHours}>
              <XAxis
                dataKey="_id"
                tickFormatter={(h) => `${h}:00`}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(h) => `${h}:00`}
                formatter={(val) => [val, "Orders"]}
              />
              <Bar
                dataKey="orders"
                fill="#1a1a1a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ✅ MENU TAB
// ============================================================

function MenuTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Beverages",
    description: ""
  });

  const categories = [
    "Beverages",
    "Snacks",
    "Meals",
    "Desserts",
    "General"
  ];

  const loadItems = async () => {
    const res = await api.get("/menu/item");
    setItems(res.data);
  };

  useEffect(() => { loadItems(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      return alert("Name and price are required");
    }

    setLoading(true);
    try {
      if (editItem) {
        await api.put(`/menu/item/${editItem._id}`, form);
        setEditItem(null);
      } else {
        await api.post("/menu/item", form);
      }
      setForm({
        name: "",
        price: "",
        category: "Beverages",
        description: ""
      });
      loadItems();
    } catch (err) {
      alert("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || ""
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await api.delete(`/menu/item/${id}`);
    loadItems();
  };

  const handleToggle = async (id) => {
    await api.put(`/menu/item/${id}/toggle`);
    loadItems();
  };

  const handleCancel = () => {
    setEditItem(null);
    setForm({
      name: "",
      price: "",
      category: "Beverages",
      description: ""
    });
  };

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Menu Management</h2>
        <span>{items.length} items</span>
      </div>

      {/* FORM */}
      <div className="glass-card form-card">
        <h4>
          {editItem ? `✏️ Edit: ${editItem.name}` : "➕ Add New Item"}
        </h4>

        <div className="form-grid">
          <div className="form-field">
            <label>Item Name *</label>
            <input
              placeholder="e.g. Cappuccino"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>Price (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Description</label>
            <input
              placeholder="Optional description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="gold-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editItem ? "Update Item" : "Add Item"
            }
          </button>

          {editItem && (
            <button onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ITEMS BY CATEGORY */}
      {categories.map(cat => (
        grouped[cat].length > 0 && (
          <div key={cat} className="category-section">
            <h3 className="category-title">{cat}</h3>
            <div className="menu-items-grid">
              {grouped[cat].map(item => (
                <div
                  key={item._id}
                  className={`menu-item-card glass-card ${!item.isAvailable ? "unavailable" : ""}`}
                >
                  <div className="menu-item-info">
                    <strong>{item.name}</strong>
                    <span className="item-price">₹ {item.price}</span>
                    {item.description && (
                      <small>{item.description}</small>
                    )}
                  </div>

                  <div className="menu-item-actions">
                    <span
                      className={`avail-badge ${item.isAvailable ? "avail" : "unavail"}`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <button onClick={() => handleToggle(item._id)}>
                      {item.isAvailable ? "Disable" : "Enable"}
                    </button>

                    <button onClick={() => handleEdit(item)}>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{ color: "#e53935" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// ============================================================
// ✅ TABLES TAB
// ============================================================

function TablesTab() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({
    tableNumber: "",
    capacity: ""
  });

  const loadTables = async () => {
    const res = await api.get("/tables");
    setTables(res.data);
  };

  useEffect(() => {
    loadTables();

    socket.on("table:update", () => loadTables());
    return () => socket.off("table:update");
  }, []);

  const handleAdd = async () => {
    if (!form.tableNumber || !form.capacity) {
      return alert("Fill all fields");
    }

    try {
      await api.post("/tables", {
        tableNumber: parseInt(form.tableNumber),
        capacity: parseInt(form.capacity)
      });
      setForm({ tableNumber: "", capacity: "" });
      loadTables();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add table");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this table?")) return;
    try {
      await api.delete(`/tables/${id}`);
      loadTables();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete");
    }
  };

  const handleRelease = async (id) => {
    if (!window.confirm("Release this table?")) return;
    await api.put(`/tables/${id}/release`);
    loadTables();
  };

  const getStatusStyle = (status) => {
    if (status === "available") return { color: "#4caf50" };
    if (status === "occupied") return { color: "#d4af37" };
    if (status === "bill_requested") return { color: "#e53935" };
    return {};
  };

  const available = tables.filter(t => t.status === "available").length;
  const occupied = tables.filter(t => t.status === "occupied").length;
  const billReq = tables.filter(t => t.status === "bill_requested").length;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Table Management</h2>
      </div>

      {/* STATUS SUMMARY */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🟢</div>
          <div className="kpi-info">
            <h4>Available</h4>
            <h2>{available}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🟡</div>
          <div className="kpi-info">
            <h4>Occupied</h4>
            <h2>{occupied}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🔴</div>
          <div className="kpi-info">
            <h4>Bill Requested</h4>
            <h2>{billReq}</h2>
          </div>
        </div>
      </div>

      {/* ADD TABLE FORM */}
      <div className="glass-card form-card">
        <h4>➕ Add New Table</h4>
        <div className="form-grid">
          <div className="form-field">
            <label>Table Number</label>
            <input
              type="number"
              placeholder="e.g. 11"
              value={form.tableNumber}
              onChange={e => setForm({ ...form, tableNumber: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Capacity (seats)</label>
            <input
              type="number"
              placeholder="e.g. 4"
              value={form.capacity}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
            />
          </div>
        </div>
        <button className="gold-btn" onClick={handleAdd}>
          Add Table
        </button>
      </div>

      {/* TABLE LIST */}
      <div className="table-list-grid">
        {tables.map(table => (
          <div
            key={table._id}
            className="table-list-card glass-card"
          >
            <div className="table-list-number">
              T{table.tableNumber}
            </div>

            <div className="table-list-info">
              <span>{table.capacity} seats</span>
              <span
                style={getStatusStyle(table.status)}
                className="table-status-text"
              >
                {table.status.replace("_", " ")}
              </span>
            </div>

            <div className="table-list-actions">
              {table.status !== "available" && (
                <button onClick={() => handleRelease(table._id)}>
                  Release
                </button>
              )}
              <button
                onClick={() => handleDelete(table._id)}
                style={{ color: "#e53935" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ✅ ORDERS TAB
// ======================================================
function OrdersTab() {

  // ============================================================
  // STATES
  // ============================================================

  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("active");
  const [loading, setLoading] = useState(false);

  // BILL STATES

  const [selectedBill, setSelectedBill] =
    useState(null);

  const [showBill, setShowBill] =
    useState(false);

  // ============================================================
  // GENERATE BILL
  // ============================================================

  const handleGenerateBill = (order) => {

    setSelectedBill(order);

    setShowBill(true);
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = () => {

    if (orders.length === 0) {
      return alert("No orders to export");
    }

    const headers = [
      "Table",
      "Items",
      "Total",
      "Status",
      "Date",
    ];

    const rows = orders.map(order => [

      `Table ${order.table?.tableNumber ?? "-"}`,

      order.items
        .map(
          item =>
            `${item.quantity}x${item.name}`
        )
        .join(", "),

      `₹${order.totalAmount?.toFixed(2)}`,

      order.status,

      new Date(
        order.createdAt
      ).toLocaleString(),
    ]);

    const csvContent = [

      headers.join(","),

      ...rows.map(row =>
        row
          .map(cell => `"${cell}"`)
          .join(",")
      ),

    ].join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `orders_${new Date().toLocaleDateString()}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // LOAD ORDERS
  // ============================================================

  const loadOrders = async () => {

    setLoading(true);

    try {

      const res = await api.get(
        view === "active"
          ? "/orders/active"
          : "/orders/completed"
      );

      setOrders(res.data);

    } catch {

      setOrders([]);

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // SOCKET EVENTS
  // ============================================================

  useEffect(() => {

    loadOrders();

    socket.on(
      "order:new",
      loadOrders
    );

    socket.on(
      "order:completed",
      loadOrders
    );

    return () => {

      socket.off("order:new");

      socket.off("order:completed");
    };

  }, [view]);

  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="admin-tab">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="tab-header">

        <h2>Order Management</h2>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          {/* ACTIVE */}

          <button
            className={
              view === "active"
                ? "gold-btn"
                : "outline-btn"
            }
            onClick={() =>
              setView("active")
            }
          >
            Active
          </button>

          {/* COMPLETED */}

          <button
            className={
              view === "completed"
                ? "gold-btn"
                : "outline-btn"
            }
            onClick={() =>
              setView("completed")
            }
          >
            Completed
          </button>

          {/* EXPORT */}

          <button
            onClick={exportCSV}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border:
                "1px solid var(--border-soft)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            📥 Export CSV
          </button>

        </div>

      </div>

      {/* ==================================================== */}
      {/* LOADING */}
      {/* ==================================================== */}

      {loading ? (

        <div className="tab-loading">
          Loading orders...
        </div>

      ) : orders.length === 0 ? (

        <div className="tab-empty">
          No {view} orders
        </div>

      ) : (

        <div className="orders-list">

          {orders.map(order => (

            <div
              key={order._id}
              className="order-card glass-card"
            >

              {/* ========================================== */}
              {/* HEADER */}
              {/* ========================================== */}

              <div className="order-card-header">

                <strong>
                  Table{" "}
                  {order.table?.tableNumber ?? "—"}
                </strong>

                <span
                  className={`order-status-badge ${order.status}`}
                >
                  {order.status}
                </span>

                <span
                  style={{
                    fontSize: 12,
                    opacity: 0.6,
                  }}
                >
                  {new Date(
                    order.createdAt
                  ).toLocaleString()}
                </span>

              </div>

              {/* ========================================== */}
              {/* ITEMS */}
              {/* ========================================== */}

              <div className="order-items-list">

                {order.items.map(
                  (item, i) => (

                    <div
                      key={i}
                      className="order-item-row"
                    >

                      <span>
                        {item.quantity} ×{" "}
                        {item.name}
                      </span>

                      <span>
                        ₹{" "}
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </span>

                    </div>
                  )
                )}

              </div>

              {/* ========================================== */}
              {/* FOOTER */}
              {/* ========================================== */}

              <div className="order-card-footer">

                <strong>
                  Total: ₹{" "}
                  {order.totalAmount?.toFixed(2)}
                </strong>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >

                  {/* BILL BUTTON */}

                  <button
                    className="gold-btn"
                    onClick={() =>
                      handleGenerateBill(order)
                    }
                    style={{
                      fontSize: 12,
                      padding: "6px 12px",
                    }}
                  >
                    🧾 Bill
                  </button>

                  {/* COMPLETED DATE */}

                  {order.completedAt && (

                    <small>

                      Completed:{" "}

                      {new Date(
                        order.completedAt
                      ).toLocaleString()}

                    </small>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ==================================================== */}
      {/* BILL MODAL */}
      {/* ==================================================== */}

      {showBill && selectedBill && (

        <div className="settlement-overlay">

          <div className="settlement-modal glass-card">

            {/* ========================================== */}
            {/* HEADER */}
            {/* ========================================== */}

            <div className="settlement-header">

              <h2>
                🧾 Bill — Table{" "}
                {selectedBill.table?.tableNumber}
              </h2>

              <button
                className="settlement-close"
                onClick={() =>
                  setShowBill(false)
                }
              >
                ✕
              </button>

            </div>

            {/* ========================================== */}
            {/* INFO */}
            {/* ========================================== */}

            <div className="settlement-info">

              <span>
                {new Date(
                  selectedBill.createdAt
                ).toLocaleString()}
              </span>

              <span
                style={{
                  textTransform:
                    "capitalize",
                }}
              >
                {selectedBill.status}
              </span>

            </div>

            {/* ========================================== */}
            {/* ITEMS */}
            {/* ========================================== */}

            <div className="settlement-items">

              {selectedBill.items.map(
                (item, i) => (

                  <div
                    key={i}
                    className="bill-row"
                  >

                    <span className="bill-item-name">
                      {item.quantity} ×{" "}
                      {item.name}
                    </span>

                    <span className="bill-item-price">
                      ₹{" "}
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(2)}
                    </span>

                  </div>
                )
              )}

            </div>

            {/* ========================================== */}
            {/* DIVIDER */}
            {/* ========================================== */}

            <div className="bill-divider" />

            {/* ========================================== */}
            {/* TOTAL */}
            {/* ========================================== */}

            <div className="bill-total">

              <strong>Total</strong>

              <strong
                style={{
                  color:
                    "var(--primary-gold)",
                }}
              >
                ₹{" "}
                {selectedBill.totalAmount?.toFixed(2)}
              </strong>

            </div>

            {/* ========================================== */}
            {/* ACTIONS */}
            {/* ========================================== */}

            <div className="settlement-actions">

              <button
                className="gold-btn"
                onClick={() =>
                  window.print()
                }
                style={{ flex: 1 }}
              >
                🖨 Print Receipt
              </button>

              <button
                onClick={() =>
                  setShowBill(false)
                }
                style={{ flex: 1 }}
              >
                Close
              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* PRINT RECEIPT */}
          {/* ================================================= */}

          <div className="receipt-print">

            <div className="receipt-container">

              {/* HEADER */}

              <div
                style={{
                  textAlign: "center",
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 4px 0",
                  }}
                >
                  GARDEN & CAFE
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                  }}
                >
                  Thank you for visiting 🌿
                </p>

              </div>

              <hr />

              {/* INFO */}

              <p
                style={{
                  margin: "4px 0",
                }}
              >
                Table:{" "}
                {selectedBill.table?.tableNumber}
              </p>

              <p
                style={{
                  margin: "4px 0",
                }}
              >
                Date:{" "}
                {new Date(
                  selectedBill.createdAt
                ).toLocaleString()}
              </p>

              <p
                style={{
                  margin: "4px 0",
                  textTransform:
                    "capitalize",
                }}
              >
                Status:{" "}
                {selectedBill.status}
              </p>

              <hr />

              {/* ITEMS */}

              {selectedBill.items.map(
                (item, i) => (

                  <div
                    key={i}
                    className="receipt-row"
                  >

                    <span>
                      {item.quantity} ×{" "}
                      {item.name}
                    </span>

                    <span>
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(2)}
                    </span>

                  </div>
                )
              )}

              <hr />

              {/* TOTAL */}

              <div className="receipt-total">

                <strong>
                  TOTAL
                </strong>

                <strong>
                  ₹
                  {selectedBill.totalAmount?.toFixed(2)}
                </strong>

              </div>

              <hr />

              {/* FOOTER */}

              <p
                style={{
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Visit Again 🌿
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
// ============================================================
// ✅ LAYOUT TAB
// ============================================================

function LayoutTab({ navigate }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    api.get("/tables").then(res => setTables(res.data));
  }, []);

  const available = tables.filter(t => t.status === "available").length;
  const occupied = tables.filter(t => t.status === "occupied").length;
  const billReq = tables.filter(t => t.status === "bill_requested").length;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Floor Plan</h2>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🟢</div>
          <div className="kpi-info">
            <h4>Available</h4>
            <h2>{available}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🟡</div>
          <div className="kpi-info">
            <h4>Occupied</h4>
            <h2>{occupied}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🔴</div>
          <div className="kpi-info">
            <h4>Bill Requested</h4>
            <h2>{billReq}</h2>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3>Floor Plan Designer</h3>
        <p style={{ opacity: 0.6, marginBottom: 16 }}>
          Visually arrange your cafe tables, set positions,
          and manage the floor layout.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="gold-btn"
            onClick={() => navigate("/admin/layout")}
          >
            🗺 Open Designer
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3>Live Table Status</h3>
        <div className="table-list-grid" style={{ marginTop: 12 }}>
          {tables.map(table => (
            <div
              key={table._id}
              className="table-list-card glass-card"
              style={{
                borderLeft: `4px solid ${
                  table.status === "available"
                    ? "#4caf50"
                    : table.status === "occupied"
                      ? "#d4af37"
                      : "#e53935"
                }`
              }}
            >
              <div className="table-list-number">
                T{table.tableNumber}
              </div>
              <div className="table-list-info">
                <span>{table.capacity} seats</span>
                <span style={{
                  color:
                    table.status === "available"
                      ? "#4caf50"
                      : table.status === "occupied"
                        ? "#d4af37"
                        : "#e53935",
                  fontWeight: 600,
                  fontSize: 12
                }}>
                  {table.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}