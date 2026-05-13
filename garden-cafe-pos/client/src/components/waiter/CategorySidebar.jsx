const CategorySidebar = ({ categories, selectedCategory, setSelectedCategory }) => (
  <div className="category-sidebar glass-card">
    {categories.map(cat => (
      <button
        key={cat._id}
        className={`category-btn ${selectedCategory === cat._id ? "active" : ""}`}
        onClick={() => setSelectedCategory(cat._id)}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

export default CategorySidebar;