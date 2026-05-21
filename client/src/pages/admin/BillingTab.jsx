import { useEffect, useState } from "react";
import api from "../../services/api";

const PLAN_COLORS = {
  free: "#888",
  starter: "#4caf50",
  business: "#d4af37",
  enterprise: "#e53935"
};

export default function BillingTab() {
  const [billing, setBilling] = useState(null);
  const [plans, setPlans]     = useState({});
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [billingRes, plansRes] = await Promise.all([
        api.get("/billing/current"),
        api.get("/billing/plans")
      ]);
      setBilling(billingRes.data);
      setPlans(plansRes.data.plans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  if (loading) return <div className="tab-loading">Loading billing...</div>;
  if (!billing) return <div className="tab-loading">Failed to load billing</div>;

  const usagePercent = (used, limit) => Math.min((used / limit) * 100, 100);
  const usageColor = (pct) => pct >= 90 ? "#e53935" : pct >= 75 ? "#ff9800" : "#4caf50";

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Billing & Subscription</h2>
        <span>{billing.organization.name}</span>
      </div>

      {/* CURRENT PLAN CARD */}
<div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>

    <div>
      <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>CURRENT PLAN</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, color: PLAN_COLORS[billing.organization.plan] }}>
          {billing.planDetails.name}
        </h1>
        <span style={{
          background: billing.organization.status === 'trialing' ? '#f59e0b22' : PLAN_COLORS[billing.organization.plan] + "22",
          color: billing.organization.status === 'trialing' ? '#f59e0b' : PLAN_COLORS[billing.organization.plan],
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700
        }}>
          {billing.organization.status?.toUpperCase()}
        </span>
      </div>

      {/* TRIAL INFO */}
      {billing.organization.status === 'trialing' && billing.organization.trialEndsAt && (
        <div style={{ 
          marginTop: 10, 
          padding: '8px 12px',
          background: '#f59e0b15',
          border: '1px solid #f59e0b44',
          borderRadius: 8,
          fontSize: 13,
          color: '#f59e0b'
        }}>
          🔔 Trial ends on {new Date(billing.organization.trialEndsAt).toLocaleDateString()} 
          ({Math.ceil((new Date(billing.organization.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))} days left)
        </div>
      )}

      {billing.organization.status !== 'trialing' && (
        <>
          <div style={{ marginTop: 8, opacity: 0.7, fontSize: 14 }}>
            NPR {billing.planDetails.monthly}/month
          </div>
          {billing.organization.currentPeriodEnd && (
            <div style={{ marginTop: 6, opacity: 0.5, fontSize: 13 }}>
              Next billing: {new Date(billing.organization.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
        </>
      )}
    </div>

    <button className="gold-btn" onClick={() => setShowUpgrade(true)}>
      ⬆️ Change Plan
    </button>

  </div>
</div>

      {/* USAGE METER */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Usage</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            { label: "Branches",   used: billing.usage.branches,  limit: billing.limits.branches,  icon: "🏪" },
            { label: "Tables",     used: billing.usage.tables,    limit: billing.limits.tables,    icon: "🪑" },
            { label: "Staff",      used: billing.usage.staff,     limit: billing.limits.staff,     icon: "👥" },
            { label: "Menu Items", used: billing.usage.menuItems, limit: billing.limits.menuItems, icon: "🍽️" }
          ].map(item => {
            const pct = usagePercent(item.used, item.limit);
            return (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.icon} {item.label}</span>
                  <strong>{item.used} / {item.limit}</strong>
                </div>
                <div style={{
                  height: 8,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: usageColor(pct),
                    transition: "width 0.3s"
                  }} />
                </div>
                {pct >= 90 && (
                  <small style={{ color: "#e53935", marginTop: 4, display: "block" }}>
                    ⚠️ Near limit
                  </small>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AVAILABLE PLANS */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Available Plans</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {Object.entries(plans).map(([key, plan]) => {
            const isCurrent = billing.organization.plan === key;
            return (
              <div
                key={key}
                style={{
                  border: isCurrent
                    ? `2px solid ${PLAN_COLORS[key]}`
                    : "1px solid var(--border-soft)",
                  borderRadius: 12,
                  padding: 20,
                  background: "var(--bg-card)",
                  position: "relative"
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: "absolute",
                    top: -10, right: 12,
                    background: PLAN_COLORS[key],
                    color: "#000",
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    CURRENT
                  </div>
                )}

                <h3 style={{ margin: 0, color: PLAN_COLORS[key] }}>{plan.name}</h3>
                <div style={{ margin: "10px 0" }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>NPR {plan.monthly}</span>
                  <span style={{ opacity: 0.6 }}>/mo</span>
                </div>

                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>
                  Yearly: NPR {plan.yearly} <span style={{ color: "#4caf50" }}>(save 20%)</span>
                </div>

                <ul style={{ padding: 0, listStyle: "none", margin: 0, fontSize: 13 }}>
                  <li>✓ {plan.limits.branches} branches</li>
                  <li>✓ {plan.limits.tables} tables</li>
                  <li>✓ {plan.limits.staff} staff</li>
                  <li>✓ {plan.limits.menuItems} menu items</li>
                </ul>

                {!isCurrent && (
                  <button
                    onClick={() => { setSelectedPlan({ key, ...plan }); setShowUpgrade(true); }}
                    style={{
                      marginTop: 14,
                      width: "100%",
                      padding: "10px",
                      background: PLAN_COLORS[key],
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 700
                    }}
                  >
                    Select Plan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PAYMENT HISTORY */}
      {billing.subscription?.paymentHistory?.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Payment History</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-soft)", textAlign: "left" }}>
                <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Date</th>
                <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Method</th>
                <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {billing.subscription.paymentHistory.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "10px 12px" }}>{new Date(p.date).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 12px" }}>NPR {p.amount?.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px" }}>{p.method}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      color: p.status === "succeeded" ? "#4caf50" : "#e53935",
                      fontWeight: 600,
                      fontSize: 12
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <UpgradeModal
          plans={plans}
          currentPlan={billing.organization.plan}
          preselected={selectedPlan}
          onClose={() => { setShowUpgrade(false); setSelectedPlan(null); }}
          onSuccess={() => { setShowUpgrade(false); setSelectedPlan(null); loadAll(); }}
        />
      )}

    </div>
  );
}

// ============================================================
// UPGRADE MODAL
// ============================================================
function UpgradeModal({ plans, currentPlan, preselected, onClose, onSuccess }) {
  const [plan, setPlan]                   = useState(preselected?.key || "business");
  const [billingCycle, setBillingCycle]   = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes]                 = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [success, setSuccess]             = useState(false);

  const selectedPlanDetails = plans[plan];
  const amount = billingCycle === "yearly"
    ? selectedPlanDetails.yearly
    : selectedPlanDetails.monthly;

  const handleSubmit = async () => {
    if (!transactionRef.trim()) {
      return alert("Please enter your transaction reference/proof");
    }

    setSubmitting(true);
    try {
      await api.post("/billing/request-upgrade", {
        plan,
        billingCycle,
        paymentMethod,
        transactionRef,
        notes
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="settlement-overlay">
        <div className="settlement-modal glass-card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 60 }}>✅</div>
          <h2 style={{ color: "#4caf50" }}>Request Submitted!</h2>
          <p style={{ opacity: 0.7 }}>
            Our team will verify your payment and activate your plan within 24 hours.
            You'll receive a confirmation via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settlement-overlay">
      <div className="settlement-modal glass-card" style={{ maxWidth: 560 }}>
        <div className="settlement-header">
          <h2>Upgrade Plan</h2>
          <button className="settlement-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "0 0 20px 0" }}>

          {/* PLAN SELECT */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7, display: "block", marginBottom: 6 }}>
              Select Plan
            </label>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              style={{
                width: "100%", padding: "10px",
                borderRadius: 8,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "var(--text-primary)"
              }}
            >
              {Object.entries(plans).map(([key, p]) => (
                <option key={key} value={key} disabled={key === currentPlan}>
                  {p.name} {key === currentPlan ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* BILLING CYCLE */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7, display: "block", marginBottom: 6 }}>
              Billing Cycle
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setBillingCycle("monthly")}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: billingCycle === "monthly" ? "2px solid #d4af37" : "1px solid var(--border-soft)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Monthly<br/>
                <small>NPR {selectedPlanDetails.monthly}</small>
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: billingCycle === "yearly" ? "2px solid #d4af37" : "1px solid var(--border-soft)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Yearly<br/>
                <small>NPR {selectedPlanDetails.yearly} <span style={{ color: "#4caf50" }}>(-20%)</span></small>
              </button>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7, display: "block", marginBottom: 6 }}>
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              style={{
                width: "100%", padding: "10px",
                borderRadius: 8,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "var(--text-primary)"
              }}
            >
              <option value="bank-transfer">Bank Transfer</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* PAYMENT INSTRUCTIONS */}
          <div style={{
            background: "#d4af3711",
            border: "1px solid #d4af3744",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            fontSize: 13
          }}>
            <strong style={{ color: "#d4af37" }}>💡 Payment Instructions</strong>
            <div style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.6 }}>
              {paymentMethod === "bank-transfer" && (
                <>
                  Transfer <strong>NPR {amount}</strong> to:<br/>
                  Bank: <strong>Nabil Bank</strong><br/>
                  Account: <strong>0123456789</strong><br/>
                  Name: <strong>Your SaaS Company</strong>
                </>
              )}
              {paymentMethod === "esewa" && (
                <>Send <strong>NPR {amount}</strong> to eSewa ID: <strong>9800000000</strong></>
              )}
              {paymentMethod === "khalti" && (
                <>Send <strong>NPR {amount}</strong> to Khalti: <strong>9800000000</strong></>
              )}
              {paymentMethod === "cash" && (
                <>Contact us to arrange cash pickup for <strong>NPR {amount}</strong></>
              )}
            </div>
          </div>

          {/* TRANSACTION REFERENCE */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7, display: "block", marginBottom: 6 }}>
              Transaction Reference / Proof *
            </label>
            <input
              placeholder="e.g. TXN123456 or receipt number"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              style={{
                width: "100%", padding: "10px",
                borderRadius: 8,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "var(--text-primary)"
              }}
            />
          </div>

          {/* NOTES */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, opacity: 0.7, display: "block", marginBottom: 6 }}>
              Notes (optional)
            </label>
            <textarea
              placeholder="Any additional info..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              style={{
                width: "100%", padding: "10px",
                borderRadius: 8,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                resize: "vertical"
              }}
            />
          </div>

          {/* SUMMARY */}
          <div style={{
            padding: 14,
            background: "var(--bg-sidebar)",
            borderRadius: 8,
            marginBottom: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ opacity: 0.7 }}>Plan:</span>
              <strong>{selectedPlanDetails.name}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ opacity: 0.7 }}>Cycle:</span>
              <strong>{billingCycle}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
              <strong>Total:</strong>
              <strong style={{ color: "#d4af37" }}>NPR {amount}</strong>
            </div>
          </div>

          {/* SUBMIT */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 12 }}>
              Cancel
            </button>
            <button
              className="gold-btn"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ flex: 2, padding: 12 }}
            >
              {submitting ? "Submitting..." : "Submit Upgrade Request"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}