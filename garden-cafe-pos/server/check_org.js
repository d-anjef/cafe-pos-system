require("dotenv").config();
const mongoose = require("mongoose");
const Organization = require("./models/Organization");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  
  const orgs = await Organization.find().select("name subscription.plan features");
  
  console.log("\n📊 Organization Status:\n");
  orgs.forEach(org => {
    console.log(`${org.name}`);
    console.log(`  Plan: ${org.subscription?.plan}`);
    console.log(`  QR Ordering: ${org.features?.qrOrdering}`);
    console.log(`  PDF Receipts: ${org.features?.pdfReceipts}`);
    console.log("");
  });
  
  process.exit(0);
})();