import '../styles/receipt.css';
const ReceiptPrint = ({ order }) => {

  if (!order) return null;

  const total = order.items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <div className="receipt-print">

      <div className="receipt-container">

        {/* HEADER */}

        <h2 className="receipt-title">
          GARDEN & CAFE
        </h2>

        <p className="receipt-subtitle">
          Thank You For Visiting 🌿
        </p>

        <div className="receipt-divider" />

        {/* INFO */}

        <div className="receipt-info">
          <p>
            <strong>Table:</strong>{" "}
            {order.table?.tableNumber || "-"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              order.createdAt
            ).toLocaleString()}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {order.status}
          </p>
        </div>

        <div className="receipt-divider" />

        {/* ITEMS */}

        <div className="receipt-items">

          {order.items.map((item, index) => (

            <div
              key={index}
              className="receipt-row"
            >

              <span>
                {item.quantity} × {item.name}
              </span>

              <span>
                ₹{" "}
                {(
                  item.price * item.quantity
                ).toFixed(2)}
              </span>

            </div>
          ))}

        </div>

        <div className="receipt-divider" />

        {/* TOTAL */}

        <div className="receipt-total">

          <strong>Total</strong>

          <strong>
            ₹ {total.toFixed(2)}
          </strong>

        </div>

        <div className="receipt-divider" />

        {/* FOOTER */}

        <p className="receipt-footer">
          Visit Again 🌿
        </p>

      </div>
    </div>
  );
};


export default ReceiptPrint;
