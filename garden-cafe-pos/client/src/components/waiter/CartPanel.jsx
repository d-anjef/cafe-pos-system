import api from "../../services/api";

const CartPanel = ({
  cart,
  setCart,
  selectedTable,
  onViewBill,
  showToast
}) => {

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity, 0
  );

  const isBillRequested = selectedTable?.status === "bill_requested";
  const isOccupied = selectedTable?.status === "occupied";
  const isAvailable = selectedTable?.status === "available";

  const updateQty = (id, qty) => {
    if (qty === 0) {
      setCart(cart.filter(i => i._id !== id));
    } else {
      setCart(cart.map(i =>
        i._id === id ? { ...i, quantity: qty } : i
      ));
    }
  };

  const handleSendToKitchen = async () => {
    if (!selectedTable) {
      showToast("Please select a table", "error");
      return;
    }
    if (isBillRequested) {
      showToast("Bill already requested", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }

    try {
      await api.post("/orders", {
        tableId: selectedTable._id,
        items: cart.map(item => ({
          itemId: item._id,
          quantity: item.quantity
        }))
      });
      setCart([]);
      showToast("Order sent to kitchen!", "success");
    } catch (error) {
      showToast("Failed to send order", "error");
    }
  };

  const handleRequestBill = async () => {
    if (!selectedTable) {
      showToast("Select a table first", "error");
      return;
    }
    if (cart.length > 0) {
      showToast("Send items to kitchen first", "error");
      return;
    }
    if (!isOccupied) {
      showToast("Table must be occupied", "error");
      return;
    }

    try {
      await api.put("/orders/request-bill", {
        tableId: selectedTable._id
      });
      showToast("Bill requested!", "success");
    } catch (err) {
      showToast("Failed to request bill", "error");
    }
  };

  return (
    <div className="cart-panel glass-card">

      {/* HEADER */}
      <div className="cart-header">
        <h3>
          {selectedTable
            ? `Table ${selectedTable.tableNumber}`
            : "No Table"
          }
        </h3>
        {selectedTable && (
          <span className={`table-status-pill ${selectedTable.status}`}>
            {selectedTable.status.replace("_", " ")}
          </span>
        )}
      </div>

      {/* BILL REQUESTED WARNING */}
      {isBillRequested && (
        <div className="bill-requested-badge">
          ⚠️ Bill Requested — Ordering Locked
        </div>
      )}

      {/* CART ITEMS */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="cart-empty">
            {isBillRequested
              ? "Ordering is locked"
              : "No items added"
            }
          </p>
        ) : (
          cart.map(item => (
            <div key={item._id} className="cart-row">
              <span className="cart-item-name">{item.name}</span>
              <div className="cart-qty-control">
                <button
                  onClick={() => updateQty(item._id, item.quantity - 1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQty(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <span className="cart-item-price">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* TOTAL */}
      {cart.length > 0 && (
        <div className="cart-total">
          <span>Total</span>
          <span>₹ {total.toFixed(2)}</span>
        </div>
      )}

      {/* ACTIONS */}
      <div className="cart-actions">
        <button
          className="gold-btn"
          onClick={handleSendToKitchen}
          disabled={
            cart.length === 0 ||
            !selectedTable ||
            isBillRequested
          }
        >
          🍳 Send to Kitchen
        </button>

        <button
          className="request-bill-btn"
          onClick={handleRequestBill}
          disabled={
            !selectedTable ||
            isBillRequested ||
            !isOccupied ||
            cart.length > 0
          }
        >
          {isBillRequested ? "✓ Bill Requested" : "🧾 Request Bill"}
        </button>

        {(isOccupied || isBillRequested) && (
          <button
            className="view-bill-btn"
            onClick={onViewBill}
          >
            👁 View Bill
          </button>
        )}
      </div>

    </div>
  );
};

export default CartPanel;