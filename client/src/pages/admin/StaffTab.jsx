import { useEffect, useState } from "react";
import api from "../../services/api";
import { useBranch } from "../../context/BranchContext";
import {
  Plus, Search, Edit, Trash2, Key, X, Check,
  User as UserIcon, Mail, Lock, Phone, Briefcase
} from "lucide-react";
import { showSuccess, showError } from "../../utils/toast";

const ROLE_COLORS = {
  admin:          "#4caf50",
  branch_manager: "#2196f3",
  waiter:         "#9c27b0",
  kitchen:        "#ff9800"
};

const ROLE_ICONS = {
  admin:          "⚙️",
  branch_manager: "📋",
  waiter:         "🍽️",
  kitchen:        "👨‍🍳"
};

const ROLE_LABELS = {
  admin:          "Admin",
  branch_manager: "Branch Manager",
  waiter:         "Waiter",
  kitchen:        "Kitchen Staff"
};

export default function StaffTab() {
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAdd, setShowAdd]   = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [resetStaff, setResetStaff] = useState(null);
  const { branches } = useBranch();

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get("/staff");
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

 const handleToggleActive = async (s) => {
    try {
      await api.put(`/staff/${s._id}`, { isActive: !s.isActive });
      showSuccess(s.isActive ? `${s.name} deactivated` : `${s.name} activated`);
      loadStaff();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update");
    }
  };

 const handleDelete = async (s) => {
    const ok = await confirmAction(`Delete ${s.name}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/staff/${s._id}`);
      showSuccess(`${s.name} deleted`);
      loadStaff();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete");
    }
  };

  const filtered = staff.filter(s => {
    const matchRole   = roleFilter === "all" || s.role === roleFilter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="tab-loading">Loading staff...</div>;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Staff Management</h2>
        <span>{staff.length} total</span>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <div key={role} className="kpi-card glass-card">
            <div className="kpi-icon">{ROLE_ICONS[role]}</div>
            <div className="kpi-info">
              <h4>{label}</h4>
              <h2>{roleCounts[role] || 0}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-card)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            cursor: "pointer"
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="branch_manager">Branch Manager</option>
          <option value="waiter">Waiter</option>
          <option value="kitchen">Kitchen</option>
        </select>

        <button
          className="gold-btn"
          onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* STAFF LIST */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h3>No staff found</h3>
          <p style={{ opacity: 0.6 }}>
            {search || roleFilter !== "all"
              ? "Try changing your filters"
              : "Click 'Add Staff' to create your first team member"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(s => (
            <div
              key={s._id}
              className="glass-card"
              style={{
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                opacity: s.isActive ? 1 : 0.5
              }}
            >
              {/* LEFT — Avatar + Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 250 }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: "50%",
                  background: ROLE_COLORS[s.role] + "33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20
                }}>
                  {ROLE_ICONS[s.role]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>{s.email}</div>
                  {s.employeeId && (
                    <div style={{ fontSize: 11, opacity: 0.5 }}>ID: {s.employeeId}</div>
                  )}
                </div>
              </div>

              {/* MIDDLE — Branches */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {s.branches?.length > 0 ? (
                  s.branches.map(b => (
                    <span key={b._id} style={{
                      background: "var(--bg-sidebar)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11
                    }}>
                      🏪 {b.name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, opacity: 0.5 }}>No branches assigned</span>
                )}
              </div>

              {/* RIGHT — Status + Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  background: ROLE_COLORS[s.role] + "22",
                  color: ROLE_COLORS[s.role],
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {ROLE_LABELS[s.role]}
                </span>

                <span style={{
                  color: s.isActive ? "#4caf50" : "#e53935",
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {s.isActive ? "● Active" : "● Inactive"}
                </span>

                <button
                  onClick={() => setEditStaff(s)}
                  title="Edit"
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => setResetStaff(s)}
                  title="Reset Password"
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}
                >
                  <Key size={16} />
                </button>

                <button
                  onClick={() => handleToggleActive(s)}
                  title={s.isActive ? "Deactivate" : "Activate"}
                  style={{
                    background: s.isActive ? "#e5393522" : "#4caf5022",
                    color: s.isActive ? "#e53935" : "#4caf50",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => handleDelete(s)}
                  title="Delete"
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#e53935" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showAdd && (
        <StaffModal
          mode="add"
          branches={branches}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); loadStaff(); }}
        />
      )}

      {editStaff && (
        <StaffModal
          mode="edit"
          staff={editStaff}
          branches={branches}
          onClose={() => setEditStaff(null)}
          onSuccess={() => { setEditStaff(null); loadStaff(); }}
        />
      )}

      {resetStaff && (
        <ResetPasswordModal
          staff={resetStaff}
          onClose={() => setResetStaff(null)}
          onSuccess={() => setResetStaff(null)}
        />
      )}

    </div>
  );
}

// ============================================================
// STAFF MODAL — Add / Edit
// ============================================================
function StaffModal({ mode, staff, branches, onClose, onSuccess }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name:     staff?.name     || "",
    email:    staff?.email    || "",
    password: "",
    role:     staff?.role     || "waiter",
    branches: staff?.branches?.map(b => b._id) || [],
    phone:    staff?.phone    || "",
    salary:   staff?.salary   || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleBranchToggle = (branchId) => {
    setForm(prev => ({
      ...prev,
      branches: prev.branches.includes(branchId)
        ? prev.branches.filter(id => id !== branchId)
        : [...prev.branches, branchId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit && form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/staff/${staff._id}`, {
          name: form.name,
          role: form.role,
          branches: form.branches,
          phone: form.phone,
          salary: form.salary ? Number(form.salary) : undefined
        });
        showSuccess(`${form.name} updated`);
      } else {
        await api.post("/staff", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          branches: form.branches,
          phone: form.phone,
          salary: form.salary ? Number(form.salary) : undefined
        });
        showSuccess(`${form.name} added as ${form.role.replace('_', ' ')}`);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settlement-overlay">
      <form onSubmit={handleSubmit} className="settlement-modal glass-card" style={{ maxWidth: 540 }}>
        <div className="settlement-header">
          <h2>{isEdit ? `Edit ${staff.name}` : "Add New Staff"}</h2>
          <button type="button" className="settlement-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{
            background: "#e5393522",
            color: "#e53935",
            padding: 10,
            borderRadius: 8,
            marginBottom: 14,
            fontSize: 13
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* NAME */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
              Full Name *
            </label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Doe"
              style={inputStyle}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
              Email * {isEdit && <span style={{ opacity: 0.5 }}>(cannot be changed)</span>}
            </label>
            <input
              type="email"
              required
              disabled={isEdit}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="staff@cafe.com"
              style={inputStyle}
            />
          </div>

          {/* PASSWORD (only on add) */}
          {!isEdit && (
            <div>
              <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
                Password * (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {/* ROLE */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
              Role *
            </label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={inputStyle}
            >
              <option value="admin">⚙️ Admin</option>
              <option value="branch_manager">📋 Branch Manager</option>
              <option value="waiter">🍽️ Waiter</option>
              <option value="kitchen">👨‍🍳 Kitchen Staff</option>
            </select>
          </div>

          {/* BRANCHES */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, display: "block" }}>
              Assign Branches
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {branches.length === 0 ? (
                <span style={{ fontSize: 12, opacity: 0.5 }}>No branches available</span>
              ) : (
                branches.map(b => (
                  <button
                    type="button"
                    key={b._id}
                    onClick={() => handleBranchToggle(b._id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: form.branches.includes(b._id)
                        ? "2px solid var(--primary-gold)"
                        : "1px solid var(--border-soft)",
                      background: form.branches.includes(b._id)
                        ? "rgba(212, 175, 55, 0.1)"
                        : "var(--bg-card)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    {form.branches.includes(b._id) && "✓ "}
                    {b.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
              Phone (optional)
            </label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+977-98XXXXXXXX"
              style={inputStyle}
            />
          </div>

          {/* SALARY */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
              Monthly Salary NPR (optional)
            </label>
            <input
              type="number"
              value={form.salary}
              onChange={e => setForm({ ...form, salary: e.target.value })}
              placeholder="e.g. 25000"
              style={inputStyle}
            />
          </div>

        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12 }}>
            Cancel
          </button>
          <button type="submit" className="gold-btn" disabled={loading} style={{ flex: 2, padding: 12 }}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// RESET PASSWORD MODAL
// ============================================================
function ResetPasswordModal({ staff, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.put(`/staff/${staff._id}/reset-password`, { newPassword: password });
      setSuccess(true);
      showSuccess(`Password reset for ${staff.name}`);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="settlement-overlay">
        <div className="settlement-modal glass-card" style={{ maxWidth: 400, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>✅</div>
          <h3>Password Reset!</h3>
          <p style={{ opacity: 0.7, fontSize: 14, marginTop: 8 }}>
            New password: <code style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 6 }}>{password}</code>
          </p>
          <p style={{ opacity: 0.6, fontSize: 13, marginTop: 12 }}>
            Share this with {staff.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settlement-overlay">
      <form onSubmit={handleSubmit} className="settlement-modal glass-card" style={{ maxWidth: 400 }}>
        <div className="settlement-header">
          <h2>Reset Password</h2>
          <button type="button" className="settlement-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
          Resetting password for <strong>{staff.name}</strong> ({staff.email})
        </p>

        {error && (
          <div style={{ background: "#e5393522", color: "#e53935", padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, display: "block" }}>
            New Password (min 6 chars)
          </label>
          <input
            type="text"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
            autoFocus
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12 }}>
            Cancel
          </button>
          <button type="submit" className="gold-btn" disabled={loading} style={{ flex: 2, padding: 12 }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// SHARED STYLE
// ============================================================
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: 14
};