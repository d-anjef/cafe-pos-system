import { useEffect, useState } from "react";
import api from "../../services/api";
import { Mail, Phone, MapPin, Globe, Building2, Save } from "lucide-react";

export default function OrganizationTab() {
  const [org, setOrg]         = useState(null);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/organization");
        setOrg(res.data.organization);
        setForm({
          name: res.data.organization.name || "",
          logo: res.data.organization.logo || "",
          email:        res.data.organization.contactInfo?.email      || "",
          phone:        res.data.organization.contactInfo?.phone      || "",
          whatsapp:     res.data.organization.contactInfo?.whatsapp   || "",
          address:      res.data.organization.contactInfo?.address    || "",
          city:         res.data.organization.contactInfo?.city       || "",
          website:      res.data.organization.contactInfo?.website    || "",
          facebook:     res.data.organization.contactInfo?.facebook   || "",
          instagram:    res.data.organization.contactInfo?.instagram  || "",
          twitter:      res.data.organization.contactInfo?.twitter    || "",
          googleMaps:   res.data.organization.contactInfo?.googleMaps || "",
          workingHours: res.data.organization.contactInfo?.workingHours || ""
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.put("/organization", {
        name: form.name,
        logo: form.logo,
        contactInfo: {
          email:        form.email,
          phone:        form.phone,
          whatsapp:     form.whatsapp,
          address:      form.address,
          city:         form.city,
          website:      form.website,
          facebook:     form.facebook,
          instagram:    form.instagram,
          twitter:      form.twitter,
          googleMaps:   form.googleMaps,
          workingHours: form.workingHours
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="tab-loading">Loading organization...</div>;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Organization Settings</h2>
        {success && (
          <span style={{ color: "#4caf50", fontWeight: 600 }}>
            ✓ Saved successfully
          </span>
        )}
      </div>

      {/* BASIC INFO */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Building2 size={18} /> Basic Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Organization Name *">
            <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Logo URL (optional)">
            <input style={inputStyle} placeholder="https://..." value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} />
          </Field>
        </div>
      </div>

      {/* CONTACT */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Phone size={18} /> Contact Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="📧 Email"><input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="📞 Phone"><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="💬 WhatsApp"><input style={inputStyle} placeholder="+977..." value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></Field>
          <Field label="🌐 Website"><input style={inputStyle} placeholder="https://..." value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></Field>
        </div>
      </div>

      {/* LOCATION */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={18} /> Location
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="🏠 Address"><input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="🏙 City"><input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="🗺 Google Maps Link (share URL)">
              <input style={inputStyle} placeholder="https://maps.app.goo.gl/..." value={form.googleMaps} onChange={e => setForm({ ...form, googleMaps: e.target.value })} />
            </Field>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="🕒 Working Hours">
              <input style={inputStyle} placeholder="Mon-Sat: 8am-10pm" value={form.workingHours} onChange={e => setForm({ ...form, workingHours: e.target.value })} />
            </Field>
          </div>
        </div>
      </div>

      {/* SOCIAL */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={18} /> Social Media
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Facebook"><input style={inputStyle} placeholder="facebook.com/..." value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} /></Field>
          <Field label="Instagram"><input style={inputStyle} placeholder="@yourbrand" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} /></Field>
          <Field label="Twitter / X"><input style={inputStyle} placeholder="@yourbrand" value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} /></Field>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          className="gold-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 24px" }}
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: 14
};