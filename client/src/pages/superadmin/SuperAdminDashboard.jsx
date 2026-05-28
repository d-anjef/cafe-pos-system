import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

import EmptyState from "../../components/EmptyState";
import ErrorBoundary from "../../components/ErrorBoundary";
import "../../styles/admin.css";

const PLAN_COLORS = {
  free: "#888",
  starter: "#4caf50",
  business: "#d4af37",
  enterprise: "#e53935"
};

const ROLE_COLORS = {
  owner: "#d4af37",
  admin: "#4caf50",
  branch_manager: "#2196f3",
  waiter: "#9c27b0",
  kitchen: "#ff9800",
  super_admin: "#e53935"
};

export default function SuperAdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const tabs = [
    { key: "overview",      label: "📊 Overview" },
    { key: "organizations", label: "🏢 Organizations" },
    { key: "subscriptions", label: "💳 Subscriptions" },
    { key: "pending",       label: "⏳ Pending Upgrades" },
    { key: "users",         label: "👥 Users" },
  ];

  return (
    <div className="admin-shell">

      {/* SIDEBAR */}
      <div className="admin-sidebar glass-card">
        <div className="admin-logo">
          <span>👑</span>
          <h2>NUVLYX OWNER</h2>
        </div>

        <div className="admin-user">
          <span>{user?.name}</span>
          <small>Super Admin</small>
        </div>

        <div className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`sidebar-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="admin-content">
        {activeTab === "overview"      && <OverviewTab />}
        {activeTab === "organizations" && <OrganizationsTab />}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
        {activeTab === "pending"       && <PendingUpgradesTab />}
        {activeTab === "users"         && <UsersTab />}
      </div>
    </div>
  );
}

// ============================================================
// OVERVIEW TAB — UNCHANGED
// ============================================================
function OverviewTab() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/super-admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="tab-loading">Loading platform stats...</div>;
  if (!stats)  return <div className="tab-loading">Failed to load stats</div>;

  const planData = Object.entries(stats.planDistribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="dashboard-tab">
      <div className="tab-header">
        <h2>Platform Overview</h2>
        <small>{new Date().toDateString()}</small>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🏢</div>
          <div className="kpi-info">
            <h4>Total Organizations</h4>
            <h2>{stats.totalOrganizations}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-info">
            <h4>Total Users</h4>
            <h2>{stats.totalUsers}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">💳</div>
          <div className="kpi-info">
            <h4>Active Subscriptions</h4>
            <h2>{stats.activeSubscriptions}</h2>
          </div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-info">
            <h4>Monthly Revenue</h4>
            <h2>NPR {stats.monthlyRevenue?.toLocaleString() || 0}</h2>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-card">
          <h3>Plan Distribution</h3>
          {planData.length === 0 ? (
            <div className="chart-empty">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {planData.map((entry, index) => (
                    <Cell key={index} fill={PLAN_COLORS[entry.name] || "#888"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card glass-card">
          <h3>New Organizations (Last 7 Days)</h3>
          {!stats.newOrgsChart?.length ? (
            <div className="chart-empty">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.newOrgsChart}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#d4af37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Recent Organizations</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-soft)", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Name</th>
              <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Owner</th>
              <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Plan</th>
              <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Status</th>
              <th style={{ padding: "8px 12px", opacity: 0.6, fontWeight: 600 }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {(stats.recentOrgs || []).map(org => (
              <tr key={org._id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{org.name}</td>
                <td style={{ padding: "10px 12px", opacity: 0.8 }}>{org.owner?.name || "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    background: PLAN_COLORS[org.subscription?.plan] + "22",
                    color: PLAN_COLORS[org.subscription?.plan],
                    padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>
                    {org.subscription?.plan || "free"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ color: org.isActive ? "#4caf50" : "#e53935", fontWeight: 600, fontSize: 12 }}>
                    {org.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", opacity: 0.6, fontSize: 12 }}>
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// PENDING UPGRADES TAB — UPDATED reject prompt (now requires reason)
// ============================================================
function PendingUpgradesTab() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/billing/pending-upgrades");
      setPending(res.data.pendingUpgrades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPending(); }, []);

  const handleApprove = async (subId, orgName) => {
    const ok = await confirmAction(`Approve upgrade for ${orgName}? An email will be sent to the owner.`);
    if (!ok) return;

    setProcessing(subId);
    try {
      await api.post(`/billing/approve-upgrade/${subId}`);
      showSuccess(`Upgrade approved! ${orgName} has been notified.`);
      loadPending();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to approve");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (subId, orgName) => {
    const reason = window.prompt(
      `Reject upgrade for ${orgName}?\n\nPlease provide a reason (min 10 chars). The owner will receive this in an email:`
    );
    if (!reason) return;
    if (reason.trim().length < 10) {
      showError("Reason must be at least 10 characters");
      return;
    }
    setProcessing(subId);
    try {
      await api.post(`/billing/reject-upgrade/${subId}`, { reason: reason.trim() });
      showSuccess(`Upgrade rejected. ${orgName} has been notified.`);
      loadPending();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reject");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="tab-loading">Loading pending upgrades...</div>;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Pending Upgrade Requests</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>{pending.length} pending</span>

          {/* 🚀 MANUAL TRIAL CRON TRIGGER */}
          <button
            onClick={async () => {
              if (!window.confirm(
                'Run trial processing NOW?\n\n' +
                'This will:\n' +
                '• Send warning emails (7/3/1 days before expiry)\n' +
                '• Mark expired trials as past_due (grace period)\n' +
                '• Auto-downgrade trials past grace period to Free plan\n\n' +
                'Proceed?'
              )) return;

             try {
                const res = await api.post('/trial/run-now');
                const stats = res.data.result;
                showSuccess(
                  `Trial Cron Done! ` +
                  `${stats?.warnings?.sent || 0} warnings, ` +
                  `${stats?.expired?.expired || 0} expired, ` +
                  `${stats?.downgraded?.downgraded || 0} downgraded`
                );
              } catch (err) {
                showError('Failed: ' + (err.response?.data?.message || err.message));
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #d4af37, #f0c445)',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}
            title="Manually trigger trial processing (sends emails, downgrades expired trials)"
          >
            🚀 Run Trial Cron
          </button>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>✨</div>
          <h3>All Caught Up!</h3>
          <p style={{ opacity: 0.6 }}>No pending upgrade requests</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pending.map(sub => {
            const up = sub.pendingUpgrade;
            return (
              <div key={sub._id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{sub.organization?.name || "Unknown Org"}</h3>
                    <div style={{ opacity: 0.6, fontSize: 13, marginTop: 4 }}>
                      Requested by: {up.requestedBy?.name} ({up.requestedBy?.email})
                    </div>
                    <div style={{ opacity: 0.5, fontSize: 12, marginTop: 2 }}>
                      {new Date(up.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{
                    background: "#d4af3722", color: "#d4af37",
                    padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700
                  }}>
                    ⏳ PENDING
                  </span>
                </div>

                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14, padding: 16, background: "var(--bg-sidebar)", borderRadius: 10, marginBottom: 16
                }}>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: 12 }}>Requested Plan</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#d4af37", marginTop: 4 }}>
                      {up.plan?.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: 12 }}>Billing Cycle</div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{up.billingCycle}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: 12 }}>Amount</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#4caf50", marginTop: 4 }}>
                      NPR {up.amount?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: 12 }}>Payment Method</div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{up.paymentMethod}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ opacity: 0.6, fontSize: 12, marginBottom: 4 }}>Transaction Reference</div>
                  <code style={{
                    background: "rgba(255,255,255,0.05)", padding: "6px 12px",
                    borderRadius: 6, fontSize: 13, display: "inline-block"
                  }}>
                    {up.transactionRef || "—"}
                  </code>
                </div>

                {up.notes && (
                  <div style={{ marginBottom: 16, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13 }}>
                    <strong>Notes:</strong> {up.notes}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleReject(sub._id, sub.organization?.name)}
                    disabled={processing === sub._id}
                    style={{
                      padding: "10px 20px", borderRadius: 8, border: "none",
                      background: "#e5393522", color: "#e53935", cursor: "pointer", fontWeight: 600
                    }}
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(sub._id, sub.organization?.name)}
                    disabled={processing === sub._id}
                    style={{
                      padding: "10px 20px", borderRadius: 8, border: "none",
                      background: "#4caf50", color: "#fff", cursor: "pointer", fontWeight: 700
                    }}
                  >
                    {processing === sub._id ? "Processing..." : "✅ Approve & Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ============================================================
// ORGANIZATIONS TAB — UPDATED with Delete button
// ============================================================
function OrganizationsTab() {
  const [orgs, setOrgs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [deleteOrg, setDeleteOrg] = useState(null);

  const loadOrgs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/super-admin/organizations");
      setOrgs(res.data.organizations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrgs(); }, []);

  const handleToggleActive = async (orgId, current) => {
    try {
      await api.put(`/super-admin/organizations/${orgId}`, { isActive: !current });
      showSuccess(current ? "Organization deactivated" : "Organization activated");
      loadOrgs();
    } catch {
      showError("Failed to update organization");
    }
  };

  const handleChangePlan = async (orgId, plan) => {
    try {
      await api.put(`/super-admin/organizations/${orgId}/plan`, { plan });
      showSuccess(`Plan changed to ${plan.toUpperCase()}`);
      loadOrgs();
    } catch {
      showError("Failed to update plan");
    }
  };

  const filtered = orgs.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.owner?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="tab-loading">Loading organizations...</div>;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Organizations</h2>
        <span>{orgs.length} total</span>
      </div>

      <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <input
          placeholder="🔍 Search by name or owner email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: 10,
            border: "1px solid var(--border-soft)", background: "var(--bg-card)",
            color: "var(--text-primary)", fontSize: 14
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(org => (
          <div key={org._id} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h3 style={{ margin: 0 }}>{org.name}</h3>
                  <span style={{
                    background: PLAN_COLORS[org.subscription?.plan] + "22",
                    color: PLAN_COLORS[org.subscription?.plan],
                    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
                  }}>
                    {org.subscription?.plan?.toUpperCase() || "FREE"}
                  </span>
                  <span style={{
                    color: org.isActive ? "#4caf50" : "#e53935", fontSize: 12, fontWeight: 600
                  }}>
                    {org.isActive ? "● Active" : "● Inactive"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 20, opacity: 0.7, fontSize: 13, flexWrap: "wrap" }}>
                  <span>👤 {org.owner?.name || "—"}</span>
                  <span>📧 {org.owner?.email || "—"}</span>
                  <span>🏪 {org.branchCount || 0} branches</span>
                  <span>👥 {org.staffCount || 0} staff</span>
                  <span>📅 {new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={org.subscription?.plan || "free"}
                  onChange={e => handleChangePlan(org._id, e.target.value)}
                  style={{
                    padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border-soft)",
                    background: "var(--bg-card)", color: "var(--text-primary)",
                    fontSize: 13, cursor: "pointer"
                  }}
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <button
                  onClick={() => handleToggleActive(org._id, org.isActive)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "none",
                    background: org.isActive ? "#e5393522" : "#4caf5022",
                    color: org.isActive ? "#e53935" : "#4caf50",
                    cursor: "pointer", fontWeight: 600, fontSize: 13
                  }}
                >
                  {org.isActive ? "Deactivate" : "Activate"}
                </button>

                {/* ✅ NEW: DELETE BUTTON */}
                <button
                  onClick={() => setDeleteOrg(org)}
                  title="Permanently delete organization"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(229,57,53,0.4)",
                    background: "rgba(229,57,53,0.08)",
                    color: "#e53935",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
  <EmptyState
    icon="🏢"
    title="No organizations found"
    description={search ? `No matches for "${search}"` : "Organizations will appear here as customers sign up"}
  />
)}
      </div>

      {/* DELETE MODAL */}
      {deleteOrg && (
        <DeleteOrgModal
          org={deleteOrg}
          onClose={() => setDeleteOrg(null)}
          onSuccess={() => {
            setDeleteOrg(null);
            loadOrgs();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// DELETE ORGANIZATION MODAL
// ============================================================
function DeleteOrgModal({ org, onClose, onSuccess }) {
  const [preview, setPreview]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason]         = useState("");
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState("");

  // Fetch what will be deleted
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/super-admin/organizations/${org._id}/delete-preview`);
        setPreview(res.data.preview);
      } catch (err) {
        setError("Failed to load delete preview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [org._id]);

 const handleDelete = async () => {
    if (confirmation !== org.name) {
      setError(`Type "${org.name}" exactly to confirm`);
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await api.delete(`/super-admin/organizations/${org._id}`, {
        data: { confirmation, reason: reason.trim() }
      });

      showSuccess(
        `${org.name} deleted! ` +
        `${res.data.deletionStats.users} users, ` +
        `${res.data.deletionStats.branches} branches removed.`
      );

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const matches = confirmation === org.name;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48,
            background: "rgba(229,57,53,0.15)",
            border: "1px solid #e53935",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24
          }}>
            ⚠️
          </div>
          <div>
            <h2 style={{ margin: 0, color: "#e53935" }}>Delete Organization</h2>
            <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: 13 }}>
              This action is permanent and cannot be undone
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>
            Loading preview...
          </div>
        ) : (
          <>
            {/* WHAT WILL BE DELETED */}
            <div style={{
              background: "rgba(229,57,53,0.05)",
              border: "1px solid rgba(229,57,53,0.2)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e53935", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                The following will be permanently deleted:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <DeletionRow label="Organization" value="1" />
                <DeletionRow label="Owner" value={preview?.ownerName || "—"} />
                <DeletionRow label="Users" value={preview?.counts?.users || 0} />
                <DeletionRow label="Branches" value={preview?.counts?.branches || 0} />
                <DeletionRow label="Menu Items" value={preview?.counts?.menuItems || 0} />
                <DeletionRow label="Categories" value={preview?.counts?.categories || 0} />
                <DeletionRow label="Tables" value={preview?.counts?.tables || 0} />
                <DeletionRow label="Orders" value={preview?.counts?.orders || 0} />
              </div>
            </div>

            {/* REASON (optional) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, opacity: 0.7, marginBottom: 6, fontWeight: 600 }}>
                Reason for deletion (optional)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Customer requested account closure, fraudulent activity, etc."
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-soft)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
              <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                This will be included in the email to the owner
              </p>
            </div>

            {/* CONFIRMATION INPUT */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, opacity: 0.7, marginBottom: 6, fontWeight: 600 }}>
                Type <code style={{
                  background: "rgba(229,57,53,0.15)",
                  color: "#e53935",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 700
                }}>{org.name}</code> to confirm
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
                placeholder={`Type "${org.name}" here`}
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: matches
                    ? "2px solid #4caf50"
                    : "1px solid var(--border-soft)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontFamily: "monospace"
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div style={{
                background: "rgba(229,57,53,0.1)",
                border: "1px solid rgba(229,57,53,0.3)",
                color: "#e53935",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                disabled={deleting}
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
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!matches || deleting}
                style={{
                  flex: 2,
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  background: matches ? "#e53935" : "rgba(229,57,53,0.3)",
                  color: "white",
                  cursor: (matches && !deleting) ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  opacity: deleting ? 0.6 : 1
                }}
              >
                {deleting ? "Deleting..." : "🗑️ Permanently Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeletionRow({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      <span style={{ opacity: 0.7 }}>{label}:</span>
      <strong style={{ color: "#e53935" }}>{value}</strong>
    </div>
  );
}

// ============================================================
// SUBSCRIPTIONS TAB — UNCHANGED
// ============================================================
function SubscriptionsTab() {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/super-admin/subscriptions");
        setSubs(res.data.subscriptions || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="tab-loading">Loading subscriptions...</div>;

  const active   = subs.filter(s => s.status === "active").length;
  const trialing = subs.filter(s => s.status === "trialing").length;
  const pastDue  = subs.filter(s => s.status === "past_due").length;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Subscriptions</h2>
        <span>{subs.length} total</span>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-info"><h4>Active</h4><h2>{active}</h2></div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">🔔</div>
          <div className="kpi-info"><h4>Trialing</h4><h2>{trialing}</h2></div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-info"><h4>Past Due</h4><h2>{pastDue}</h2></div>
        </div>
        <div className="kpi-card glass-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-info">
            <h4>Total MRR</h4>
            <h2>NPR {subs.filter(s => s.status === "active").reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-sidebar)", textAlign: "left" }}>
              {["Organization", "Plan", "Status", "Amount", "Provider", "Period End"].map(h => (
                <th key={h} style={{ padding: "12px 16px", opacity: 0.6, fontWeight: 600, fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => (
              <tr key={sub._id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{sub.organization?.name || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: PLAN_COLORS[sub.plan] + "22",
                    color: PLAN_COLORS[sub.plan],
                    padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>
                    {sub.plan}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    color: sub.status === "active" ? "#4caf50"
                         : sub.status === "trialing" ? "#d4af37"
                         : "#e53935",
                    fontWeight: 600, fontSize: 12
                  }}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>NPR {sub.amount?.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", opacity: 0.7, fontSize: 13 }}>{sub.provider}</td>
                <td style={{ padding: "12px 16px", opacity: 0.7, fontSize: 12 }}>
                  {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// USERS TAB — ✅ REBUILT with collapsible groups by org
// ============================================================
function UsersTab() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedOrgs, setExpandedOrgs] = useState({});

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/super-admin/users");
      setUsers(res.data.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

const handleToggleUser = async (userId, current) => {
    try {
      await api.put(`/super-admin/users/${userId}`, { isActive: !current });
      showSuccess(current ? "User deactivated" : "User activated");
      loadUsers();
    } catch {
      showError("Failed to update user");
    }
  };

  // Filter users
  const filtered = users.filter(u => {
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // Group by organization
  const grouped = {};
  filtered.forEach(u => {
    const orgKey = u.organization?._id || "no-org";
    const orgName = u.organization?.name || "No Organization";

    if (!grouped[orgKey]) {
      grouped[orgKey] = {
        orgId: orgKey,
        orgName,
        users: []
      };
    }
    grouped[orgKey].users.push(u);
  });

  const groupArray = Object.values(grouped);

  // Sort groups: orgs with owner first, "No Organization" last
  groupArray.sort((a, b) => {
    if (a.orgId === "no-org") return 1;
    if (b.orgId === "no-org") return -1;
    return a.orgName.localeCompare(b.orgName);
  });

  // Auto-expand first group (or restore previous state)
  useEffect(() => {
    if (groupArray.length > 0 && Object.keys(expandedOrgs).length === 0) {
      const initial = {};
      initial[groupArray[0].orgId] = true;
      setExpandedOrgs(initial);
    }
    // eslint-disable-next-line
  }, [groupArray.length]);

  const toggleOrg = (orgId) => {
    setExpandedOrgs(prev => ({ ...prev, [orgId]: !prev[orgId] }));
  };

  const expandAll = () => {
    const all = {};
    groupArray.forEach(g => all[g.orgId] = true);
    setExpandedOrgs(all);
  };

  const collapseAll = () => {
    setExpandedOrgs({});
  };

  const roles = ["all", "owner", "admin", "branch_manager", "waiter", "kitchen"];

  if (loading) return <div className="tab-loading">Loading users...</div>;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>All Users</h2>
        <span>{users.length} users · {groupArray.length} organizations</span>
      </div>

      {/* FILTERS */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          placeholder="🔍 Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10,
            border: "1px solid var(--border-soft)", background: "var(--bg-card)",
            color: "var(--text-primary)", fontSize: 14
          }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{
            padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border-soft)",
            background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 14, cursor: "pointer"
          }}
        >
          {roles.map(r => (
            <option key={r} value={r}>
              {r === "all" ? "All Roles" : r.replace("_", " ")}
            </option>
          ))}
        </select>

        {/* EXPAND/COLLAPSE BUTTONS */}
        <button
          onClick={expandAll}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          Collapse all
        </button>
      </div>

      {/* GROUPED USER LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groupArray.length === 0 ? (
  <EmptyState
    icon="👥"
    title="No users found"
    description={search ? `No matches for "${search}"` : "Users will appear here as people sign up"}
  />
) : (
          groupArray.map(group => {
            const expanded = expandedOrgs[group.orgId];
            const owners = group.users.filter(u => u.role === "owner");
            const isNoOrg = group.orgId === "no-org";

            return (
              <div key={group.orgId} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>

                {/* GROUP HEADER */}
                <div
                  onClick={() => toggleOrg(group.orgId)}
                  style={{
                    padding: "14px 20px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: expanded ? "rgba(212,175,55,0.05)" : "transparent",
                    borderBottom: expanded ? "1px solid var(--border-soft)" : "none",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      fontSize: 14,
                      color: "#d4af37",
                      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s"
                    }}>
                      ▶
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        {isNoOrg ? "🌐" : "🏢"} {group.orgName}
                      </div>
                      {owners.length > 0 && (
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                          Owner: {owners[0].name} ({owners[0].email})
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      background: "rgba(212,175,55,0.15)",
                      color: "#d4af37",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {group.users.length} user{group.users.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* GROUP USERS */}
                {expanded && (
                  <div style={{ padding: 8 }}>
                    {group.users.map(u => (
                      <div
                        key={u._id}
                        style={{
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 10,
                          borderRadius: 8,
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 38, height: 38,
                            borderRadius: "50%",
                            background: ROLE_COLORS[u.role] + "33",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16
                          }}>
                            {u.role === "owner" ? "🏢"
                             : u.role === "admin" ? "⚙️"
                             : u.role === "branch_manager" ? "📋"
                             : u.role === "waiter" ? "🍽️"
                             : u.role === "kitchen" ? "👨‍🍳"
                             : "👑"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{u.name}</div>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>{u.email}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            background: ROLE_COLORS[u.role] + "22",
                            color: ROLE_COLORS[u.role],
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "capitalize"
                          }}>
                            {u.role.replace("_", " ")}
                          </span>

                          <span style={{
                            color: u.isActive ? "#4caf50" : "#e53935",
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            {u.isActive ? "● Active" : "● Inactive"}
                          </span>

                          <button
                            onClick={() => handleToggleUser(u._id, u.isActive)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "none",
                              background: u.isActive ? "#e5393522" : "#4caf5022",
                              color: u.isActive ? "#e53935" : "#4caf50",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: 11
                            }}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}