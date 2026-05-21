import api from "../../services/api";

const CartPanel = ({
  cart,
  setCart,
  selectedTable,
  onViewBill,
  showToast
}) => {

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const isBillRequested = selectedTable?.status === "bill_requested";
  const isOccupied      = selectedTable?.status === "occupied";

  // ✅ Use cartId (unique per variant combo) instead of _id
  const updateQty = (cartId, qty) => {
    if (qty === 0) {
      setCart(cart.filter(i => i.cartId !== cartId));
    } else {
      setCart(cart.map(i =>
        i.cartId === cartId ? { ...i, quantity: qty } : i
      ));
    }
  };

  const handleSendToKitchen = async () => {
    if (!selectedTable) return showToast("Please select a table", "error");
    if (isBillRequested) return showToast("Bill already requested", "error");
    if (cart.length === 0) return showToast("Cart is empty", "error");

    try {
      // ✅ Send variant info to backend
      await api.post("/orders", {
        tableId: selectedTable._id,
        items: cart.map(item => ({
          itemId: item.menuItemId || item._id,
          quantity: item.quantity,
          displayName: item.displayName || item.name,
          price: item.price,
          variants: item.variants || null
        }))
      });
      setCart([]);
      showToast("Order sent to kitchen!", "success");
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to send order", "error");
    }
  };

  const handleRequestBill = async () => {
    if (!selectedTable) return showToast("Select a table first", "error");
    if (cart.length > 0) return showToast("Send items to kitchen first", "error");
    if (!isOccupied) return showToast("Table must be occupied", "error");

    try {
      await api.put("/orders/request-bill", { tableId: selectedTable._id });
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
          {selectedTable ? `Table ${selectedTable.tableNumber}` : "No Table"}
        </h3>
        {selectedTable && (
          <span className={`table-status-pill ${selectedTable.status}`}>
            {selectedTable.status.replace("_", " ")}
          </span>
        )}
      </div>

      {isBillRequested && (
        <div className="bill-requested-badge">
          ⚠️ Bill Requested — Ordering Locked
        </div>
      )}

      {/* CART ITEMS */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="cart-empty">
            {isBillRequested ? "Ordering is locked" : "No items added"}
          </p>
        ) : (
          cart.map(item => (
            <div key={item.cartId} className="cart-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
              {/* Top row: name + price */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div className="cart-item-name" style={{ fontWeight: 600 }}>
                    {item.displayName || item.name}
                  </div>

                  {/* Variant breakdown */}
                  {item.variants && item.variants.length > 0 && (
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                      {item.variants.map((v, i) => (
                        <span key={i}>
                          {v.groupName}: {v.optionName}
                          {i < item.variants.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                    NPR {item.price} each
                  </div>
                </div>

                <span className="cart-item-price" style={{ fontWeight: 700 }}>
                  NPR {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Bottom row: quantity controls */}
              <div className="cart-qty-control" style={{ alignSelf: "flex-start" }}>
                <button onClick={() => updateQty(item.cartId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.cartId, item.quantity + 1)}>+</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOTAL */}
      {cart.length > 0 && (
        <div className="cart-total">
          <span>Total</span>
          <span>NPR {total.toFixed(2)}</span>
        </div>
      )}

      {/* ACTIONS */}
      <div className="cart-actions">
        <button
          className="gold-btn"
          onClick={handleSendToKitchen}
          disabled={cart.length === 0 || !selectedTable || isBillRequested}
        >
          🍳 Send to Kitchen
        </button>

        <button
          className="request-bill-btn"
          onClick={handleRequestBill}
          disabled={!selectedTable || isBillRequested || !isOccupied || cart.length > 0}
        >
          {isBillRequested ? "✓ Bill Requested" : "🧾 Request Bill"}
        </button>

        {(isOccupied || isBillRequested) && (
          <button className="view-bill-btn" onClick={onViewBill}>
            👁 View Bill
          </button>
        )}
      </div>

    </div>
  );
};

export default CartPanel;