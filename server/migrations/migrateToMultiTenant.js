const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('📊 ALL COLLECTIONS IN DATABASE:\n');
    console.log('═══════════════════════════════════════\n');

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📁 ${collection.name}: ${count} documents`);
      
      // Show sample document
      if (count > 0) {
        const sample = await db.collection(collection.name).findOne();
        console.log(`   Sample: ${JSON.stringify(sample).substring(0, 100)}...`);
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();