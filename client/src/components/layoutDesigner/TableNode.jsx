const TableNode = ({
  instance,
  idx,
  tableMeta,
  isSelected,
  isAdminMode,
  onClick,
  onDelete,
  onMouseDown
}) => {

  const status = tableMeta?.status || "available";

  const getStatusLabel = (s) => {
    if (s === "available") return "Available";
    if (s === "occupied") return "Occupied";
    if (s === "bill_requested") return "Bill Requested";
    return s;
  };

  return (
    <div
      data-table-idx={idx}
      className={`table-node ${status} ${isSelected ? "selected" : ""}`}
      style={{
        left: instance.x,
        top: instance.y,
        width: instance.width || 110,
        height: instance.height || 80,
        transform: `rotate(${instance.rotation || 0}deg)`
      }}
      onClick={onClick}
      onMouseDown={isAdminMode ? onMouseDown : undefined}
    >
      <div className="table-node-number">
        {tableMeta?.tableNumber ?? "?"}
      </div>
      <div className="table-node-capacity">
        {tableMeta?.capacity ?? "-"} seats
      </div>
      <div className={`table-node-status status-${status}`}>
        {getStatusLabel(status)}
      </div>

      {isAdminMode && isSelected && (
        <button
          className="table-node-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default TableNode;