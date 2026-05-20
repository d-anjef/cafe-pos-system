const mongoose = require('mongoose');
require('dotenv').config();

const switchToV2 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    console.log('🔄 Switching to V2 collections...\n');

    // Rename old to _old
    console.log('📦 Archiving old collections...');
    const oldCollections = ['users', 'tables', 'menuitems', 'orders', 'payments'];
    
    for (const col of oldCollections) {
      const exists = await db.listCollections({ name: col }).hasNext();
      if (exists) {
        await db.collection(col).rename(`${col}_old_production`);
        console.log(`✅ ${col} → ${col}_old_production`);
      }
    }

    // Rename v2 to production
    console.log('\n📝 Activating V2 collections...');
    const v2Collections = ['users_v2', 'tables_v2', 'menuitems_v2', 'orders_v2', 'payments_v2'];
    
    for (const col of v2Collections) {
      const exists = await db.listCollections({ name: col }).hasNext();
      if (exists) {
        const newName = col.replace('_v2', '');
        await db.collection(col).rename(newName);
        console.log(`✅ ${col} → ${newName}`);
      }
    }

    console.log('\n🎉 Switch complete! New collections are now live.\n');
    console.log('📋 Your old data is safely stored in *_old_production collections.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

switchToV2();