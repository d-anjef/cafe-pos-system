import { useRef, useState, useEffect, useCallback } from "react";
import TableNode from "./TableNode";

const DesignerCanvas = ({
  layout,
  setLayout,
  tables,
  selectedIdx,
  setSelectedIdx,
  isAdminMode,
  onTableClick
}) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  // ✅ Zoom handler
  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom(prev => Math.max(0.4, Math.min(2, prev + delta)));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ✅ Mouse move
  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;

    const { type, idx, startX, startY, origX, origY } = dragRef.current;

    if (type === "table" && isAdminMode) {
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      const grid = layout.gridSize || 20;
      const newX = Math.round((origX + dx) / grid) * grid;
      const newY = Math.round((origY + dy) / grid) * grid;

      setLayout(prev => {
        const updated = [...prev.tables];
        updated[idx] = { ...updated[idx], x: newX, y: newY };
        return { ...prev, tables: updated };
      });
    }

    if (type === "pan") {
      setPan({
        x: origX + (e.clientX - startX),
        y: origY + (e.clientY - startY)
      });
    }
  }, [zoom, isAdminMode, layout?.gridSize, setLayout]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ✅ Start canvas pan
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedIdx(null);
      dragRef.current = {
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
        origX: pan.x,
        origY: pan.y
      };
    }
  };

  // ✅ Start table drag
  const handleTableMouseDown = (e, idx) => {
    if (!isAdminMode) return;
    e.stopPropagation();

    const instance = layout.tables[idx];
    dragRef.current = {
      type: "table",
      idx,
      startX: e.clientX,
      startY: e.clientY,
      origX: instance.x,
      origY: instance.y
    };
  };

  return (
    <div
      className="designer-canvas-wrapper"
      onMouseDown={handleCanvasMouseDown}
    >
      <div
        ref={canvasRef}
        className="designer-canvas"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0"
        }}
      >
        {layout?.tables?.map((instance, idx) => {
          const tableMeta = tables.find(
            t => t._id === instance.tableId
          );

          return (
            <TableNode
              key={idx}
              instance={instance}
              idx={idx}
              tableMeta={tableMeta}
              isSelected={selectedIdx === idx}
              isAdminMode={isAdminMode}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(idx);
                if (!isAdminMode && onTableClick) {
                  onTableClick(tableMeta);
                }
              }}
              onMouseDown={(e) => handleTableMouseDown(e, idx)}
              onDelete={() => {
                setLayout(prev => ({
                  ...prev,
                  tables: prev.tables.filter((_, i) => i !== idx)
                }));
                setSelectedIdx(null);
              }}
            />
          );
        })}
      </div>

      {/* ZOOM CONTROLS */}
      <div style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: 8
      }}>
        <button
          className="gold-btn"
          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
        >+</button>
        <button
          className="gold-btn"
          onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
        >−</button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-soft)"
          }}
        >Reset</button>
      </div>
    </div>
  );
};

export default DesignerCanvas;