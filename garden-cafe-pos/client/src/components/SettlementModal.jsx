import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/settlement.css";
import { showSuccess, showError } from "../utils/toast";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SettlementModal({ order, onClose, onComplete }) {
  const { user } = useAuth();

  const orgName        = user?.organization?.name || "NUVLYX";
  const orgPhone       = user?.organization?.contactInfo?.phone || "";
  const orgAddress     = user?.organization?.contactInfo?.address || "";
  const workingHours   = user?.organization?.contactInfo?.workingHours || "";

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing]       = useState(false);

  // ============================================================
  // Helper: get full display name with variants
  // ============================================================
  const getItemDisplay = (item) => item.displayName || item.name;

  const getVariantText = (item) => {
    if (!item.variants || item.variants.length === 0) return "";
    return item.variants
      .map(v => `${v.groupName}: ${v.optionName}`)
      .join(" · ");
  };

  // ============================================================
  // TOTAL
  // ============================================================
  const subtotal = order?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  ) || 0;

  const total = order?.totalAmount || subtotal;
  const serviceCharge = order?.serviceCharge || 0;
  const vat = order?.vat || 0;

  // ============================================================
  // COMPLETE PAYMENT
  // ============================================================
  const handleComplete = async () => {
    setProcessing(true);
    try {
      await api.put(`/orders/${order._id}/complete`, { paymentMethod });
      window.print();
      showSuccess(`Payment complete via ${paymentMethod.toUpperCase()}`);
      onComplete();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: [80, 250] });

    let y = 8;

    // HEADER
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(orgName.toUpperCase(), 40, y, { align: "center" });
    y += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    if (orgAddress) { doc.text(orgAddress, 40, y, { align: "center" }); y += 4; }
    if (orgPhone)   { doc.text(`Tel: ${orgPhone}`, 40, y, { align: "center" }); y += 4; }
    y += 2;

    doc.line(5, y, 75, y);
    y += 4;

    // INFO
    doc.setFontSize(8);
    doc.text(`Order: ${order?.orderNumber || "-"}`, 5, y); y += 4;
    doc.text(`Table: ${order?.table?.tableNumber}`, 5, y); y += 4;
    doc.text(`Date: ${new Date().toLocaleString()}`, 5, y); y += 4;
    doc.text(`Payment: ${paymentMethod.toUpperCase()}`, 5, y); y += 4;

    doc.line(5, y, 75, y);
    y += 2;

    // ITEMS
    const body = [];
    order?.items?.forEach(item => {
      const name = getItemDisplay(item);
      const variants = getVariantText(item);
      body.push([
        variants ? `${name}\n  ${variants}` : name,
        item.quantity,
        `Rs ${(item.price * item.quantity).toFixed(2)}`
      ]);
    });

    autoTable(doc, {
      startY: y,
      head: [["Item", "Qty", "Total"]],
      body,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [212, 175, 55], textColor: 255 },
      margin: { left: 5, right: 5 }
    });

    let finalY = doc.lastAutoTable.finalY + 4;
    doc.line(5, finalY, 75, finalY);
    finalY += 5;

    // TOTALS
    doc.setFontSize(8);
    doc.text(`Subtotal:`, 5, finalY);
    doc.text(`Rs ${subtotal.toFixed(2)}`, 75, finalY, { align: "right" });
    finalY += 4;

    if (serviceCharge > 0) {
      doc.text(`Service (10%):`, 5, finalY);
      doc.text(`Rs ${serviceCharge.toFixed(2)}`, 75, finalY, { align: "right" });
      finalY += 4;
    }

    if (vat > 0) {
      doc.text(`VAT (13%):`, 5, finalY);
      doc.text(`Rs ${vat.toFixed(2)}`, 75, finalY, { align: "right" });
      finalY += 4;
    }

    doc.line(5, finalY, 75, finalY);
    finalY += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`TOTAL`, 5, finalY);
    doc.text(`Rs ${total.toFixed(2)}`, 75, finalY, { align: "right" });
    finalY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Thank you for visiting!", 40, finalY, { align: "center" });
    finalY += 4;
    if (workingHours) {
      doc.text(workingHours, 40, finalY, { align: "center" });
    }

    doc.save(`receipt_${order?.orderNumber || "order"}.pdf`);
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <>
      <div className="settlement-overlay">
        <div className="settlement-modal glass-card">

          {/* HEADER */}
          <div className="settlement-header">
            <h2>🧾 Bill Summary</h2>
            <button className="settlement-close" onClick={onClose}>✕</button>
          </div>

          {/* INFO */}
          <div className="settlement-info">
            <span>Order #{order?.orderNumber}</span>
            <span>Table {order?.table?.tableNumber}</span>
            <span>{new Date(order?.createdAt).toLocaleString()}</span>
          </div>

          {/* ITEMS */}
          <div className="settlement-items">
            {order?.items?.map((item, i) => (
              <div key={i} className="bill-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="bill-item-name">
                    {item.quantity} × {getItemDisplay(item)}
                  </span>
                  <span className="bill-item-price">
                    NPR {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                {item.variants && item.variants.length > 0 && (
                  <div style={{ fontSize: 11, opacity: 0.6, paddingLeft: 12 }}>
                    {getVariantText(item)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* TOTALS */}
          <div className="bill-divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ opacity: 0.7 }}>Subtotal</span>
              <span>NPR {subtotal.toFixed(2)}</span>
            </div>
            {serviceCharge > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ opacity: 0.7 }}>Service Charge (10%)</span>
                <span>NPR {serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {vat > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ opacity: 0.7 }}>VAT (13%)</span>
                <span>NPR {vat.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="bill-divider" />

          <div className="bill-total">
            <strong>Total Amount</strong>
            <strong style={{ color: "var(--primary-gold)" }}>
              NPR {total.toFixed(2)}
            </strong>
          </div>

          {/* PAYMENT */}
          <div className="payment-method-section">
            <label>Payment Method</label>
            <div className="payment-methods">
              {[
                { key: "cash",   label: "💵 Cash" },
                { key: "esewa",  label: "📱 eSewa" },
                { key: "khalti", label: "💜 Khalti" },
                { key: "card",   label: "💳 Card" },
                { key: "qr",     label: "🔲 QR" }
              ].map(method => (
                <button
                  key={method.key}
                  className={`payment-btn ${paymentMethod === method.key ? "active" : ""}`}
                  onClick={() => setPaymentMethod(method.key)}
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
              {processing ? "Processing..." : "✅ Complete Payment"}
            </button>

            <button onClick={downloadPDF} disabled={processing} style={{ flex: 1 }}>
              📄 PDF
            </button>

            <button onClick={onClose} disabled={processing} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>

        </div>
      </div>

      {/* PRINT RECEIPT (CSS hides it normally, shows only on print) */}
      <div className="receipt-print">
        <div className="receipt-container">

          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>{orgName.toUpperCase()}</h3>
            {orgAddress && (
              <p style={{ margin: "2px 0", fontSize: 10 }}>{orgAddress}</p>
            )}
            {orgPhone && (
              <p style={{ margin: "2px 0", fontSize: 10 }}>Tel: {orgPhone}</p>
            )}
          </div>

          <hr />

          <p style={{ margin: "3px 0", fontSize: 11 }}>
            Order: <strong>{order?.orderNumber}</strong>
          </p>
          <p style={{ margin: "3px 0", fontSize: 11 }}>
            Table: {order?.table?.tableNumber}
          </p>
          <p style={{ margin: "3px 0", fontSize: 11 }}>
            Date: {new Date().toLocaleString()}
          </p>
          <p style={{ margin: "3px 0", fontSize: 11, textTransform: "capitalize" }}>
            Payment: {paymentMethod}
          </p>

          <hr />

          {order?.items?.map((item, i) => (
            <div key={i}>
              <div className="receipt-row">
                <span>
                  {item.quantity} × {getItemDisplay(item)}
                </span>
                <span>
                  Rs {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              {item.variants && item.variants.length > 0 && (
                <div style={{ fontSize: 9, opacity: 0.7, paddingLeft: 12, marginBottom: 4 }}>
                  {getVariantText(item)}
                </div>
              )}
            </div>
          ))}

          <hr />

          <div className="receipt-row">
            <span>Subtotal</span>
            <span>Rs {subtotal.toFixed(2)}</span>
          </div>
          {serviceCharge > 0 && (
            <div className="receipt-row">
              <span>Service (10%)</span>
              <span>Rs {serviceCharge.toFixed(2)}</span>
            </div>
          )}
          {vat > 0 && (
            <div className="receipt-row">
              <span>VAT (13%)</span>
              <span>Rs {vat.toFixed(2)}</span>
            </div>
          )}

          <hr />

          <div className="receipt-total">
            <strong>TOTAL</strong>
            <strong>Rs {total.toFixed(2)}</strong>
          </div>

          <hr />

          <p style={{ textAlign: "center", marginTop: 8, fontSize: 11 }}>
            Thank you for visiting!
          </p>
          {workingHours && (
            <p style={{ textAlign: "center", fontSize: 10, opacity: 0.7 }}>
              {workingHours}
            </p>
          )}

        </div>
      </div>
    </>
  );
}