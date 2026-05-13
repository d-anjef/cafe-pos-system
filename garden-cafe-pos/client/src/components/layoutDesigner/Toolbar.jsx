const Toolbar = ({
  layout,
  setLayout,
  onSave,
  isAdminMode
}) => {
  return (
    <div className="designer-topbar">
      <h3>🌿 Floor Plan</h3>

      {isAdminMode && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13 }}>Grid</label>
            <input
              type="range"
              min="10"
              max="40"
              value={layout?.gridSize || 20}
              onChange={e =>
                setLayout(prev => ({
                  ...prev,
                  gridSize: parseInt(e.target.value)
                }))
              }
              style={{ width: 80 }}
            />
          </div>

          <button
            className="gold-btn"
            onClick={onSave}
          >
            💾 Save Layout
          </button>
        </>
      )}

      {/* LEGEND */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#4caf50" }} />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#d4af37" }} />
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#e53935" }} />
          <span>Bill Requested</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;