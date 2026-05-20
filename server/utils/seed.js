const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("../models/User");
const Table = require("../models/Table");
const Layout = require("../models/Layout");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  try {
    console.log("🌱 Seeding database...");

    // ✅ Clear all
    await User.deleteMany();
    await Table.deleteMany();
    await Layout.deleteMany();
    await Order.deleteMany();
    await MenuItem.deleteMany();

    // ✅ Create Users
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create([
      {
        name: "Admin",
        email: "admin@garden.com",
        password: hashedPassword,
        role: "admin"
      },
      {
        name: "Waiter",
        email: "waiter@garden.com",
        password: hashedPassword,
        role: "waiter"
      },
      {
        name: "Kitchen",
        email: "kitchen@garden.com",
        password: hashedPassword,
        role: "kitchen"
      }
    ]);

    console.log("✅ Users created");

    // ✅ Create Tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const table = await Table.create({
        tableNumber: i,
        capacity: i <= 5 ? 2 : 4
      });
      tables.push(table);
    }

    console.log("✅ Tables created");

    // ✅ Create Menu Items
    await MenuItem.insertMany([
      // Beverages
      {
        name: "Cappuccino",
        price: 120,
        category: "Beverages",
        description: "Rich espresso with steamed milk"
      },
      {
        name: "Espresso",
        price: 100,
        category: "Beverages",
        description: "Strong black coffee"
      },
      {
        name: "Latte",
        price: 140,
        category: "Beverages",
        description: "Smooth espresso with milk"
      },
      {
        name: "Green Tea",
        price: 90,
        category: "Beverages",
        description: "Fresh green tea"
      },
      {
        name: "Cold Coffee",
        price: 150,
        category: "Beverages",
        description: "Chilled coffee delight"
      },
      // Snacks
      {
        name: "Veg Sandwich",
        price: 180,
        category: "Snacks",
        description: "Fresh vegetable sandwich"
      },
      {
        name: "Cheese Burger",
        price: 250,
        category: "Snacks",
        description: "Grilled cheese burger"
      },
      {
        name: "French Fries",
        price: 130,
        category: "Snacks",
        description: "Crispy golden fries"
      },
      {
        name: "Garlic Bread",
        price: 110,
        category: "Snacks",
        description: "Toasted garlic bread"
      },
      // Meals
      {
        name: "Pasta Arrabiata",
        price: 280,
        category: "Meals",
        description: "Spicy tomato pasta"
      },
      {
        name: "Grilled Sandwich",
        price: 200,
        category: "Meals",
        description: "Hot grilled sandwich"
      },
      // Desserts
      {
        name: "Chocolate Cake",
        price: 160,
        category: "Desserts",
        description: "Rich chocolate slice"
      },
      {
        name: "Ice Cream",
        price: 120,
        category: "Desserts",
        description: "Vanilla scoop"
      }
    ]);

    console.log("✅ Menu items created");

    // ✅ Create Layout
    await Layout.create({
      name: "Main Floor",
      gridSize: 20,
      zoom: 1,
      backgroundColor: "#f8f8f8",
      tables: tables.map((t, index) => ({
        tableId: t._id,
        x: 80 + (index % 5) * 160,
        y: 80 + Math.floor(index / 5) * 160,
        width: 120,
        height: 80,
        rotation: 0
      }))
    });

    console.log("✅ Layout created");

    console.log("🎉 Database seeded successfully");
    console.log("----------------------------");
    console.log("Admin:   admin@garden.com / admin123");
    console.log("Waiter:  waiter@garden.com / admin123");
    console.log("Kitchen: kitchen@garden.com / admin123");
    console.log("----------------------------");

    process.exit();

  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seed();