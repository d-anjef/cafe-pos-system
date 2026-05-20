        import { useEffect, useState } from "react";
import api from "../services/api";

const TicketCard = ({ order }) => {

  const getElapsedTime = () => {
    const created = new Date(order.createdAt);
    const now = new Date();
    const diff = Math.floor((now - created) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const [time, setTime] = useState(getElapsedTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getElapsedTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (index, status) => {
    await api.put("/orders/item-status", {
      orderId: order._id,
      itemIndex: index,
      status
    });
  };

  return (
    <div className="kds-ticket glass-card">
      <div className="ticket-header">
        <h3>Table {order.table?.tableNumber}</h3>
        <span className="timer">{time}</span>
      </div>

      <div className="ticket-items">
        {order.items.map((item, index) => (
          <div
            key={index}
            className={`ticket-item ${item.status}`}
          >
            <span>{item.quantity} × {item.name}</span>

            <div className="status-buttons">
              {item.status === "pending" && (
                <button onClick={() => updateStatus(index, "in_progress")}>
                  Start
                </button>
              )}

              {item.status === "in_progress" && (
                <button onClick={() => updateStatus(index, "ready")}>
                  Ready
                </button>
              )}

              {item.status === "ready" && (
                <span className="ready-label">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketCard;