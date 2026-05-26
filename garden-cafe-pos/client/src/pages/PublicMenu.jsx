import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  ShoppingCart, X, Plus, Minus,
  Star, Send, CheckCircle
} from "lucide-react";
import axios from "axios";

// ── Public axios — NO auth header ────────────────────────────
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// ── Spin keyframe injected once ──────────────────────────────
if (!document.getElementById("public-menu-styles")) {
  const style = document.createElement("style");
  style.id = "public-menu-styles";
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .public-menu-wrapper * { box-sizing: border-box; }
  `;
  document.head.appendChild(style);
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PublicMenu() {
  const { branchId, tableId } = useParams();

  const [menuData,           setMenuData]           = useState(null);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState(null);
  const [activeCategory,     setActive]             = useState("All");
  const [search,             setSearch]             = useState("");
  const [cart,               setCart]               = useState([]);
  const [cartOpen,           setCartOpen]           = useState(false);
  const [variantItem,        setVariantItem]        = useState(null);
  const [orderPlaced,        setOrderPlaced]        = useState(false);
  const [orderNumber,        setOrderNumber]        = useState(null);
  const [orderTypeResult,    setOrderTypeResult]    = useState(null);
  const [placing,            setPlacing]            = useState(false);
  const [customerNote,       setCustomerNote]       = useState("");
  const [tableSelectorOpen,  setTableSelectorOpen]  = useState(false);
  const [selectedTable,      setSelectedTable]      = useState(null);

  // ── Is this a walk-in QR (no specific table)? ───────────
  const isWalkIn = !tableId || tableId === "walk-in";

  // ── Fetch menu ───────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    try {
      const res = await publicApi.get(`/public/menu/${branchId}`);
      setMenuData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchMenu();
    // Auto-refresh menu every 2 minutes
    const interval = setInterval(fetchMenu, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMenu]);

  // ── Cart helpers ─────────────────────────────────────────
  const getTotalQtyForItem = (menuItemId) =>
    cart
      .filter(i => i.menuItemId === menuItemId)
      .reduce((s, i) => s + i.quantity, 0);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addSimple = (item) => {
    const cartId = item._id;
    setCart(prev => {
      const exists = prev.find(i => i.cartId === cartId);
      if (exists) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        cartId,
        menuItemId:  item._id,
        name:        item.name,
        displayName: item.name,
        price:       item.price,
        quantity:    1,
        variants:    []
      }];
    });
  };

  const addVariant = (item, selections) => {
    const variantNames = selections.map(v => v.option.name);
    const displayName  = `${variantNames.join(" ")} ${item.name}`;
    const finalPrice   = selections[selections.length - 1].option.price;
    const variantKey   = selections.map(v => v.option.name).join("|");
    const cartId       = `${item._id}::${variantKey}`;

    setCart(prev => {
      const exists = prev.find(i => i.cartId === cartId);
      if (exists) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        cartId,
        menuItemId:  item._id,
        name:        item.name,
        displayName,
        price:       finalPrice,
        quantity:    1,
        variants:    selections.map(v => ({
          groupName:   v.group.name,
          optionName:  v.option.name,
          optionPrice: v.option.price
        }))
      }];
    });
    setVariantItem(null);
  };

  const updateQty = (cartId, delta) => {
    setCart(prev =>
      prev
        .map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const handleItemClick = (item) => {
    if (!item.isAvailable) return;
    if (item.hasVariants && item.variantGroups?.length > 0) {
      setVariantItem(item);
    } else {
      addSimple(item);
    }
  };

  // ── Submit order to backend ──────────────────────────────
  const submitOrder = async (tableToSend) => {
    setPlacing(true);
    try {
      const payload = {
        branchId,
        tableId: tableToSend,
        customerNote,
        items: cart.map(i => ({
          menuItemId: i.menuItemId,
          quantity:   i.quantity,
          variants:   i.variants,
          notes:      ""
        }))
      };

      const res = await publicApi.post("/public/orders", payload);
      setOrderNumber(res.data.orderNumber);
      setOrderTypeResult(res.data.orderType);
      setOrderPlaced(true);
      setCart([]);
      setCartOpen(false);
      setTableSelectorOpen(false);
      setCustomerNote("");
      setSelectedTable(null);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to place order. Please call a waiter."
      );
    } finally {
      setPlacing(false);
    }
  };

  // ── Place order trigger ──────────────────────────────────
  // Walk-in → opens table selector first
  // Table QR → submits immediately
  const placeOrder = () => {
    if (!cart.length || placing) return;

    if (isWalkIn) {
      // Need to know table or takeaway first
      setCartOpen(false);
      setTableSelectorOpen(true);
    } else {
      // Table already known from URL
      submitOrder(tableId);
    }
  };

  // ── Filter logic ─────────────────────────────────────────
  const items      = menuData?.items      || [];
  const categories = menuData?.categories || [];
  const specials   = items.filter(i => i.isTodaysSpecial);

  const categoryButtons = [
    { name: "All", icon: "📋" },
    ...(specials.length > 0 ? [{ name: "⭐ Today's Special", icon: "⭐" }] : []),
    ...categories.map(c => ({ name: c.name, icon: c.icon || "🍽️" }))
  ];

  const filtered = items.filter(item => {
    if (activeCategory === "⭐ Today's Special") return item.isTodaysSpecial;
    const matchCat    = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const org      = menuData?.org;
  const currency = org?.settings?.currency || "NPR";

  // ── Screens ──────────────────────────────────────────────
  if (loading) return <PublicLoader />;
  if (error)   return <PublicError message={error} />;

  if (orderPlaced) {
    return (
      <OrderSuccess
        orderNumber={orderNumber}
        orderType={orderTypeResult}
        onOrderMore={() => setOrderPlaced(false)}
      />
    );
  }

  // ── Main render ──────────────────────────────────────────
  return (
    <div className="public-menu-wrapper" style={S.wrapper}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div>
            <h1 style={S.orgName}>{org?.name}</h1>
            <p style={S.branchName}>
              {menuData?.branch?.name}
              {" · "}
              {isWalkIn
                ? "Walk-in"
                : `Table #${tableId.slice(-4).toUpperCase()}`}
            </p>
          </div>

          {/* Cart button */}
          <button
            style={{
              ...S.cartBtn,
              background: cartCount > 0
                ? "#d4af37"
                : "rgba(255,255,255,0.08)"
            }}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart size={20} color={cartCount > 0 ? "#000" : "#fff"} />
            {cartCount > 0 && (
              <span style={S.cartBadge}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── WALK-IN NOTICE ─────────────────────────────── */}
      {isWalkIn && (
        <div style={S.walkInNotice}>
          📍 Walk-in order — you'll choose your table at checkout
        </div>
      )}

      {/* ── SEARCH ─────────────────────────────────────── */}
      <div style={S.searchWrap}>
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={S.searchInput}
        />
      </div>

      {/* ── CATEGORIES ─────────────────────────────────── */}
      <div style={S.catScroll}>
        {categoryButtons.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActive(cat.name)}
            style={{
              ...S.catBtn,
              ...(activeCategory === cat.name ? S.catBtnActive : {})
            }}
          >
            <span style={{ fontSize: 20 }}>{cat.icon}</span>
            <span style={{ fontSize: 10, marginTop: 2 }}>
              {cat.name === "⭐ Today's Special" ? "Special" : cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* ── MENU GRID ──────────────────────────────────── */}
      <div style={S.grid}>
        {filtered.length === 0 ? (
          <div style={S.empty}>
            <p>No items found</p>
          </div>
        ) : (
          filtered.map(item => {
            const totalQty = getTotalQtyForItem(item._id);
            const hasVar   = item.hasVariants && item.variantGroups?.length > 0;
            const minPrice = hasVar
              ? Math.min(...item.variantGroups[0].options.map(o => o.price))
              : item.price;

            return (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                style={{
                  ...S.card,
                  ...(item.isTodaysSpecial
                    ? { borderColor: "#d4af37", borderWidth: 2 }
                    : {}),
                  ...(!item.isAvailable
                    ? { opacity: 0.5, cursor: "default" }
                    : { cursor: "pointer" })
                }}
              >
                {item.isTodaysSpecial && (
                  <div style={S.specialBadge}>
                    <Star size={9} fill="white" color="white" /> Special
                  </div>
                )}

                {hasVar && <div style={S.optionsBadge}>Options</div>}

                {totalQty > 0 && (
                  <div style={S.qtyBadge}>{totalQty}</div>
                )}

                <div style={S.cardCat}>{item.category}</div>
                <div style={S.cardName}>{item.name}</div>

                {item.description && (
                  <div style={S.cardDesc}>{item.description}</div>
                )}

                <div style={S.cardPrice}>
                  {hasVar ? "From " : ""}{currency} {minPrice}
                </div>

                {!item.isAvailable && (
                  <div style={S.unavailOverlay}>Unavailable</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── BOTTOM CART BAR ────────────────────────────── */}
      {cartCount > 0 && !cartOpen && !tableSelectorOpen && (
        <div style={S.cartBar} onClick={() => setCartOpen(true)}>
          <span style={{
            background: "rgba(0,0,0,0.2)",
            padding: "2px 10px",
            borderRadius: 20,
            fontWeight: 800
          }}>
            {cartCount}
          </span>
          <span>View Order</span>
          <span>{currency} {cartTotal}</span>
        </div>
      )}

      {/* ── CART DRAWER ────────────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          currency={currency}
          cartTotal={cartTotal}
          customerNote={customerNote}
          setCustomerNote={setCustomerNote}
          isWalkIn={isWalkIn}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onPlaceOrder={placeOrder}
          placing={placing}
        />
      )}

      {/* ── TABLE SELECTOR ─────────────────────────────── */}
      {tableSelectorOpen && (
        <TableSelector
          tables={menuData?.tables || []}
          placing={placing}
          onClose={() => setTableSelectorOpen(false)}
          onSelect={(tableValue) => {
            setSelectedTable(tableValue);
            submitOrder(tableValue);
          }}
        />
      )}

      {/* ── VARIANT PICKER ─────────────────────────────── */}
      {variantItem && (
        <PublicVariantPicker
          item={variantItem}
          currency={currency}
          onClose={() => setVariantItem(null)}
          onConfirm={(selections) => addVariant(variantItem, selections)}
        />
      )}
    </div>
  );
}

// ============================================================
// CART DRAWER
// ============================================================
function CartDrawer({
  cart, currency, cartTotal, customerNote,
  setCustomerNote, isWalkIn, onClose,
  onUpdateQty, onPlaceOrder, placing
}) {
  return (
    <div style={S.drawerOverlay} onClick={onClose}>
      <div style={S.drawer} onClick={e => e.stopPropagation()}>

        <div style={S.drawerHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Your Order</h2>
          <button onClick={onClose} style={S.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={S.drawerBody}>
          {cart.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.5, marginTop: 40 }}>
              Your cart is empty
            </p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.cartId} style={S.cartItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {item.displayName}
                    </div>
                    <div style={{
                      color: "#d4af37",
                      fontWeight: 700,
                      fontSize: 13,
                      marginTop: 2
                    }}>
                      {currency} {item.price}
                    </div>
                  </div>

                  <div style={S.qtyControls}>
                    <button
                      style={S.qtyBtn}
                      onClick={() => onUpdateQty(item.cartId, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{
                      width: 24,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 15
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      style={S.qtyBtn}
                      onClick={() => onUpdateQty(item.cartId, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <textarea
                placeholder="Any special requests? (optional)"
                value={customerNote}
                onChange={e => setCustomerNote(e.target.value)}
                style={S.noteInput}
                rows={2}
              />

              <div style={S.totalRow}>
                <span>Total</span>
                <span style={{
                  color: "#d4af37",
                  fontWeight: 800,
                  fontSize: 20
                }}>
                  {currency} {cartTotal}
                </span>
              </div>

              {isWalkIn && (
                <div style={{
                  background: "rgba(33,150,243,0.1)",
                  border: "1px solid rgba(33,150,243,0.2)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "#64b5f6",
                  marginBottom: 4
                }}>
                  📍 You'll choose your table next
                </div>
              )}

              <p style={{
                fontSize: 11,
                opacity: 0.4,
                textAlign: "center",
                margin: "8px 0 0"
              }}>
                Payment at the counter · Tax may apply
              </p>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div style={S.drawerFooter}>
            <button
              style={S.placeOrderBtn}
              onClick={onPlaceOrder}
              disabled={placing}
            >
              {placing ? (
                "Placing order..."
              ) : (
                <>
                  <Send size={16} />
                  {isWalkIn ? "Continue" : "Place Order"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TABLE SELECTOR
// Shown only for walk-in QR — customer picks table or takeaway
// ============================================================
function TableSelector({ tables, placing, onClose, onSelect }) {
  const availableTables = tables.filter(t =>
    t.status === "available" || t.status === "occupied"
  );

  return (
    <div style={S.drawerOverlay} onClick={onClose}>
      <div style={S.drawer} onClick={e => e.stopPropagation()}>

        <div style={S.drawerHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Where are you?</h2>
          <button onClick={onClose} style={S.closeBtn} disabled={placing}>
            <X size={20} />
          </button>
        </div>

        <div style={S.drawerBody}>
          <p style={{
            fontSize: 13,
            opacity: 0.6,
            marginBottom: 16,
            textAlign: "center"
          }}>
            Select your table or choose takeaway
          </p>

          {/* TAKEAWAY OPTION */}
          <button
            onClick={() => !placing && onSelect("takeaway")}
            disabled={placing}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: "1px solid rgba(33,150,243,0.3)",
              background: "rgba(33,150,243,0.08)",
              color: "white",
              cursor: placing ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              textAlign: "left",
              opacity: placing ? 0.6 : 1
            }}
          >
            <span style={{ fontSize: 28 }}>📦</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Takeaway</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                Pickup from counter
              </div>
            </div>
          </button>

          {/* DIVIDER */}
          {availableTables.length > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "16px 0",
              opacity: 0.4,
              fontSize: 11
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
              <span>OR PICK YOUR TABLE</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
            </div>
          )}

          {/* TABLE GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 10
          }}>
            {availableTables.map(table => {
              const isOccupied = table.status === "occupied";
              return (
                <button
                  key={table._id}
                  onClick={() => !placing && onSelect(table._id)}
                  disabled={placing}
                  style={{
                    padding: "16px 8px",
                    borderRadius: 12,
                    border: isOccupied
                      ? "1px solid rgba(255,193,7,0.3)"
                      : "1px solid rgba(76,175,80,0.3)",
                    background: isOccupied
                      ? "rgba(255,193,7,0.08)"
                      : "rgba(76,175,80,0.08)",
                    color: "white",
                    cursor: placing ? "wait" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    opacity: placing ? 0.6 : 1
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    {table.tableNumber}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>
                    {table.capacity} seats
                  </div>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: isOccupied ? "#ffc107" : "#4caf50",
                    marginTop: 2
                  }}>
                    {isOccupied ? "Occupied" : "Free"}
                  </div>
                </button>
              );
            })}
          </div>

          {availableTables.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: 20,
              opacity: 0.5,
              fontSize: 13
            }}>
              No tables available — please choose takeaway
            </div>
          )}

          {placing && (
            <div style={{
              textAlign: "center",
              marginTop: 20,
              color: "#d4af37",
              fontWeight: 600
            }}>
              Placing your order...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VARIANT PICKER
// ============================================================
function PublicVariantPicker({ item, currency, onClose, onConfirm }) {
  const [selections, setSelections] = useState({});

  const allSelected = item.variantGroups.every((g, idx) =>
    !g.required || selections[idx]
  );

  const lastSelected = item.variantGroups
    .map((g, idx) => selections[idx])
    .filter(Boolean)
    .pop();

  const previewPrice = lastSelected?.price ?? item.price;
  const previewName  = item.variantGroups
    .map((g, idx) => selections[idx]?.name)
    .filter(Boolean)
    .join(" ");

  const handleConfirm = () => {
    if (!allSelected) return;
    const result = item.variantGroups
      .map((group, idx) =>
        selections[idx] ? { group, option: selections[idx] } : null
      )
      .filter(Boolean);
    onConfirm(result);
  };

  return (
    <div style={S.drawerOverlay} onClick={onClose}>
      <div style={S.drawer} onClick={e => e.stopPropagation()}>

        <div style={S.drawerHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            Customize {item.name}
          </h2>
          <button onClick={onClose} style={S.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={S.drawerBody}>
          {item.variantGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>
                {group.name}
                {group.required && (
                  <span style={{ color: "#e53935" }}> *</span>
                )}
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8
              }}>
                {group.options.map((opt, oIdx) => {
                  const selected = selections[gIdx]?.name === opt.name;
                  return (
                    <button
                      key={oIdx}
                      onClick={() =>
                        setSelections(s => ({ ...s, [gIdx]: opt }))
                      }
                      style={{
                        padding: "12px 8px",
                        borderRadius: 12,
                        border: selected
                          ? "2px solid #d4af37"
                          : "1px solid rgba(255,255,255,0.15)",
                        background: selected
                          ? "rgba(212,175,55,0.15)"
                          : "rgba(255,255,255,0.05)",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <span style={{
                        fontSize: 13,
                        fontWeight: selected ? 700 : 500
                      }}>
                        {opt.name}
                      </span>
                      <span style={{
                        fontSize: 12,
                        color: "#d4af37",
                        fontWeight: 700
                      }}>
                        {currency} {opt.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {previewName && (
            <div style={{
              padding: 14,
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 12,
              marginTop: 8
            }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                You're ordering:
              </div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {previewName} {item.name}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#d4af37",
                marginTop: 4
              }}>
                {currency} {previewPrice}
              </div>
            </div>
          )}
        </div>

        <div style={S.drawerFooter}>
          <button
            style={{
              ...S.placeOrderBtn,
              opacity: allSelected ? 1 : 0.4,
              cursor: allSelected ? "pointer" : "not-allowed"
            }}
            onClick={handleConfirm}
            disabled={!allSelected}
          >
            <Plus size={16} /> Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ORDER SUCCESS SCREEN
// ============================================================
function OrderSuccess({ orderNumber, orderType, onOrderMore }) {
  const isTakeaway = orderType === "takeout";
  const isDineIn   = orderType === "dine-in";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      color: "white",
      textAlign: "center"
    }}>
      <div style={{
        width: 80, height: 80,
        borderRadius: "50%",
        background: "rgba(76,175,80,0.15)",
        border: "2px solid #4caf50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24
      }}>
        <CheckCircle size={40} color="#4caf50" />
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        Order Placed! 🎉
      </h1>
      <p style={{ opacity: 0.6, marginBottom: 24 }}>
        Your order has been sent to the kitchen
      </p>

      {orderNumber && (
        <div style={{
          background: "rgba(212,175,55,0.1)",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 16,
          padding: "16px 32px",
          marginBottom: 24
        }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
            Order Number
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#d4af37"
          }}>
            {orderNumber}
          </div>
        </div>
      )}

      <div style={{
        background: isTakeaway
          ? "rgba(33,150,243,0.1)"
          : "rgba(76,175,80,0.1)",
        border: isTakeaway
          ? "1px solid rgba(33,150,243,0.2)"
          : "1px solid rgba(76,175,80,0.2)",
        borderRadius: 12,
        padding: "12px 20px",
        marginBottom: 24,
        fontSize: 13,
        color: isTakeaway ? "#64b5f6" : "#81c784",
        maxWidth: 280
      }}>
        {isTakeaway && "📦 Please collect from the counter when ready"}
        {isDineIn && "🪑 Your order will be served to your table shortly"}
        {!isTakeaway && !isDineIn &&
          "📍 A waiter will be with you shortly"}
      </div>

      <button
        onClick={onOrderMore}
        style={{
          padding: "14px 32px",
          borderRadius: 12,
          border: "1px solid rgba(212,175,55,0.4)",
          background: "transparent",
          color: "#d4af37",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14
        }}
      >
        Order More Items
      </button>
    </div>
  );
}

// ============================================================
// HELPER SCREENS
// ============================================================
function PublicLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(212,175,55,0.3)",
          borderTopColor: "#d4af37",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }} />
        <p style={{ opacity: 0.6 }}>Loading menu...</p>
      </div>
    </div>
  );
}

function PublicError({ message }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      padding: 24
    }}>
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ marginBottom: 8 }}>Menu Unavailable</h2>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{message}</p>
        <p style={{ opacity: 0.4, fontSize: 12, marginTop: 16 }}>
          Please ask your waiter for assistance
        </p>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const S = {
  wrapper: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "white",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: 120
  },
  header: {
    background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
    borderBottom: "1px solid rgba(212,175,55,0.2)",
    padding: "16px 20px",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  headerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 600,
    margin: "0 auto"
  },
  orgName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#d4af37"
  },
  branchName: {
    margin: "4px 0 0",
    fontSize: 12,
    opacity: 0.6
  },
  cartBtn: {
    position: "relative",
    width: 44, height: 44,
    borderRadius: 12,
    border: "1px solid rgba(212,175,55,0.3)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    flexShrink: 0
  },
  cartBadge: {
    position: "absolute",
    top: -6, right: -6,
    background: "#e53935",
    color: "white",
    borderRadius: "50%",
    width: 18, height: 18,
    fontSize: 10,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  walkInNotice: {
    background: "rgba(33,150,243,0.08)",
    borderBottom: "1px solid rgba(33,150,243,0.15)",
    padding: "8px 20px",
    fontSize: 12,
    color: "#64b5f6",
    textAlign: "center"
  },
  searchWrap: {
    padding: "12px 16px 8px",
    maxWidth: 600,
    margin: "0 auto"
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: 14,
    outline: "none"
  },
  catScroll: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "4px 16px 12px",
    scrollbarWidth: "none",
    maxWidth: 600,
    margin: "0 auto"
  },
  catBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    minWidth: 60,
    transition: "all 0.2s",
    flexShrink: 0
  },
  catBtnActive: {
    border: "1px solid #d4af37",
    background: "rgba(212,175,55,0.15)",
    color: "#d4af37"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
    gap: 12,
    padding: "0 16px",
    maxWidth: 600,
    margin: "0 auto"
  },
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    transition: "all 0.2s",
    userSelect: "none"
  },
  specialBadge: {
    position: "absolute",
    top: 8, left: 8,
    background: "#d4af37",
    color: "#000",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 3
  },
  optionsBadge: {
    position: "absolute",
    top: 8, right: 8,
    background: "#2196f3",
    color: "white",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 700
  },
  qtyBadge: {
    position: "absolute",
    bottom: 8, right: 8,
    background: "#d4af37",
    color: "#000",
    borderRadius: "50%",
    width: 22, height: 22,
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardCat: {
    fontSize: 10,
    opacity: 0.45,
    marginBottom: 4,
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  cardName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
    lineHeight: 1.3
  },
  cardDesc: {
    fontSize: 11,
    opacity: 0.5,
    marginBottom: 6,
    lineHeight: 1.4
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: 800,
    color: "#d4af37",
    marginTop: 4
  },
  unavailOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)"
  },
  empty: {
    gridColumn: "1/-1",
    textAlign: "center",
    padding: 40,
    opacity: 0.4
  },
  cartBar: {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 32px)",
    maxWidth: 568,
    background: "#d4af37",
    color: "#000",
    borderRadius: 14,
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 700,
    cursor: "pointer",
    zIndex: 200,
    boxShadow: "0 8px 32px rgba(212,175,55,0.4)"
  },
  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 300,
    display: "flex",
    alignItems: "flex-end",
    backdropFilter: "blur(4px)"
  },
  drawer: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
    background: "#1a1a1a",
    borderRadius: "20px 20px 0 0",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column"
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  },
  drawerBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px"
  },
  drawerFooter: {
    padding: "16px 20px",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: 4,
    opacity: 0.7
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.07)"
  },
  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "4px 8px"
  },
  qtyBtn: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center"
  },
  noteInput: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: 13,
    resize: "none",
    outline: "none"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0 8px",
    fontWeight: 700,
    fontSize: 16
  },
  placeOrderBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #d4af37 0%, #f0cc55 100%)",
    color: "#000",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  }
};