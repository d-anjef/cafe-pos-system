import { useState } from "react";

const CATEGORIES = [
  "All",
  "Beverages",
  "Snacks",
  "Meals",
  "Desserts",
  "General"
];

const MenuGrid = ({ items, cart, setCart, disabled }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const getQuantity = (id) => {
    const item = cart.find(i => i._id === id);
    return item ? item.quantity : 0;
  };

  const addItem = (item) => {
    if (disabled || !item.isAvailable) return; // Prevent adding unavailable items

    const exists = cart.find(i => i._id === item._id);
    if (exists) {
      setCart(cart.map(i =>
        i._id === item._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const filtered = items.filter(item => {
    const matchCategory =
      activeCategory === "All" ||
      item.category === activeCategory;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="menu-section-inner">

      {/* SEARCH BAR */}
      <div className="menu-search">
        <input
          type="text"
          placeholder="🔍 Search menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* CATEGORY FILTER */}
      <div className="category-filter">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MENU GRID */}
      {filtered.length === 0 ? (
        <div className="menu-empty">
          No items found. Try a different category or search term.
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map(item => (
            <div
              key={item._id}
              className={`menu-card ${disabled ? "disabled" : ""} ${!item.isAvailable ? "unavailable" : ""}`}
              onClick={() => item.isAvailable && addItem(item)}
            >
              <div className="menu-card-category">
                {item.category}
              </div>
              <h4>{item.name}</h4>
              <p>₹ {item.price}</p>
              {getQuantity(item._id) > 0 && (
                <div className="item-qty-badge">
                  {getQuantity(item._id)}
                </div>
              )}
              {!item.isAvailable && (
                <div className="unavail-overlay">
                  Unavailable
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuGrid;