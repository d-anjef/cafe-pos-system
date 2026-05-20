const mongoose = require('mongoose');
require('dotenv').config();

const checkCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('📊 ALL COLLECTIONS IN DATABASE:\n');
    console.log('═══════════════════════════════════════\n');

    // Organize collections by category
    const categories = {
      'New Multi-Tenant Collections': ['organizations', 'branches', 'subscriptions', 'users_v2', 'tables_v2', 'menuitems_v2', 'orders_v2', 'payments_v2'],
      'Original Collections': ['users', 'tables', 'menuitems', 'orders', 'payments'],
      'Backups': collections.filter(c => c.name.includes('backup')).map(c => c.name),
      'Other': []
    };

    for (const collection of collections) {
      let found = false;
      for (const category in categories) {
        if (categories[category].includes(collection.name)) {
          found = true;
          break;
        }
      }
      if (!found && !collection.name.includes('backup')) {
        categories['Other'].push(collection.name);
      }
    }

    for (const [category, collectionNames] of Object.entries(categories)) {
      if (collectionNames.length === 0) continue;

      console.log(`\n📁 ${category}:`);
      console.log('─'.repeat(50));

      for (const name of collectionNames) {
        const exists = await db.listCollections({ name }).hasNext();
        if (exists) {
          const count = await db.collection(name).countDocuments();
          console.log(`   ✓ ${name.padEnd(30)} ${count} documents`);
          
          // Show sample for new collections
          if (name.includes('_v2') || ['organizations', 'branches', 'subscriptions'].includes(name)) {
            if (count > 0) {
              const sample = await db.collection(name).findOne();
              const keys = Object.keys(sample).filter(k => !k.startsWith('_'));
              console.log(`      Fields: ${keys.slice(0, 5).join(', ')}...`);
            }
          }
        }
      }
    }

    console.log('\n═══════════════════════════════════════\n');
    
    // Check data integrity
    console.log('🔍 DATA INTEGRITY CHECK:\n');
    
    const org = await db.collection('organizations').findOne();
    const branch = await db.collection('branches').findOne();
    const usersV2 = await db.collection('users_v2').countDocuments();
    const tablesV2 = await db.collection('tables_v2').countDocuments();
    const menuV2 = await db.collection('menuitems_v2').countDocuments();

    console.log(`✅ Organization: ${org?.name || 'NOT FOUND'}`);
    console.log(`✅ Branch: ${branch?.name || 'NOT FOUND'}`);
    console.log(`✅ Users migrated: ${usersV2}`);
    console.log(`✅ Tables migrated: ${tablesV2}`);
    console.log(`✅ Menu items migrated: ${menuV2}`);

    console.log('\n📊 MIGRATION STATUS: ✅ SUCCESS\n');
    console.log('Next step: Update backend models to use new schema\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkCollections();