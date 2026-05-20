const PropertyPanel = ({
  layout,
  setLayout,
  selectedIdx,
  tables
}) => {
  if (selectedIdx === null || selectedIdx === undefined) {
    return (
      <div className="property-panel">
        <h4>Properties</h4>
        <p style={{ fontSize: 13, opacity: 0.5 }}>
          Click a table to edit
        </p>
      </div>
    );
  }

  const instance = layout.tables[selectedIdx];
  const meta = tables.find(t => t._id === instance?.tableId);

  const update = (patch) => {
    setLayout(prev => {
      const updated = [...prev.tables];
      updated[selectedIdx] = { ...updated[selectedIdx], ...patch };
      return { ...prev, tables: updated };
    });
  };

  return (
    <div className="property-panel">
      <h4>Properties</h4>

      <div style={{
        padding: "10px",
        background: "rgba(212,175,55,0.08)",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600
      }}>
        Table {meta?.tableNumber} — {meta?.capacity} seats
      </div>

      <div className="prop-field">
        <label>X Position</label>
        <input
          type="number"
          value={instance?.x || 0}
          onChange={e => update({ x: parseInt(e.target.value) })}
        />
      </div>

      <div className="prop-field">
        <label>Y Position</label>
        <input
          type="number"
          value={instance?.y || 0}
          onChange={e => update({ y: parseInt(e.target.value) })}
        />
      </div>

      <div className="prop-field">
        <label>Width</label>
        <input
          type="number"
          value={instance?.width || 110}
          onChange={e => update({ width: parseInt(e.target.value) })}
        />
      </div>

      <div className="prop-field">
        <label>Height</label>
        <input
          type="number"
          value={instance?.height || 80}
          onChange={e => update({ height: parseInt(e.target.value) })}
        />
      </div>

      <div className="prop-field">
        <label>Rotation</label>
        <input
          type="range"
          min="0"
          max="360"
          value={instance?.rotation || 0}
          onChange={e => update({ rotation: parseInt(e.target.value) })}
        />
        <span style={{ fontSize: 12 }}>{instance?.rotation || 0}°</span>
      </div>
    </div>
  );
};

export default PropertyPanel;