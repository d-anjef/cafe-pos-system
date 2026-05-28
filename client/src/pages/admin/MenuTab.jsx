import { useEffect, useState } from "react";
import api from "../../services/api";
import { showSuccess, showError, confirmAction } from "../../utils/toast";
import EmptyState from "../../components/EmptyState";
import {
  Plus, Edit, Trash2, X, Star, Eye, EyeOff,
  Tag, Layers, ChefHat, Search
} from "lucide-react";

export default function MenuTab() {
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeView, setActiveView] = useState("items"); // items | categories

  const [showItemModal, setShowItemModal]     = useState(false);
  const [showCatModal, setShowCatModal]       = useState(false);
  const [editItem, setEditItem]               = useState(null);
  const [editCategory, setEditCategory]       = useState(null);

  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("all");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        api.get("/menu/item"),
        api.get("/menu/categories")
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDelete = async (item) => {
    const ok = await confirmAction(`Delete "${item.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/menu/item/${item._id}`);
      showSuccess(`${item.name} deleted`);
      loadAll();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete item");
    }
  };

  const handleToggleAvail = async (item) => {
    try {
      await api.put(`/menu/item/${item._id}/toggle`);
      showSuccess(item.isAvailable ? `${item.name} disabled` : `${item.name} enabled`);
      loadAll();
    } catch (err) {
      showError("Failed to toggle availability");
    }
  };

  const handleToggleSpecial = async (item) => {
    try {
      await api.put(`/menu/item/${item._id}/special`);
      showSuccess(item.isTodaysSpecial ? "Removed from specials" : "Marked as today's special");
      loadAll();
    } catch (err) {
      showError("Failed to toggle special status");
    }
  };

  const handleDeleteCat = async (cat) => {
    const ok = await confirmAction(`Delete category "${cat.name}"? This might affect items in this category.`);
    if (!ok) return;
    try {
      await api.delete(`/menu/categories/${cat._id}`);
      showSuccess(`Category "${cat.name}" deleted`);
      loadAll();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete category");
    }
  };

  // Filter
  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || i.category === filterCat;
    return matchSearch && matchCat;
  });

  // Group by category
  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Counts
  const specialCount = items.filter(i => i.isTodaysSpecial).length;
  const availCount = items.filter(i => i.isAvailable).length;

  if (loading) return <div className="tab-loading">Loading menu...</div>;

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>Menu Management</h2>
        <span>{items.length} items · {categories.length} categories · {specialCount} specials</span>
      </div>

      {/* VIEW TOGGLE */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setActiveView("items")}
          className={activeView === "items" ? "gold-btn" : ""}
          style={btnStyle(activeView === "items")}
        >
          <Layers size={14} /> Menu Items
        </button>
        <button
          onClick={() => setActiveView("categories")}
          className={activeView === "categories" ? "gold-btn" : ""}
          style={btnStyle(activeView === "categories")}
        >
          <Tag size={14} /> Categories
        </button>
      </div>

      {/* ============================================
          ITEMS VIEW
      ============================================ */}
      {activeView === "items" && (
        <>
          {/* CONTROLS */}
          <div className="glass-card" style={{ padding: 14, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <Search size={14} style={searchIconStyle} />
              <input
                placeholder="Search menu items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>

            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>

            <button
              className="gold-btn"
              onClick={() => { setEditItem(null); setShowItemModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* TODAY'S SPECIALS SECTION */}
          {specialCount > 0 && (
            <div className="glass-card" style={{ padding: 18, marginBottom: 16, border: "2px solid #d4af37" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, color: "#d4af37", marginBottom: 12 }}>
                <Star size={18} fill="#d4af37" /> Today's Specials ({specialCount})
              </h3>
              <div className="menu-items-grid">
                {items.filter(i => i.isTodaysSpecial).map(item => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onEdit={() => { setEditItem(item); setShowItemModal(true); }}
                    onDelete={() => handleDelete(item)}
                    onToggleAvail={() => handleToggleAvail(item)}
                    onToggleSpecial={() => handleToggleSpecial(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ITEMS BY CATEGORY */}
          {Object.keys(grouped).length === 0 ? (
            <EmptyState
              icon="👨‍🍳"
              title={search ? "No matches found" : "No menu items yet"}
              description={
                search
                  ? `No items match "${search}". Try a different search.`
                  : "Create categories first, then add your first menu item to get started."
              }
              actionLabel={!search ? "Add Your First Item" : null}
              onAction={() => { setEditItem(null); setShowItemModal(true); }}
            />
          ) : (
            Object.entries(grouped).map(([catName, catItems]) => {
              const catData = categories.find(c => c.name === catName);
              return (
                <div key={catName} style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    {catData?.icon || "🍽️"} {catName}
                    <span style={{ opacity: 0.5, fontSize: 14 }}>({catItems.length})</span>
                  </h3>
                  <div className="menu-items-grid">
                    {catItems.map(item => (
                      <ItemCard
                        key={item._id}
                        item={item}
                        onEdit={() => { setEditItem(item); setShowItemModal(true); }}
                        onDelete={() => handleDelete(item)}
                        onToggleAvail={() => handleToggleAvail(item)}
                        onToggleSpecial={() => handleToggleSpecial(item)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* ============================================
          CATEGORIES VIEW
      ============================================ */}
      {activeView === "categories" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button
              className="gold-btn"
              onClick={() => { setEditCategory(null); setShowCatModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> Add Category
            </button>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              icon="🏷️"
              title="No categories yet"
              description="Create categories like 'Momo', 'Beverages', or 'Snacks' to organize your menu items."
              actionLabel="Add Your First Category"
              onAction={() => { setEditCategory(null); setShowCatModal(true); }}
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {categories.map(cat => {
                const itemCount = items.filter(i => i.category === cat.name).length;
                return (
                  <div key={cat._id} className="glass-card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>{cat.icon}</div>
                        <h3 style={{ margin: 0 }}>{cat.name}</h3>
                        <small style={{ opacity: 0.6 }}>{itemCount} items</small>
                      </div>
                    </div>

                    {cat.subcategories?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8, marginBottom: 12 }}>
                        {cat.subcategories.map((sub, i) => (
                          <span key={i} style={{
                            background: "var(--bg-sidebar)",
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 11
                          }}>
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setEditCategory(cat); setShowCatModal(true); }}
                        style={smallBtnStyle}
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCat(cat)}
                        style={{ ...smallBtnStyle, color: "#e53935" }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {showItemModal && (
        <ItemModal
          item={editItem}
          categories={categories}
          onClose={() => { setShowItemModal(false); setEditItem(null); }}
          onSuccess={() => {
            showSuccess(editItem ? `${editItem.name} updated` : "New item created");
            setShowItemModal(false);
            setEditItem(null);
            loadAll();
          }}
        />
      )}

      {showCatModal && (
        <CategoryModal
          category={editCategory}
          onClose={() => { setShowCatModal(false); setEditCategory(null); }}
          onSuccess={() => {
            showSuccess(editCategory ? `${editCategory.name} updated` : "New category created");
            setShowCatModal(false);
            setEditCategory(null);
            loadAll();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// ITEM CARD
// ============================================================
function ItemCard({ item, onEdit, onDelete, onToggleAvail, onToggleSpecial }) {
  const priceDisplay = item.hasVariants && item.variantGroups?.length > 0
    ? `From NPR ${Math.min(...item.variantGroups[0].options.map(o => o.price))}`
    : `NPR ${item.price}`;

  return (
    <div className={`menu-item-card glass-card ${!item.isAvailable ? "unavailable" : ""}`}>
      <div className="menu-item-info">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <strong>{item.name}</strong>
          {item.isTodaysSpecial && <Star size={14} fill="#d4af37" color="#d4af37" />}
          {item.hasVariants && (
            <span style={{
              background: "#2196f322",
              color: "#2196f3",
              padding: "1px 6px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700
            }}>
              VARIANTS
            </span>
          )}
        </div>
        <span className="item-price">{priceDisplay}</span>
        {item.description && <small>{item.description}</small>}
        {item.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {item.tags.map((tag, i) => (
              <span key={i} style={{
                background: "var(--bg-sidebar)",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="menu-item-actions">
        <span className={`avail-badge ${item.isAvailable ? "avail" : "unavail"}`}>
          {item.isAvailable ? "Available" : "Unavailable"}
        </span>

        <button onClick={onToggleSpecial} title="Toggle today's special">
          {item.isTodaysSpecial ? "★ Remove Special" : "☆ Mark Special"}
        </button>

        <button onClick={onToggleAvail}>
          {item.isAvailable ? <EyeOff size={12} /> : <Eye size={12} />}
          {item.isAvailable ? "Disable" : "Enable"}
        </button>

        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete} style={{ color: "#e53935" }}>Delete</button>
      </div>
    </div>
  );
}

// ============================================================
// ITEM MODAL — with variant builder
// ============================================================
function ItemModal({ item, categories, onClose, onSuccess }) {
  const isEdit = !!item;

  const [form, setForm] = useState({
    name:        item?.name        || "",
    category:    item?.category    || (categories[0]?.name || ""),
    description: item?.description || "",
    price:       item?.price       || "",
    isAvailable: item?.isAvailable ?? true,
    isTodaysSpecial: item?.isTodaysSpecial ?? false,
    hasVariants: item?.hasVariants ?? false,
    variantGroups: item?.variantGroups || [],
    tags:        (item?.tags || []).join(", ")
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Variant group helpers
  const addGroup = () => {
    setForm({
      ...form,
      variantGroups: [...form.variantGroups, { name: "", required: true, options: [{ name: "", price: 0 }] }]
    });
  };

  const updateGroup = (gIdx, field, value) => {
    const groups = [...form.variantGroups];
    groups[gIdx][field] = value;
    setForm({ ...form, variantGroups: groups });
  };

  const removeGroup = (gIdx) => {
    setForm({ ...form, variantGroups: form.variantGroups.filter((_, i) => i !== gIdx) });
  };

  const addOption = (gIdx) => {
    const groups = [...form.variantGroups];
    groups[gIdx].options.push({ name: "", price: 0 });
    setForm({ ...form, variantGroups: groups });
  };

  const updateOption = (gIdx, oIdx, field, value) => {
    const groups = [...form.variantGroups];
    groups[gIdx].options[oIdx][field] = field === "price" ? Number(value) : value;
    setForm({ ...form, variantGroups: groups });
  };

  const removeOption = (gIdx, oIdx) => {
    const groups = [...form.variantGroups];
    groups[gIdx].options = groups[gIdx].options.filter((_, i) => i !== oIdx);
    setForm({ ...form, variantGroups: groups });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name required");
    if (!form.category) return setError("Category required");
    if (!form.hasVariants && !form.price) return setError("Price required");

    if (form.hasVariants) {
      if (form.variantGroups.length === 0) return setError("Add at least one variant group");
      for (const g of form.variantGroups) {
        if (!g.name) return setError("Variant group name required");
        if (g.options.length === 0) return setError(`Add options for "${g.name}"`);
        for (const o of g.options) {
          if (!o.name || !o.price) return setError(`Fill all options in "${g.name}"`);
        }
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        price: form.hasVariants
          ? Math.min(...form.variantGroups[0].options.map(o => o.price))
          : Number(form.price),
        isAvailable: form.isAvailable,
        isTodaysSpecial: form.isTodaysSpecial,
        hasVariants: form.hasVariants,
        variantGroups: form.hasVariants ? form.variantGroups : [],
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean)
      };

      if (isEdit) {
        await api.put(`/menu/item/${item._id}`, payload);
      } else {
        await api.post("/menu/item", payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settlement-overlay">
      <form onSubmit={handleSubmit} className="settlement-modal glass-card" style={{ maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}>
        <div className="settlement-header">
          <h2>{isEdit ? `Edit: ${item.name}` : "Add Menu Item"}</h2>
          <button type="button" className="settlement-close" onClick={onClose}>✕</button>
        </div>

        {error && <div style={errorStyle}>⚠️ {error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Name *">
            <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>

          <Field label="Category *">
            <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">-- Select --</option>
              {categories.map(c => (
                <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <Field label="Description (optional)">
            <textarea
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <Field label="Tags (comma-separated)">
            <input
              style={inputStyle}
              placeholder="popular, spicy, new"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />
          </Field>
        </div>

        {/* HAS VARIANTS TOGGLE */}
        <div className="glass-card" style={{ padding: 14, marginTop: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.hasVariants}
              onChange={e => setForm({ ...form, hasVariants: e.target.checked })}
            />
            <div>
              <strong>This item has variants</strong>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                e.g. Momo with type (Chicken/Buff) and style (Steam/Jhol)
              </div>
            </div>
          </label>
        </div>

        {/* SIMPLE PRICE (no variants) */}
        {!form.hasVariants && (
          <div style={{ marginTop: 12 }}>
            <Field label="Price NPR *">
              <input
                type="number"
                style={inputStyle}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </Field>
          </div>
        )}

        {/* VARIANT BUILDER */}
        {form.hasVariants && (
          <div className="glass-card" style={{ padding: 14, marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong>Variant Groups</strong>
              <button type="button" onClick={addGroup} style={smallBtnStyle}>
                <Plus size={12} /> Add Group
              </button>
            </div>

            {form.variantGroups.length === 0 && (
              <p style={{ opacity: 0.6, fontSize: 13, textAlign: "center", padding: 16 }}>
                Click "Add Group" to start. Example: Type (Chicken, Buff) and Style (Steam, Jhol).
              </p>
            )}

            {form.variantGroups.map((group, gIdx) => (
              <div key={gIdx} style={{
                padding: 12,
                background: "var(--bg-sidebar)",
                borderRadius: 10,
                marginBottom: 10
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <input
                    placeholder="Group name (e.g. Type, Size, Style)"
                    value={group.name}
                    onChange={e => updateGroup(gIdx, "name", e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={group.required}
                      onChange={e => updateGroup(gIdx, "required", e.target.checked)}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeGroup(gIdx)}
                    style={{ background: "transparent", border: "none", color: "#e53935", cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {group.options.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input
                      placeholder="Option name (e.g. Chicken)"
                      value={opt.name}
                      onChange={e => updateOption(gIdx, oIdx, "name", e.target.value)}
                      style={{ ...inputStyle, flex: 2 }}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={opt.price}
                      onChange={e => updateOption(gIdx, oIdx, "price", e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(gIdx, oIdx)}
                      style={{ background: "transparent", border: "none", color: "#e53935", cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addOption(gIdx)}
                  style={{ ...smallBtnStyle, marginTop: 4 }}
                >
                  <Plus size={12} /> Add Option
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STATUS TOGGLES */}
        <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
            />
            Available for ordering
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.isTodaysSpecial}
              onChange={e => setForm({ ...form, isTodaysSpecial: e.target.checked })}
            />
            ⭐ Today's Special
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12 }}>Cancel</button>
          <button type="submit" className="gold-btn" disabled={loading} style={{ flex: 2, padding: 12 }}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// CATEGORY MODAL
// ============================================================
function CategoryModal({ category, onClose, onSuccess }) {
  const isEdit = !!category;

  const [form, setForm] = useState({
    name:          category?.name          || "",
    icon:          category?.icon          || "🍽️",
    description:   category?.description   || "",
    subcategories: (category?.subcategories || []).join(", ")
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name required");

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        icon: form.icon,
        description: form.description,
        subcategories: form.subcategories.split(",").map(s => s.trim()).filter(Boolean)
      };

      if (isEdit) {
        await api.put(`/menu/categories/${category._id}`, payload);
      } else {
        await api.post("/menu/categories", payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const commonIcons = ["🍽️","☕","🍵","🥤","🍔","🍕","🍝","🥗","🍰","🥐","🍦","🍜","🥟","⭐","🍛","🌮"];

  return (
    <div className="settlement-overlay">
      <form onSubmit={handleSubmit} className="settlement-modal glass-card" style={{ maxWidth: 460 }}>
        <div className="settlement-header">
          <h2>{isEdit ? `Edit: ${category.name}` : "Add Category"}</h2>
          <button type="button" className="settlement-close" onClick={onClose}>✕</button>
        </div>

        {error && <div style={errorStyle}>⚠️ {error}</div>}

        <Field label="Name *">
          <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Momo" />
        </Field>

        <div style={{ marginTop: 12 }}>
          <Field label="Icon">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {commonIcons.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  style={{
                    padding: "4px 8px",
                    fontSize: 18,
                    border: form.icon === ic ? "2px solid #d4af37" : "1px solid var(--border-soft)",
                    borderRadius: 6,
                    background: "var(--bg-card)",
                    cursor: "pointer"
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
            <input style={inputStyle} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <Field label="Subcategories (comma-separated, optional)">
            <input
              style={inputStyle}
              placeholder="Steam, Jhol, Sadeko, Fried"
              value={form.subcategories}
              onChange={e => setForm({ ...form, subcategories: e.target.value })}
            />
            <small style={{ opacity: 0.6, fontSize: 12, marginTop: 4, display: "block" }}>
              Used for grouping items visually. Example: Momo category with Steam/Jhol/Sadeko subcategories.
            </small>
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12 }}>Cancel</button>
          <button type="submit" className="gold-btn" disabled={loading} style={{ flex: 2, padding: 12 }}>
            {loading ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// SHARED
// ============================================================
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
  fontSize: 14,
  fontFamily: "inherit"
};

const btnStyle = (active) => ({
  padding: "8px 16px",
  borderRadius: 10,
  border: active ? "none" : "1px solid var(--border-soft)",
  background: active ? "var(--primary-gold)" : "var(--bg-card)",
  color: active ? "white" : "var(--text-primary)",
  cursor: "pointer",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13
});

const smallBtnStyle = {
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
  gap: 4
};

const searchIconStyle = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  opacity: 0.5
};

const errorStyle = {
  background: "#e5393522",
  color: "#e53935",
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  fontSize: 13
};