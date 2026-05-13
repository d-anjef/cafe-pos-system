import { useEffect, useState } from "react";
import api from "../../services/api";
import socket from "../../services/socket";

const TableStrip = ({ selectedTable, setSelectedTable }) => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    api.get("/tables").then(res => setTables(res.data));

    socket.on("table:update", (updated) => {
      setTables(prev =>
        prev.map(t => t._id === updated._id ? updated : t)
      );
    });

    return () => socket.off("table:update");
  }, []);

  const getColor = (status) => {
    if (status === "available") return "#4caf50";
    if (status === "occupied") return "#d4af37";
    if (status === "bill_requested") return "#e53935";
    return "#ccc";
  };

  return (
    <div className="table-strip">
      {tables.map(table => (
        <div
          key={table._id}
          className={`table-pill ${selectedTable?._id === table._id ? "selected" : ""}`}
          style={{ background: getColor(table.status) }}
          onClick={() => setSelectedTable(table)}
        >
          T{table.tableNumber}
        </div>
      ))}
    </div>
  );
};

export default TableStrip;