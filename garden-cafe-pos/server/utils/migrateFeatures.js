// ============================================================
// One-time migration: re-apply plan features to all orgs
// Run from server folder: node utils/migrateFeatures.js
// ============================================================

const path = require("path");

// ✅ Load .env from server/ folder (not wherever you ran from)
require("dotenv").config({
  path: path.join(__dirname, "..", ".env")
});

const mongoose = require("mongoose");
const Organization = require("../models/Organization");
const { applyPlanToOrg } = require("./planFeatures");

// ✅ Try common variable names
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI   ||
  process.env.DATABASE_URL;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error("❌ No MongoDB URI found in .env");
    console.error("   Expected one of: MONGODB_URI, MONGO_URI, DATABASE_URL");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
};

const migrate = async () => {
  await connectDB();

  const orgs = await Organization.find();
  console.log(`📦 Found ${orgs.length} organizations\n`);

  let updated = 0;

  for (const org of orgs) {
    const currentPlan = org.subscription?.plan || "free";
    const oldQR = org.features?.qrOrdering;

    try {
      applyPlanToOrg(org, currentPlan);
      await org.save();

      const newQR = org.features.qrOrdering;
      console.log(
        `✓ ${org.name.padEnd(30)} | ${currentPlan.padEnd(12)} | QR: ${oldQR} → ${newQR}`
      );
      updated++;
    } catch (err) {
      console.error(`✗ ${org.name}: ${err.message}`);
    }
  }

  console.log(`\n✅ Migrated ${updated}/${orgs.length} organizations`);
  console.log(`💡 All Starter+ plans now have QR ordering enabled`);

  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch(err => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});