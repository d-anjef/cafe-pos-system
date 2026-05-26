const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/User");
const Table = require("../models/Table");
const Layout = require("../models/Layout");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Organization = require("../models/Organization");
const Branch = require("../models/Branch");
const Subscription = require("../models/Subscription");

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  try {
    console.log("Seeding database...");

    await User.deleteMany();
    await Table.deleteMany();
    await Layout.deleteMany();
    await Order.deleteMany();
    await MenuItem.deleteMany();
    await Organization.deleteMany();
    await Branch.deleteMany();
    await Subscription.deleteMany();

    console.log("Cleared all collections");

    // 1. SUPER ADMIN
    await User.create({
      name: "Super Admin",
      email: "superadmin@saas.com",
      password: "admin123",
      role: "super_admin",
      isActive: true
    });
    console.log("Super admin created");

    // 2. OWNER
    const owner = await User.create({
      name: "Cafe Owner",
      email: "admin@garden.com",
      password: "admin123",
      role: "owner",
      isActive: true
    });
    console.log("Owner created");

    // 3. ORGANIZATION
    const organization = await Organization.create({
      name: "Garden & Cafe",
      slug: "garden-cafe",
      owner: owner._id,
      subscription: {
        plan: "business",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      limits: {
        branches: 5,
        tables: 50,
        staff: 20,
        menuItems: 200,
        analyticsRetention: 30
      },
      features: {
        pdfReceipts: true,
        customBranding: true,
        inventory: true,
        employeeMetrics: true
      },
      settings: {
        currency: "NPR",
        timezone: "Asia/Kathmandu",
        taxRate: 13,
        serviceCharge: 10
      },
      isActive: true
    });
    console.log("Organization created");

    // 4. BRANCH
    const branch = await Branch.create({
      organization: organization._id,
      name: "Main Branch",
      code: "MAIN",
      location: {
        address: "Thamel",
        city: "Kathmandu",
        state: "Bagmati",
        country: "Nepal"
      },
      contactInfo: {
        phone: "+977-1-4000000",
        email: "main@garden.com",
        manager: "Cafe Owner"
      },
      isActive: true,
      settings: {
        autoAcceptOrders: true,
        allowReservations: false,
        printAutomatically: false
      }
    });
    console.log("Branch created");

    // 5. UPDATE OWNER
    owner.organization = organization._id;
    owner.branches = [branch._id];
    await owner.save();
    console.log("Owner updated");

    // 6. SUBSCRIPTION
    await Subscription.create({
      organization: organization._id,
      plan: "business",
      status: "active",
      provider: "manual",
      billingCycle: "monthly",
      amount: 2999,
      currency: "NPR",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    console.log("Subscription created");

    // 7. REMAINING USERS
    await User.create({
      organization: organization._id,
      branches: [branch._id],
      name: "Branch Admin",
      email: "branchadmin@garden.com",
      password: "admin123",
      role: "admin",
      isActive: true
    });

    await User.create({
      organization: organization._id,
      branches: [branch._id],
      name: "Branch Manager",
      email: "manager@garden.com",
      password: "admin123",
      role: "branch_manager",
      isActive: true
    });

    await User.create({
      organization: organization._id,
      branches: [branch._id],
      name: "Waiter",
      email: "waiter@garden.com",
      password: "admin123",
      role: "waiter",
      isActive: true
    });

    await User.create({
      organization: organization._id,
      branches: [branch._id],
      name: "Kitchen Staff",
      email: "kitchen@garden.com",
      password: "admin123",
      role: "kitchen",
      isActive: true
    });

    console.log("All users created");

    // 8. TABLES
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const table = await Table.create({
        organization: organization._id,
        branch: branch._id,
        tableNumber: i,
        capacity: i <= 5 ? 2 : 4,
        status: "available"
      });
      tables.push(table);
    }
    console.log("Tables created (10)");

    // 9. MENU ITEMS - using correct enum categories
    const menuItems = [
      { name: "Cappuccino", price: 120, category: "coffee", description: "Rich espresso with steamed milk" },
      { name: "Espresso", price: 100, category: "coffee", description: "Strong black coffee" },
      { name: "Latte", price: 140, category: "coffee", description: "Smooth espresso with milk" },
      { name: "Green Tea", price: 90, category: "tea", description: "Fresh green tea" },
      { name: "Cold Coffee", price: 150, category: "beverages", description: "Chilled coffee delight" },
      { name: "Fresh Juice", price: 130, category: "beverages", description: "Fresh seasonal juice" },
      { name: "Veg Sandwich", price: 180, category: "appetizers", description: "Fresh vegetable sandwich" },
      { name: "Garlic Bread", price: 110, category: "appetizers", description: "Toasted garlic bread" },
      { name: "French Fries", price: 130, category: "sides", description: "Crispy golden fries" },
      { name: "Cheese Burger", price: 250, category: "main-course", description: "Grilled cheese burger" },
      { name: "Pasta Arrabiata", price: 280, category: "meals", description: "Spicy tomato pasta" },
      { name: "Grilled Sandwich", price: 200, category: "meals", description: "Hot grilled sandwich" },
      { name: "Chocolate Cake", price: 160, category: "desserts", description: "Rich chocolate slice" },
      { name: "Ice Cream", price: 120, category: "desserts", description: "Vanilla scoop" },
      { name: "Croissant", price: 90, category: "pastries", description: "Buttery croissant" },
      { name: "Muffin", price: 80, category: "pastries", description: "Fresh baked muffin" },
      { name: "Chef Special", price: 350, category: "specials", description: "Daily chef special" }
    ];

    await MenuItem.insertMany(
      menuItems.map(item => ({
        ...item,
        organization: organization._id,
        branches: [branch._id],
        isAvailable: true,
        isActive: true
      }))
    );
    console.log("Menu items created (17)");

    // 10. LAYOUT
    await Layout.create({
      organization: organization._id,
      branch: branch._id,
      name: "Main Floor",
      gridSize: 20,
      zoom: 1,
      backgroundColor: "#1a1a1a",
      tables: tables.map((t, index) => ({
        tableId: t._id,
        x: 80 + (index % 5) * 160,
        y: 80 + Math.floor(index / 5) * 160,
        width: 120,
        height: 80,
        rotation: 0
      }))
    });
    console.log("Layout created");

    console.log("==================================================");
    console.log("DATABASE SEEDED SUCCESSFULLY");
    console.log("==================================================");
    console.log("SUPER ADMIN:    superadmin@saas.com    / admin123");
    console.log("OWNER:          admin@garden.com       / admin123");
    console.log("BRANCH ADMIN:   branchadmin@garden.com / admin123");
    console.log("BRANCH MANAGER: manager@garden.com     / admin123");
    console.log("WAITER:         waiter@garden.com      / admin123");
    console.log("KITCHEN:        kitchen@garden.com     / admin123");
    console.log("==================================================");
    console.log("Organization: Garden & Cafe");
    console.log("Branch: Main Branch (MAIN)");
    console.log("Plan: Business");
    console.log("==================================================");

    process.exit(0);

  } catch (error) {
    console.error("Seed Error:", error.message);
    process.exit(1);
  }
};

seed();
