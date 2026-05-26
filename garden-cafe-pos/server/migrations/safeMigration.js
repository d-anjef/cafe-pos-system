const mongoose = require('mongoose');
require('dotenv').config();

// Clear any cached models
mongoose.models = {};
mongoose.modelSchemas = {};

const safeMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Fetch existing data
    console.log('📊 Reading existing data...\n');
    
    const oldUsers = await db.collection('users').find().toArray();
    const oldTables = await db.collection('tables').find().toArray();
    const oldMenuItems = await db.collection('menuitems').find().toArray();
    const oldOrders = await db.collection('orders').find().toArray();
    const oldPayments = await db.collection('payments').find().toArray();

    console.log(`   Users: ${oldUsers.length}`);
    console.log(`   Tables: ${oldTables.length}`);
    console.log(`   Menu Items: ${oldMenuItems.length}`);
    console.log(`   Orders: ${oldOrders.length}`);
    console.log(`   Payments: ${oldPayments.length}\n`);

    // Create organization
    console.log('📊 Creating organization...');
    const adminUser = oldUsers.find(u => u.role === 'admin');
    
    const organizationDoc = {
      name: 'Garden & Cafe',
      slug: 'garden-cafe',
      owner: null, // Will update after users
      logo: null,
      brandColor: {
        primary: '#d4af37',
        secondary: '#1a1a1a'
      },
      subscription: {
        plan: 'business',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paymentMethod: 'manual'
      },
      limits: {
        branches: 10,
        tables: 1000,
        staff: 100,
        menuItems: 500,
        analyticsRetention: 365
      },
      features: {
        pdfReceipts: true,
        qrOrdering: true,
        customBranding: true,
        apiAccess: false,
        prioritySupport: true,
        multiCurrency: false,
        inventory: true,
        employeeMetrics: true
      },
      settings: {
        currency: 'NPR',
        timezone: 'Asia/Kathmandu',
        language: 'en',
        taxRate: 13,
        serviceCharge: 10
      },
      contactInfo: {
        email: adminUser?.email || 'admin@gardencafe.com',
        phone: '+977-1-4123456',
        address: 'Thamel, Kathmandu, Nepal'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orgResult = await db.collection('organizations').insertOne(organizationDoc);
    const organizationId = orgResult.insertedId;
    console.log(`✅ Organization created: ${organizationId}\n`);

    // Create branch
    console.log('📊 Creating branch...');
    const branchDoc = {
      organization: organizationId,
      name: 'Main Branch',
      code: 'GAR-BR001',
      location: {
        address: 'Thamel, Kathmandu',
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        postalCode: '44600'
      },
      contactInfo: {
        phone: '+977-1-4123456',
        email: 'main@gardencafe.com',
        manager: 'Main Manager'
      },
      operatingHours: [
        { day: 'monday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'tuesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'wednesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'thursday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'friday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'saturday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'sunday', open: '09:00', close: '23:00', isClosed: false }
      ],
      settings: {
        autoAcceptOrders: true,
        allowReservations: true,
        printAutomatically: false
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const branchResult = await db.collection('branches').insertOne(branchDoc);
    const branchId = branchResult.insertedId;
    console.log(`✅ Branch created: ${branchId}\n`);

    // Migrate users
    console.log('📊 Migrating users...');
    const userMapping = new Map();
    const newUsersData = [];
    let ownerUserId = null;

    for (const oldUser of oldUsers) {
      const newUserId = new mongoose.Types.ObjectId();
      userMapping.set(oldUser._id.toString(), newUserId);

      const role = oldUser.role === 'admin' ? 'owner' : oldUser.role;
      if (role === 'owner') ownerUserId = newUserId;

      newUsersData.push({
        _id: newUserId,
        organization: organizationId,
        branches: [branchId],
        name: oldUser.name,
        email: oldUser.email,
        password: oldUser.password,
        role: role,
        emailVerified: true,
        isActive: true,
        lastLogin: oldUser.updatedAt || new Date(),
        createdAt: oldUser.createdAt || new Date(),
        updatedAt: oldUser.updatedAt || new Date()
      });
    }

    await db.collection('users_v2').insertMany(newUsersData);
    console.log(`✅ Created ${newUsersData.length} users in users_v2\n`);

    // Update organization owner
    await db.collection('organizations').updateOne(
      { _id: organizationId },
      { $set: { owner: ownerUserId } }
    );

    // Migrate tables
    console.log('📊 Migrating tables...');
    const tableMapping = new Map();
    const newTablesData = [];

    for (const oldTable of oldTables) {
      const newTableId = new mongoose.Types.ObjectId();
      tableMapping.set(oldTable._id.toString(), newTableId);

      newTablesData.push({
        _id: newTableId,
        organization: organizationId,
        branch: branchId,
        tableNumber: oldTable.tableNumber?.toString() || 'Unknown',
        capacity: oldTable.capacity || 4,
        status: oldTable.status || 'available',
        currentOrder: null,
        occupiedAt: oldTable.occupiedAt || null,
        currentBillAmount: oldTable.currentBillAmount || 0,
        assignedWaiters: (oldTable.assignedWaiters || [])
          .map(id => userMapping.get(id?.toString()))
          .filter(Boolean),
        createdAt: oldTable.createdAt || new Date(),
        updatedAt: oldTable.updatedAt || new Date()
      });
    }

    await db.collection('tables_v2').insertMany(newTablesData);
    console.log(`✅ Created ${newTablesData.length} tables in tables_v2\n`);

    // Migrate menu items
    console.log('📊 Migrating menu items...');
    const menuMapping = new Map();
    const newMenuItemsData = [];

    for (const oldItem of oldMenuItems) {
      const newItemId = new mongoose.Types.ObjectId();
      menuMapping.set(oldItem._id.toString(), newItemId);

      newMenuItemsData.push({
        _id: newItemId,
        organization: organizationId,
        branches: [branchId],
        name: oldItem.name,
        description: oldItem.description || '',
        category: oldItem.category,
        price: oldItem.price,
        isAvailable: oldItem.isAvailable !== false,
        isCombo: oldItem.isCombo || false,
        comboPrice: oldItem.comboPrice || 0,
        trackInventory: false,
        tags: [],
        preparationTime: 10,
        createdAt: oldItem.createdAt || new Date(),
        updatedAt: oldItem.updatedAt || new Date()
      });
    }

    await db.collection('menuitems_v2').insertMany(newMenuItemsData);
    console.log(`✅ Created ${newMenuItemsData.length} menu items in menuitems_v2\n`);

    // Migrate orders
    console.log('📊 Migrating orders...');
    const orderMapping = new Map();
    const newOrdersData = [];
    let orderCounter = 1;

    for (const oldOrder of oldOrders) {
      const newOrderId = new mongoose.Types.ObjectId();
      orderMapping.set(oldOrder._id.toString(), newOrderId);

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      const newItems = (oldOrder.items || []).map(item => ({
        menuItem: menuMapping.get(item.menuItem?.toString()),
        name: item.name || 'Unknown Item',
        quantity: item.quantity || 1,
        price: item.price || 0,
        specialRequests: item.specialRequests || '',
        status: item.status || 'served'
      })).filter(item => item.menuItem);

      if (newItems.length === 0) continue;

      newOrdersData.push({
        _id: newOrderId,
        organization: organizationId,
        branch: branchId,
        orderNumber: `GAR-BR001-${dateStr}-${String(orderCounter++).padStart(4, '0')}`,
        table: tableMapping.get(oldOrder.table?.toString()),
        items: newItems,
        subtotal: oldOrder.subtotal || 0,
        serviceCharge: oldOrder.serviceCharge || 0,
        vat: oldOrder.vat || 0,
        totalAmount: oldOrder.totalAmount || 0,
        status: oldOrder.status || 'completed',
        waiters: (oldOrder.waiters || []).map(id => userMapping.get(id?.toString())).filter(Boolean),
        createdBy: userMapping.get(oldOrder.createdBy?.toString()) || ownerUserId,
        orderType: 'dine-in',
        completedAt: oldOrder.status === 'completed' ? (oldOrder.updatedAt || new Date()) : null,
        createdAt: oldOrder.createdAt || new Date(),
        updatedAt: oldOrder.updatedAt || new Date()
      });
    }

    if (newOrdersData.length > 0) {
      await db.collection('orders_v2').insertMany(newOrdersData);
    }
    console.log(`✅ Created ${newOrdersData.length} orders in orders_v2\n`);

    // Migrate payments
    console.log('📊 Migrating payments...');
    const newPaymentsData = [];

    for (const oldPayment of oldPayments) {
      newPaymentsData.push({
        _id: new mongoose.Types.ObjectId(),
        organization: organizationId,
        branch: branchId,
        order: orderMapping.get(oldPayment.order?.toString()),
        table: tableMapping.get(oldPayment.table?.toString()),
        paymentMethod: oldPayment.paymentMethod || 'cash',
        amount: oldPayment.amount || 0,
        transactionId: oldPayment.transactionId,
        paymentStatus: oldPayment.paymentStatus || 'completed',
        receiptGenerated: oldPayment.receiptGenerated || false,
        receiptUrl: oldPayment.receiptUrl,
        receiptNumber: `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processedBy: userMapping.get(oldPayment.processedBy?.toString()) || ownerUserId,
        tip: { amount: 0, distributedTo: [] },
        createdAt: oldPayment.createdAt || new Date(),
        updatedAt: oldPayment.updatedAt || new Date()
      });
    }

    if (newPaymentsData.length > 0) {
      await db.collection('payments_v2').insertMany(newPaymentsData);
    }
    console.log(`✅ Created ${newPaymentsData.length} payments in payments_v2\n`);

    // Create subscription
    await db.collection('subscriptions').insertOne({
      organization: organizationId,
      plan: 'business',
      status: 'active',
      provider: 'manual',
      billingCycle: 'yearly',
      amount: 948,
      currency: 'USD',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usage: { 
        branches: 1, 
        tables: newTablesData.length, 
        staff: newUsersData.length - 1, 
        orders: newOrdersData.length 
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🎉 SAFE MIGRATION COMPLETED!        ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📊 Migration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Organization: ${organizationDoc.name}`);
    console.log(`✅ Branch: ${branchDoc.name}`);
    console.log(`✅ Users: ${newUsersData.length} (in users_v2)`);
    console.log(`✅ Tables: ${newTablesData.length} (in tables_v2)`);
    console.log(`✅ Menu Items: ${newMenuItemsData.length} (in menuitems_v2)`);
    console.log(`✅ Orders: ${newOrdersData.length} (in orders_v2)`);
    console.log(`✅ Payments: ${newPaymentsData.length} (in payments_v2)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚠️  IMPORTANT: Your original data is UNTOUCHED!\n');
    console.log('📋 New collections created:');
    console.log('   - organizations');
    console.log('   - branches');
    console.log('   - subscriptions');
    console.log('   - users_v2');
    console.log('   - tables_v2');
    console.log('   - menuitems_v2');
    console.log('   - orders_v2');
    console.log('   - payments_v2\n');

    console.log('🔧 Next Steps:');
    console.log('1. Test the new collections');
    console.log('2. Update backend models to use new schema');
    console.log('3. When ready, rename _v2 collections to production names\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

safeMigration();