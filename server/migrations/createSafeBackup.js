const mongoose = require('mongoose');
require('dotenv').config();

const createBackup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log('📦 Creating safety backup...\n');

    const collections = ['users', 'tables', 'menuitems', 'orders', 'payments'];

    for (const collectionName of collections) {
      try {
        const exists = await db.listCollections({ name: collectionName }).hasNext();
        
        if (exists) {
          const count = await db.collection(collectionName).countDocuments();
          const backupName = `${collectionName}_backup_${timestamp}`;
          
          // Create backup by copying
          const docs = await db.collection(collectionName).find().toArray();
          await db.collection(backupName).insertMany(docs);
          
          console.log(`✅ Backed up ${collectionName} → ${backupName} (${count} docs)`);
        }
      } catch (error) {
        console.error(`⚠️  Error backing up ${collectionName}:`, error.message);
      }
    }

    console.log('\n🎉 Backup complete! Your data is safe.\n');
    console.log('📋 You can now safely run the migration.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createBackup();