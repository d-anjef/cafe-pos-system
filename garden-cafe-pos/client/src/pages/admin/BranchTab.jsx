import { useEffect, useState } from "react";
import api from "../../services/api";
import { Plus, Edit, Trash2, Power, QrCode, X, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function BranchTab() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editBranch, setEditBranch] = useState(null);

  // ── QR State ─────────────────────────────────────────────
  const [qrBranch, setQrBranch] = useState(null); // branch to show QR for

  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/branches");
      setBranches(res.data.branches || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBranches(); }, []);

  const openAdd  = () => { setEditBranch(null); setShowModal(true); };
  const openEdit = (b) => { setEditBranch(b);   setShowModal(true); };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete branch "${b.name}"?`)) return;
    try {
      await api.delete(`/branches/${b._id}`);
      loadBranches();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete branch");
    }
  };

  const handleToggleActive = async (b) => {
    try {
      await api.put(`/branches/${b._id}`, { isActive: !b.isActive });
      loadBranches();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update branch");
    }
  };

  if (loading) return <div className="tab-loading">Loading branches...</div>;

  return (
    <div className="admin-tab">

      {/* HEADER */}
      <div className="tab-header">
        <h2>Branch Management</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span>{branches.length} branches</span>
          <button
            className="gold-btn"
            onClick={openAdd}
            style={{ display: "flex", gap: 6, alignItems: "center" }}
          >
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {branches.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🏢</div>
          <h3>No branches yet</h3>
          <p style={{ opacity: 0.65, marginTop: 8 }}>
            Create your first branch to start taking orders.
          </p>
          <button className="gold-btn" onClick={openAdd} style={{ marginTop: 16 }}>
            Create Branch
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {branches.map((b) => (
            <div
              key={b._id}
              className="glass-card"
              style={{
                padding: 18,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap"
              }}
            >
              {/* BRANCH INFO */}
              <div style={{ minWidth: 240 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <h3 style={{ margin: 0 }}>{b.name}</h3>
                  <span style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontWeight: 700,
                    background: b.isActive ? "#4caf5022" : "#e5393522",
                    color:      b.isActive ? "#4caf50"   : "#e53935"
                  }}>
                    {b.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  Code: <strong>{b.code}</strong>
                </div>

                {(b.location?.address || b.location?.city) && (
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                    📍 {b.location?.address || ""}
                    {b.location?.city ? `, ${b.location.city}` : ""}
                  </div>
                )}

                {b.contactInfo?.phone && (
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                    📞 {b.contactInfo.phone}
                  </div>
                )}

                {/* QR URL PREVIEW — small hint */}
                <div style={{
                  fontSize: 11,
                  opacity: 0.4,
                  marginTop: 6,
                  fontFamily: "monospace",
                  wordBreak: "break-all"
                }}>
                  /menu/{b._id}/...
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

                {/* QR CODE BUTTON — new */}
                <button
                  onClick={() => setQrBranch(b)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(212,175,55,0.4)",
                    background: "rgba(212,175,55,0.1)",
                    color: "#d4af37",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                  title="Generate QR Code for customer ordering"
                >
                  <QrCode size={16} /> QR Code
                </button>

                <button
                  onClick={() => handleToggleActive(b)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-soft)",
                    background: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                  title={b.isActive ? "Deactivate" : "Activate"}
                >
                  <Power size={16} /> {b.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => openEdit(b)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-soft)",
                    background: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Edit size={16} /> Edit
                </button>

                <button
                  onClick={() => handleDelete(b)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(229,57,53,0.35)",
                    background: "#e5393522",
                    color: "#e53935",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BRANCH FORM MODAL */}
      {showModal && (
        <BranchModal
          branch={editBranch}
          onClose={() => { setShowModal(false); setEditBranch(null); }}
          onSuccess={() => { setShowModal(false); setEditBranch(null); loadBranches(); }}
        />
      )}

      {/* QR CODE MODAL */}
      {qrBranch && (
        <QRModal
          branch={qrBranch}
          onClose={() => setQrBranch(null)}
        />
      )}

    </div>
  );
}

// ============================================================
// QR CODE MODAL
// ============================================================
function QRModal({ branch, onClose }) {
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables]               = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);

  // Base URL — works in both dev and production
  const baseUrl = window.location.origin;

  // QR URL changes based on whether a table is selected
  const qrUrl = selectedTable
    ? `${baseUrl}/menu/${branch._id}/${selectedTable}`
    : `${baseUrl}/menu/${branch._id}/walk-in`; // fallback for branch-wide QR

  const displayUrl = selectedTable
    ? `/menu/${branch._id}/${selectedTable}`
    : `/menu/${branch._id}/walk-in`;

  // Load this branch's tables for per-table QR
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await api.get(`/tables?branchId=${branch._id}`);
        setTables(res.data || []);
      } catch {
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, [branch._id]);

  const handlePrint = () => {
    // Open print-friendly page in new tab
    const printWindow = window.open("", "_blank");
    const qrSvgEl    = document.getElementById("qr-svg-print");

    if (!qrSvgEl || !printWindow) return;

    const svgContent = qrSvgEl.outerHTML;
    const tableLabel = selectedTable
      ? `Table ${tables.find(t => t._id === selectedTable)?.tableNumber || ""}`
      : "All Tables (Walk-in)";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code — ${branch.name}</title>
          <style>
            body {
              font-family: -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
              text-align: center;
              background: white;
              color: black;
            }
            h1 { font-size: 28px; margin-bottom: 4px; }
            h2 { font-size: 20px; margin-bottom: 24px; opacity: 0.6; font-weight: 400; }
            svg { width: 240px; height: 240px; margin-bottom: 24px; }
            p  { font-size: 13px; opacity: 0.5; margin: 4px 0; }
            .instruction {
              font-size: 16px;
              font-weight: 600;
              margin-top: 20px;
              opacity: 0.8;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${branch.name}</h1>
          <h2>${tableLabel}</h2>
          ${svgContent}
          <p class="instruction">📱 Scan to view menu & order</p>
          <p style="margin-top:16px; font-size:11px; opacity:0.35">${qrUrl}</p>
          <br/>
          <button onclick="window.print()" 
            style="padding:12px 32px; font-size:15px; cursor:pointer; margin-top:16px;">
            🖨 Print
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
  };

  return (
    <div className="settlement-overlay" onClick={onClose}>
      <div
        className="settlement-modal glass-card"
        style={{ maxWidth: 440, textAlign: "center" }}
        onClick={e => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="settlement-header" style={{ textAlign: "left" }}>
          <div>
            <h2 style={{ margin: 0 }}>🔲 QR Code</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.6 }}>
              {branch.name}
            </p>
          </div>
          <button className="settlement-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* TABLE SELECTOR */}
        <div style={{ margin: "16px 0", textAlign: "left" }}>
          <label style={{ fontSize: 13, opacity: 0.7, display: "block", marginBottom: 6 }}>
            Generate QR for specific table (optional)
          </label>
          <select
            value={selectedTable}
            onChange={e => setSelectedTable(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: 14
            }}
          >
            <option value="">🏢 Branch QR (Walk-in / any table)</option>
            {loadingTables ? (
              <option disabled>Loading tables...</option>
            ) : (
              tables.map(t => (
                <option key={t._id} value={t._id}>
                  Table {t.tableNumber} ({t.capacity} seats)
                </option>
              ))
            )}
          </select>
          <p style={{ fontSize: 11, opacity: 0.45, marginTop: 6, textAlign: "left" }}>
            {selectedTable
              ? "Customer scans → goes directly to this table's menu"
              : "Customer scans → can browse menu (waiter assigns table at order)"}
          </p>
        </div>

        {/* QR CODE */}
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 16,
          display: "inline-block",
          margin: "0 auto 20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
        }}>
          <QRCodeSVG
            id="qr-svg-print"
            value={qrUrl}
            size={200}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/logo-small.png",   // optional: your logo in center
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        {/* URL DISPLAY */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: "monospace",
            opacity: 0.6,
            wordBreak: "break-all",
            textAlign: "left"
          }}>
            {displayUrl}
          </span>
          <button
            onClick={handleCopyUrl}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid var(--border-soft)",
              background: "transparent",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: 11,
              whiteSpace: "nowrap"
            }}
          >
            Copy URL
          </button>
        </div>

        {/* INFO CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 20,
          textAlign: "left"
        }}>
          <div style={{
            background: "rgba(76,175,80,0.08)",
            border: "1px solid rgba(76,175,80,0.2)",
            borderRadius: 10,
            padding: "10px 12px"
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4caf50", marginBottom: 4 }}>
              ✅ AUTO UPDATES
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
              Menu changes appear instantly. No reprint needed.
            </div>
          </div>

          <div style={{
            background: "rgba(33,150,243,0.08)",
            border: "1px solid rgba(33,150,243,0.2)",
            borderRadius: 10,
            padding: "10px 12px"
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2196f3", marginBottom: 4 }}>
              📱 MOBILE READY
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
              Works on any phone browser. No app install needed.
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "transparent",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Close
          </button>
          <button
            className="gold-btn"
            onClick={handlePrint}
            style={{
              flex: 2,
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <Printer size={16} /> Print QR Code
          </button>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// BRANCH FORM MODAL — unchanged from your original
// ============================================================
function BranchModal({ branch, onClose, onSuccess }) {
  const isEdit = !!branch;

  const [form, setForm] = useState({
    name:               branch?.name                           || "",
    code:               branch?.code                           || "",
    address:            branch?.location?.address              || "",
    city:               branch?.location?.city                 || "",
    phone:              branch?.contactInfo?.phone             || "",
    email:              branch?.contactInfo?.email             || "",
    autoAcceptOrders:   branch?.settings?.autoAcceptOrders     ?? true,
    allowReservations:  branch?.settings?.allowReservations    ?? false,
    printAutomatically: branch?.settings?.printAutomatically   ?? false
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Branch name is required");
    if (!isEdit && !form.code.trim()) return setError("Branch code is required");

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        ...(isEdit ? {} : { code: form.code }),
        location: {
          address: form.address,
          city:    form.city,
          country: "Nepal"
        },
        contactInfo: {
          phone: form.phone,
          email: form.email
        },
        settings: {
          autoAcceptOrders:   form.autoAcceptOrders,
          allowReservations:  form.allowReservations,
          printAutomatically: form.printAutomatically
        }
      };

      if (isEdit) {
        await api.put(`/branches/${branch._id}`, payload);
      } else {
        await api.post("/branches", payload);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settlement-overlay">
      <form
        onSubmit={submit}
        className="settlement-modal glass-card"
        style={{ maxWidth: 560 }}
      >
        <div className="settlement-header">
          <h2>{isEdit ? "Edit Branch" : "Add Branch"}</h2>
          <button type="button" className="settlement-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{
            background: "#e5393522",
            color: "#e53935",
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Branch Name *">
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label={`Branch Code ${isEdit ? "(locked)" : "*"}`}>
            <input
              style={{ ...inputStyle, opacity: isEdit ? 0.6 : 1 }}
              value={form.code}
              disabled={isEdit}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. MAIN"
            />
          </Field>

          <Field label="Address">
            <input
              style={inputStyle}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          <Field label="City">
            <input
              style={inputStyle}
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
          </Field>

          <Field label="Phone">
            <input
              style={inputStyle}
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </Field>

          <Field label="Email">
            <input
              style={inputStyle}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>

        <div className="glass-card" style={{ padding: 14, marginTop: 14 }}>
          <h4 style={{ marginBottom: 10 }}>Branch Settings</h4>
          <Toggle
            label="Auto accept orders"
            value={form.autoAcceptOrders}
            onChange={(v) => setForm({ ...form, autoAcceptOrders: v })}
          />
          <Toggle
            label="Allow reservations"
            value={form.allowReservations}
            onChange={(v) => setForm({ ...form, allowReservations: v })}
          />
          <Toggle
            label="Print automatically"
            value={form.printAutomatically}
            onChange={(v) => setForm({ ...form, printAutomatically: v })}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: 12 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="gold-btn"
            disabled={loading}
            style={{ flex: 2, padding: 12 }}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label style={{
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 6,
        display: "block"
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid var(--border-soft)"
    }}>
      <span style={{ fontSize: 13, opacity: 0.8 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid var(--border-soft)",
          background: value ? "rgba(76, 175, 80, 0.15)" : "rgba(229, 57, 53, 0.08)",
          color:      value ? "#4caf50" : "#e53935",
          fontWeight: 800,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        {value ? "ON" : "OFF"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: 14
};