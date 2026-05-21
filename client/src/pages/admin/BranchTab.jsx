import { useEffect, useState } from "react";
import api from "../../services/api";
import { Plus, Edit, Trash2, Power, X } from "lucide-react";

export default function BranchTab() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);

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

  const openAdd = () => {
    setEditBranch(null);
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBranch(b);
    setShowModal(true);
  };

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
      <div className="tab-header">
        <h2>Branch Management</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span>{branches.length} branches</span>
          <button className="gold-btn" onClick={openAdd} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {branches.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🏢</div>
          <h3>No branches yet</h3>
          <p style={{ opacity: 0.65, marginTop: 8 }}>Create your first branch to start taking orders.</p>
          <button className="gold-btn" onClick={openAdd} style={{ marginTop: 16 }}>
            Create Branch
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {branches.map((b) => (
            <div key={b._id} className="glass-card" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 240 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <h3 style={{ margin: 0 }}>{b.name}</h3>
                  <span style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontWeight: 700,
                    background: b.isActive ? "#4caf5022" : "#e5393522",
                    color: b.isActive ? "#4caf50" : "#e53935"
                  }}>
                    {b.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  Code: <strong>{b.code}</strong>
                </div>

                {(b.location?.address || b.location?.city) && (
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                    📍 {b.location?.address || ""} {b.location?.city ? `, ${b.location.city}` : ""}
                  </div>
                )}

                {b.contactInfo?.phone && (
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                    📞 {b.contactInfo.phone}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleToggleActive(b)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-soft)",
                    background: "white",
                    fontWeight: 700,
                    cursor: "pointer"
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
                    cursor: "pointer"
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
                    cursor: "pointer"
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BranchModal
          branch={editBranch}
          onClose={() => { setShowModal(false); setEditBranch(null); }}
          onSuccess={() => { setShowModal(false); setEditBranch(null); loadBranches(); }}
        />
      )}
    </div>
  );
}

// ============================================================
// MODAL
// ============================================================
function BranchModal({ branch, onClose, onSuccess }) {
  const isEdit = !!branch;

  const [form, setForm] = useState({
    name: branch?.name || "",
    code: branch?.code || "",
    address: branch?.location?.address || "",
    city: branch?.location?.city || "",
    phone: branch?.contactInfo?.phone || "",
    email: branch?.contactInfo?.email || "",
    autoAcceptOrders: branch?.settings?.autoAcceptOrders ?? true,
    allowReservations: branch?.settings?.allowReservations ?? false,
    printAutomatically: branch?.settings?.printAutomatically ?? false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Branch name is required");
    if (!isEdit && !form.code.trim()) return setError("Branch code is required");

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        ...(isEdit ? {} : { code: form.code }), // only send code on create
        location: {
          address: form.address,
          city: form.city,
          country: "Nepal"
        },
        contactInfo: {
          phone: form.phone,
          email: form.email
        },
        settings: {
          autoAcceptOrders: form.autoAcceptOrders,
          allowReservations: form.allowReservations,
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
      <form onSubmit={submit} className="settlement-modal glass-card" style={{ maxWidth: 560 }}>
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
            <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
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
            <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </Field>

          <Field label="City">
            <input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          </Field>

          <Field label="Phone">
            <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </Field>

          <Field label="Email">
            <input style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
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
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12 }}>
            Cancel
          </button>
          <button type="submit" className="gold-btn" disabled={loading} style={{ flex: 2, padding: 12 }}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, display: "block" }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <span style={{ fontSize: 13, opacity: 0.8 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid var(--border-soft)",
          background: value ? "rgba(76, 175, 80, 0.15)" : "rgba(229, 57, 53, 0.08)",
          color: value ? "#4caf50" : "#e53935",
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