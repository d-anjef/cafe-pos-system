import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import SettlementModal from "../components/SettlementModal";
import "../styles/tables.css";

const WaiterTables = () => {
  const [tables, setTables] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  const fetchTables = async () => {
    const res = await api.get("/tables");
    setTables(res.data);
  };

  const openSettlement = async (table) => {
    const res = await api.get(`/orders/active-by-table/${table._id}`);
    setActiveOrder(res.data);
  };

  useEffect(() => {
    fetchTables();

    socket.on("table:update", (updatedTable) => {
      setTables(prev =>
        prev.map(table =>
          table._id === updatedTable._id ? updatedTable : table
        )
      );
    });

    return () => socket.off("table:update");
  }, []);

  return (
    <>
      <div className="table-grid-container">
        {tables.map(table => (
          <div
            key={table._id}
            className={`table-card ${table.status}`}
          >
            <h3>Table {table.tableNumber}</h3>
            <p>{table.capacity} Seats</p>
            <span className="status-badge">{table.status}</span>
            {table.status === 'occupied' && (
              <button onClick={() => openSettlement(table)} className="settle-btn">
                Settle Order
              </button>
            )}
          </div>
        ))}
      </div>

      {activeOrder && (
        <SettlementModal
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
        />
      )}
    </>
  );
};
export default WaiterTables;