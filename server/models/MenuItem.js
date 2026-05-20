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
  }],
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
  cost: Number,
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
  
  trackInventory: {
    type: Boolean,
    default: false
  },
  currentStock: Number,
  lowStockThreshold: Number,
  
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  
  tags: [String],
  allergens: [String],
  
  availableOn: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  availableFrom: String,
  availableTo: String,
  
  preparationTime: Number,
  popularity: { type: Number, default: 0 },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);