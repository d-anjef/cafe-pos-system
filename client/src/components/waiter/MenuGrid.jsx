import { useState, useEffect } from "react";
import api from "../../services/api";
import { Star, Search, X } from "lucide-react";

const MenuGrid = ({ items, cart, setCart, disabled }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [variantItem, setVariantItem] = useState(null);

  // Load categories
  useEffect(() => {
    api.get("/menu/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  // Cart helpers
  const getQuantity = (cartId) => {
    const item = cart.find(i => i.cartId === cartId);
    return item ? item.quantity : 0;
  };

  const getItemTotalQty = (menuItemId) => {
    return cart
      .filter(i => i.menuItemId === menuItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const addSimpleItem = (item) => {
    if (disabled || !item.isAvailable) return;

    // For simple items (no variants), use _id as cartId
    const cartId = item._id;
    const exists = cart.find(i => i.cartId === cartId);

    if (exists) {
      setCart(cart.map(i =>
        i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, {
        cartId,
        menuItemId: item._id,
        _id: item._id,
        name: item.name,
        displayName: item.name,
        price: item.price,
        quantity: 1,
        variants: null
      }]);
    }
  };

  const handleItemClick = (item) => {
    if (disabled || !item.isAvailable) return;

    if (item.hasVariants && item.variantGroups?.length > 0) {
      setVariantItem(item);
    } else {
      addSimpleItem(item);
    }
  };

  const addVariantItem = (item, selectedVariants) => {
    // Build display name: "Chicken Jhol Momo"
    const variantNames = selectedVariants.map(v => v.option.name);
    const displayName = `${variantNames.join(" ")} ${item.name}`;

    // Calculate price (use last variant's price as final, or sum)
    // For your "Option Y" — admin sets full price per option
    // We'll use the LAST selected variant's price as the final price
    // OR you can sum all variant prices
    const finalPrice = selectedVariants[selectedVariants.length - 1].option.price;

    // Unique cartId per variant combo
    const variantKey = selectedVariants.map(v => v.option._id || v.option.name).join("|");
    const cartId = `${item._id}::${variantKey}`;

    const exists = cart.find(i => i.cartId === cartId);

    if (exists) {
      setCart(cart.map(i =>
        i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, {
        cartId,
        menuItemId: item._id,
        _id: item._id,
        name: item.name,
        displayName,
        price: finalPrice,
        quantity: 1,
        variants: selectedVariants.map(v => ({
          groupName: v.group.name,
          optionName: v.option.name,
          optionPrice: v.option.price
        }))
      }]);
    }

    setVariantItem(null);
  };

  // Filter logic
  const todaysSpecials = items.filter(i => i.isTodaysSpecial && i.isAvailable);

  const filtered = items.filter(item => {
    if (activeCategory === "⭐ Today's Special") {
      return item.isTodaysSpecial;
    }
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Build category list
  const categoryButtons = [
    { name: "All", icon: "📋" },
    ...(todaysSpecials.length > 0
      ? [{ name: "⭐ Today's Special", icon: "⭐" }]
      : []),
    ...categories.map(c => ({ name: c.name, icon: c.icon }))
  ];

  return (
    <div className="menu-section-inner">

      {/* SEARCH */}
      <div className="menu-search" style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
        {search && <button onClick={() => setSearch("")}>✕</button>}
      </div>

      {/* CATEGORIES */}
      <div className="category-filter">
        {categoryButtons.map(cat => (
          <button
            key={cat.name}
            className={`category-filter-btn ${activeCategory === cat.name ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.name)}
            style={cat.name === "⭐ Today's Special" && activeCategory !== cat.name ? {
              borderColor: "#d4af37",
              color: "#d4af37"
            } : {}}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="menu-empty">
          No items found.
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map(item => {
            const totalQty = getItemTotalQty(item._id);
            const hasVariants = item.hasVariants && item.variantGroups?.length > 0;
            const priceDisplay = hasVariants
              ? `From NPR ${Math.min(...item.variantGroups[0].options.map(o => o.price))}`
              : `NPR ${item.price}`;

            return (
              <div
                key={item._id}
                className={`menu-card ${disabled ? "disabled" : ""} ${!item.isAvailable ? "unavailable" : ""}`}
                onClick={() => handleItemClick(item)}
                style={item.isTodaysSpecial ? { border: "2px solid #d4af37" } : {}}
              >
                {item.isTodaysSpecial && (
                  <div style={{
                    position: "absolute",
                    top: 6, left: 6,
                    background: "#d4af37",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 3
                  }}>
                    <Star size={9} fill="white" /> SPECIAL
                  </div>
                )}

                {hasVariants && (
                  <div style={{
                    position: "absolute",
                    top: 6, right: 6,
                    background: "#2196f3",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700
                  }}>
                    OPTIONS
                  </div>
                )}

                <div className="menu-card-category">
                  {item.category}
                </div>
                <h4>{item.name}</h4>
                <p>{priceDisplay}</p>

                {totalQty > 0 && (
                  <div className="item-qty-badge">
                    {totalQty}
                  </div>
                )}

                {!item.isAvailable && (
                  <div className="unavail-overlay">
                    Unavailable
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VARIANT PICKER MODAL */}
      {variantItem && (
        <VariantPicker
          item={variantItem}
          onClose={() => setVariantItem(null)}
          onConfirm={(selections) => addVariantItem(variantItem, selections)}
        />
      )}
    </div>
  );
};

// ============================================================
// VARIANT PICKER MODAL
// ============================================================
function VariantPicker({ item, onClose, onConfirm }) {
  const [selections, setSelections] = useState({});

  const handleSelect = (groupIdx, option) => {
    setSelections({ ...selections, [groupIdx]: option });
  };

  const allRequiredSelected = item.variantGroups.every((group, idx) => {
    if (group.required) return selections[idx];
    return true;
  });

  const handleConfirm = () => {
    if (!allRequiredSelected) return;

    const result = item.variantGroups
      .map((group, idx) => {
        const option = selections[idx];
        if (!option) return null;
        return { group, option };
      })
      .filter(Boolean);

    onConfirm(result);
  };

  // Calculate live preview price
  const lastSelected = item.variantGroups
    .map((group, idx) => selections[idx])
    .filter(Boolean)
    .pop();

  const previewPrice = lastSelected?.price || item.price;

  // Build live preview name
  const previewName = item.variantGroups
    .map((g, idx) => selections[idx]?.name)
    .filter(Boolean)
    .join(" ");

  return (
    <div className="settlement-overlay" onClick={onClose}>
      <div
        className="settlement-modal glass-card"
        style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="settlement-header">
          <h2>Customize {item.name}</h2>
          <button className="settlement-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {item.description && (
          <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
            {item.description}
          </p>
        )}

        {/* VARIANT GROUPS */}
        {item.variantGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>
                {group.name}
                {group.required && <span style={{ color: "#e53935" }}> *</span>}
              </strong>
              {selections[gIdx] && (
                <small style={{ color: "#4caf50" }}>
                  ✓ {selections[gIdx].name}
                </small>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
              {group.options.map((opt, oIdx) => {
                const isSelected = selections[gIdx]?.name === opt.name;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(gIdx, opt)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: isSelected
                        ? "2px solid #d4af37"
                        : "1px solid var(--border-soft)",
                      background: isSelected
                        ? "rgba(212, 175, 55, 0.15)"
                        : "var(--bg-card)",
                      cursor: "pointer",
                      fontWeight: isSelected ? 700 : 500,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      textAlign: "center"
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{opt.name}</span>
                    <span style={{ fontSize: 12, color: "#d4af37", fontWeight: 700 }}>
                      NPR {opt.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* PREVIEW */}
        {previewName && (
          <div style={{
            padding: 14,
            background: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 10,
            marginBottom: 16
          }}>
            <small style={{ opacity: 0.7 }}>You're ordering:</small>
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              {previewName} {item.name}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#d4af37", marginTop: 4 }}>
              NPR {previewPrice}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12 }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allRequiredSelected}
            className="gold-btn"
            style={{
              flex: 2,
              padding: 12,
              opacity: allRequiredSelected ? 1 : 0.5,
              cursor: allRequiredSelected ? "pointer" : "not-allowed"
            }}
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuGrid;