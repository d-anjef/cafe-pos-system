import { useEffect, useState } from "react";
import api from "../../services/api";
import socket from "../../services/socket";
import DesignerCanvas from "../../components/layoutDesigner/DesignerCanvas";
import Toolbar from "../../components/layoutDesigner/Toolbar";
import PropertyPanel from "../../components/layoutDesigner/PropertyPanel";
import "../../styles/designer.css";

export default function AdminLayoutDesigner() {
  const [layout, setLayout] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const loadData = async () => {
    const [layoutRes, tablesRes] = await Promise.all([
      api.get("/layout"),
      api.get("/tables")
    ]);
    setLayout(layoutRes.data);
    setTables(tablesRes.data);
  };

  useEffect(() => {
    loadData();

    socket.on("table:update", (updated) => {
      setTables(prev =>
        prev.map(t => t._id === updated._id ? updated : t)
      );
    });

    return () => socket.off("table:update");
  }, []);

  const handleSave = async () => {
    try {
      await api.post("/layout", layout);
      alert("Layout saved!");
    } catch {
      alert("Failed to save layout");
    }
  };

  const addTableToCanvas = (table) => {
    const alreadyAdded = layout.tables.some(
      t => t.tableId === table._id
    );

    if (alreadyAdded) {
      return alert(`Table ${table.tableNumber} already on canvas`);
    }

    const newInstance = {
      tableId: table._id,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 110,
      height: 80,
      rotation: 0
    };

    setLayout(prev => ({
      ...prev,
      tables: [...prev.tables, newInstance]
    }));
  };

  if (!layout) return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--primary-gold)",
      fontSize: 18
    }}>
      Loading Floor Plan...
    </div>
  );

  const tablesOnCanvas = layout.tables.map(t => t.tableId);
  const tablesNotOnCanvas = tables.filter(
    t => !tablesOnCanvas.includes(t._id)
  );

  return (
    <div className="designer-shell">

      <Toolbar
        layout={layout}
        setLayout={setLayout}
        onSave={handleSave}
        isAdminMode={true}
      />

      <div className="designer-body">

        {/* LEFT SIDEBAR — Table Palette */}
        <div className="designer-sidebar">
          <h4>Add Tables</h4>

          {tablesNotOnCanvas.length === 0 ? (
            <p style={{ fontSize: 12, opacity: 0.5 }}>
              All tables on canvas
            </p>
          ) : (
            tablesNotOnCanvas.map(table => (
              <button
                key={table._id}
                className="palette-item"
                onClick={() => addTableToCanvas(table)}
              >
                + Table {table.tableNumber}
                <span style={{
                  display: "block",
                  fontSize: 11,
                  opacity: 0.6
                }}>
                  {table.capacity} seats
                </span>
              </button>
            ))
          )}

          <h4 style={{ marginTop: 12 }}>All Tables</h4>
          {tables.map(table => (
            <div
              key={table._id}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.03)",
                fontSize: 13
              }}
            >
              <div style={{ fontWeight: 600 }}>
                Table {table.tableNumber}
              </div>
              <div style={{
                fontSize: 11,
                color:
                  table.status === "available" ? "#4caf50" :
                  table.status === "occupied" ? "#d4af37" :
                  "#e53935"
              }}>
                {table.status}
              </div>
            </div>
          ))}
        </div>

        {/* CANVAS */}
        <DesignerCanvas
          layout={layout}
          setLayout={setLayout}
          tables={tables}
          selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx}
          isAdminMode={true}
          onTableClick={null}
        />

        {/* RIGHT SIDEBAR — Properties */}
        <PropertyPanel
          layout={layout}
          setLayout={setLayout}
          selectedIdx={selectedIdx}
          tables={tables}
        />

      </div>
    </div>
  );
}