require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(URI).then(async () => {
  console.log("✅ Connected to MongoDB\n");

  const collections = ["orders", "tables", "menuitems"];

  for (const collectionName of collections) {
    console.log(`\n📦 ${collectionName.toUpperCase()}`);
    console.log("─".repeat(50));

    try {
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();

      console.log("Current indexes:");
      indexes.forEach(idx => {
        const keys = Object.keys(idx.key).join(", ");
        console.log(`  • ${idx.name}: { ${keys} }${idx.unique ? " UNIQUE" : ""}`);
      });

      // Drop problematic indexes (keep only _id_)
      let dropped = 0;
      for (const idx of indexes) {
        if (idx.name === "_id_") continue;

        try {
          await collection.dropIndex(idx.name);
          console.log(`  🗑️ Dropped: ${idx.name}`);
          dropped++;
        } catch (err) {
          console.log(`  ⚠️ Could not drop ${idx.name}: ${err.message}`);
        }
      }

      console.log(`✅ ${dropped} indexes dropped from ${collectionName}`);
    } catch (err) {
      console.log(`⚠️ Collection ${collectionName} doesn't exist yet (OK)`);
    }
  }

  console.log("\n═════════════════════════════════════════════");
  console.log("✅ All bad indexes dropped");
  console.log("Mongoose will recreate correct indexes on next save");
  console.log("═════════════════════════════════════════════\n");

  process.exit(0);
}).catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});