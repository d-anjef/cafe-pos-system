import { useState } from "react";
import api from "../services/api";
import "../styles/settlement.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SettlementModal({
  order,
  onClose,
  onComplete
}) {

  // ============================================================
  // STATES
  // ============================================================

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [processing, setProcessing] =
    useState(false);

  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    order?.items?.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    ) || 0;

  // ============================================================
  // COMPLETE PAYMENT
  // ============================================================

  const handleComplete = async () => {

    setProcessing(true);

    try {

      await api.put(
        `/orders/${order._id}/complete`,
        { paymentMethod }
      );

      // ✅ PRINT RECEIPT
      window.print();

      // ✅ REFRESH ORDERS
      onComplete();

      // ✅ CLOSE MODAL
      onClose();

    } catch (err) {

      alert("Payment failed. Try again.");

    } finally {

      setProcessing(false);
    }
  };

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF = () => {

    const doc = new jsPDF({
      unit: "mm",
      format: [80, 200],
    });

    // HEADER

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "GARDEN & CAFE",
      40,
      12,
      { align: "center" }
    );

    doc.setFontSize(9);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Thank you for visiting!",
      40,
      18,
      { align: "center" }
    );

    doc.line(5, 22, 75, 22);

    // INFO

    doc.text(
      `Table: ${order?.table?.tableNumber}`,
      5,
      28
    );

    doc.text(
      `Date: ${new Date().toLocaleString()}`,
      5,
      34
    );

    doc.text(
      `Payment: ${paymentMethod.toUpperCase()}`,
      5,
      40
    );

    doc.line(5, 44, 75, 44);

    // ITEMS TABLE

    autoTable(doc, {
      startY: 48,

      head: [
        ["Item", "Qty", "Price"]
      ],

      body:
        order?.items?.map(item => [
          item.name,
          item.quantity,
          `Rs ${(
            item.price *
            item.quantity
          ).toFixed(2)}`
        ]) || [],

      styles: {
        fontSize: 8,
        cellPadding: 2,
      },

      headStyles: {
        fillColor: [212, 175, 55],
        textColor: 255,
      },

      margin: {
        left: 5,
        right: 5,
      },
    });

    // TOTAL

    const finalY =
      doc.lastAutoTable.finalY + 6;

    doc.line(
      5,
      finalY,
      75,
      finalY
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      `TOTAL: Rs ${total.toFixed(2)}`,
      40,
      finalY + 8,
      { align: "center" }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      "Visit Again 🌿",
      40,
      finalY + 16,
      { align: "center" }
    );

    // SAVE

    doc.save(
      `receipt_table${order?.table?.tableNumber}.pdf`
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <>

      {/* ====================================================== */}
      {/* MODAL */}
      {/* ====================================================== */}

      <div className="settlement-overlay">

        <div className="settlement-modal glass-card">

          {/* HEADER */}

          <div className="settlement-header">

            <h2>
              🧾 Bill Summary
            </h2>

            <button
              className="settlement-close"
              onClick={onClose}
            >
              ✕
            </button>

          </div>

          {/* INFO */}

          <div className="settlement-info">

            <span>
              Table{" "}
              {order?.table?.tableNumber}
            </span>

            <span>
              {new Date(
                order?.createdAt
              ).toLocaleString()}
            </span>

          </div>

          {/* ITEMS */}

          <div className="settlement-items">

            {order?.items?.map(
              (item, i) => (

                <div
                  key={i}
                  className="bill-row"
                >

                  <span className="bill-item-name">
                    {item.quantity} ×{" "}
                    {item.name}
                  </span>

                  <span className="bill-item-price">
                    ₹{" "}
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </span>

                </div>
              )
            )}

          </div>

          {/* TOTAL */}

          <div className="bill-divider" />

          <div className="bill-total">

            <strong>
              Total Amount
            </strong>

            <strong
              style={{
                color:
                  "var(--primary-gold)",
              }}
            >
              ₹ {total.toFixed(2)}
            </strong>

          </div>

          {/* PAYMENT */}

          <div className="payment-method-section">

            <label>
              Payment Method
            </label>

            <div className="payment-methods">

              {[
                {
                  key: "cash",
                  label: "💵 Cash",
                },
                {
                  key: "card",
                  label: "💳 Card",
                },
                {
                  key: "upi",
                  label: "📱 UPI",
                },
              ].map(method => (

                <button
                  key={method.key}
                  className={`payment-btn ${
                    paymentMethod ===
                    method.key
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod(
                      method.key
                    )
                  }
                >
                  {method.label}
                </button>

              ))}

            </div>
          </div>

          {/* ACTIONS */}

          <div className="settlement-actions">

            <button
              className="gold-btn"
              onClick={handleComplete}
              disabled={processing}
              style={{ flex: 2 }}
            >
              {processing
                ? "Processing..."
                : "✅ Complete Payment"}
            </button>

            <button
              onClick={downloadPDF}
              disabled={processing}
              style={{ flex: 1 }}
            >
              📄 PDF
            </button>

            <button
              onClick={onClose}
              disabled={processing}
              style={{ flex: 1 }}
            >
              Cancel
            </button>

          </div>

        </div>
      </div>

      {/* ====================================================== */}
      {/* PRINT RECEIPT */}
      {/* ====================================================== */}

      <div className="receipt-print">

        <div className="receipt-container">

          {/* HEADER */}

          <div
            style={{
              textAlign: "center",
            }}
          >

            <h3
              style={{
                margin:
                  "0 0 2px 0",
              }}
            >
              GARDEN & CAFE
            </h3>

            <p
              style={{
                margin:
                  "0 0 8px 0",
                fontSize: 11,
              }}
            >
              Thank you for visiting!
            </p>

          </div>

          <hr />

          {/* INFO */}

          <p
            style={{
              margin: "3px 0",
            }}
          >
            Table:{" "}
            {order?.table?.tableNumber}
          </p>

          <p
            style={{
              margin: "3px 0",
            }}
          >
            Date:{" "}
            {new Date().toLocaleString()}
          </p>

          <p
            style={{
              margin: "3px 0",
              textTransform:
                "capitalize",
            }}
          >
            Payment:{" "}
            {paymentMethod}
          </p>

          <hr />

          {/* ITEMS */}

          {order?.items?.map(
            (item, i) => (

              <div
                key={i}
                className="receipt-row"
              >

                <span>
                  {item.quantity} ×{" "}
                  {item.name}
                </span>

                <span>
                  ₹
                  {(
                    item.price *
                    item.quantity
                  ).toFixed(2)}
                </span>

              </div>
            )
          )}

          <hr />

          {/* TOTAL */}

          <div className="receipt-total">

            <strong>
              TOTAL
            </strong>

            <strong>
              ₹{total.toFixed(2)}
            </strong>

          </div>

          <hr />

          {/* FOOTER */}

          <p
            style={{
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Visit Again 🌿
          </p>

        </div>
      </div>

    </>
  );
}