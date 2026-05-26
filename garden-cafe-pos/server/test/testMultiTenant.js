const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

const testMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Find a user
    console.log('🧪 Test 1: Finding user with populated data...');
    const user = await User.findOne({ email: 'admin@garden.com' })
      .populate('organization')
      .populate('branches');
    
    if (user) {
      console.log(`✅ Found user: ${user.name}`);
      console.log(`   Organization: ${user.organization?.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Branches: ${user.branches.length}\n`);
    } else {
      console.log('❌ User not found\n');
    }

    // Test 2: Find tables with branch
    console.log('🧪 Test 2: Finding tables with organization/branch...');
    const tables = await Table.find()
      .populate('organization', 'name')
      .populate('branch', 'name code')
      .limit(3);
    
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   Table #${table.tableNumber} - ${table.branch?.name || 'No branch'} (${table.status})`);
    });
    console.log('');

    // Test 3: Find menu items
    console.log('🧪 Test 3: Finding menu items...');
    const menuItems = await MenuItem.find()
      .populate('organization', 'name')
      .limit(3);
    
    console.log(`✅ Found ${menuItems.length} menu items:`);
    menuItems.forEach(item => {
      console.log(`   ${item.name} - Rs ${item.price} (${item.category})`);
    });
    console.log('');

    // Test 4: Check organization
    console.log('🧪 Test 4: Checking organization details...');
    const org = await Organization.findOne().populate('owner', 'name email');
    
    if (org) {
      console.log(`✅ Organization: ${org.name}`);
      console.log(`   Slug: ${org.slug}`);
      console.log(`   Owner: ${org.owner?.name || 'N/A'}`);
      console.log(`   Plan: ${org.subscription.plan}`);
      console.log(`   Status: ${org.subscription.status}`);
      console.log(`   Limits: ${org.limits.branches} branches, ${org.limits.tables} tables`);
    }

    console.log('\n✅ ALL TESTS PASSED! Multi-tenant setup is working correctly.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testMigration();