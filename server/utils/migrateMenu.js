const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const Organization = require("../models/Organization");

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const CATEGORY_ICONS = {
  coffee: "☕",
  tea: "🍵",
  beverages: "🥤",
  appetizers: "🥗",
  "main-course": "🍛",
  meals: "🍽️",
  sides: "🍟",
  desserts: "🍰",
  pastries: "🥐",
  specials: "⭐"
};

async function migrate() {
  console.log("Migrating menu...");

  const orgs = await Organization.find();

  for (const org of orgs) {
    console.log(`\nOrg: ${org.name}`);

    // Get all unique categories used by this org's menu items
    const items = await MenuItem.find({ organization: org._id });
    const uniqueCategories = [...new Set(items.map(i => i.category))];

    // Create categories
    for (const catName of uniqueCategories) {
      const displayName = catName.charAt(0).toUpperCase() + catName.slice(1).replace("-", " ");

      try {
        await Category.create({
          organization: org._id,
          name: displayName,
          icon: CATEGORY_ICONS[catName] || "🍽️"
        });
        console.log(`  ✅ Created category: ${displayName}`);
      } catch (e) {
        if (e.code === 11000) {
          console.log(`  ⏭️  Already exists: ${displayName}`);
        }
      }

      // Update menu items to use display name
      await MenuItem.updateMany(
        { organization: org._id, category: catName },
        { category: displayName }
      );
    }
  }

  console.log("\n✅ Migration complete");
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});