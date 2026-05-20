import { useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import "../styles/smartCart.css";

const SmartCart = ({ selectedTable, onClose }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const addItem = (item) => {
    const existing = cart.find(i => i._id === item._id);

    if (existing) {
      setCart(cart.map(i =>
        i._id === item._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    setCart(cart.map(i =>
      i._id === id ? { ...i, quantity: qty } : i
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter(i => i._id !== id));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const sendToKitchen = async () => {
    setLoading(true);

    const formattedItems = cart.map(i => ({
      itemId: i._id,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }));

    await api.post("/orders", {
      tableId: selectedTable._id,
      items: formattedItems
    });

    socket.emit("order:new");

    setCart([]);
    setLoading(false);
    onClose();
  };

  return (
    <div className="smart-cart-panel glass-card">
      <h3>Table {selectedTable.tableNumber}</h3>

      {cart.map(item => (
        <div key={item._id} className="cart-item">
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQty(item._id, parseInt(e.target.value))}
          />
          <span>₹ {item.price * item.quantity}</span>
          <button onClick={() => removeItem(item._id)}>X</button>
        </div>
      ))}

      <h4>Total: ₹ {total.toFixed(2)}</h4>

      <button
        className="gold-btn"
        disabled={loading || cart.length === 0}
        onClick={sendToKitchen}
      >
        Send to Kitchen
      </button>

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SmartCart;