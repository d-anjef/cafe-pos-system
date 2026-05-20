const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }], // If empty, available to all branches
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: ['coffee', 'tea', 'pastries', 'meals', 'beverages', 'desserts', 'appetizers', 'main-course', 'sides', 'specials']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: Number, // For profit margin calculation
  image: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  isCombo: {
    type: Boolean,
    default: false
  },
  comboItems: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    quantity: Number
  }],
  comboPrice: Number,
  
  // Inventory tracking (if enabled)
  trackInventory: {
    type: Boolean,
    default: false
  },
  currentStock: Number,
  lowStockThreshold: Number,
  
  // Nutritional info (optional)
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  
  // Dietary info
  tags: [String], // ['vegetarian', 'vegan', 'gluten-free', 'spicy']
  allergens: [String],
  
  // Availability schedule
  availableOn: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  availableFrom: String, // "09:00"
  availableTo: String, // "21:00"
  
  preparationTime: Number, // in minutes
  popularity: { type: Number, default: 0 }, // Auto-calculated from sales
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);