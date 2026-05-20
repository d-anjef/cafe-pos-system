const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'Nepal' },
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    manager: String
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String, // "09:00"
    close: String, // "22:00"
    isClosed: { type: Boolean, default: false }
  }],
  settings: {
    autoAcceptOrders: { type: Boolean, default: true },
    allowReservations: { type: Boolean, default: false },
    printAutomatically: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate branch code
branchSchema.pre('save', async function(next) {
  if (!this.code) {
    const org = await mongoose.model('Organization').findById(this.organization);
    const count = await this.constructor.countDocuments({ organization: this.organization });
    this.code = `${org.slug.substring(0, 3).toUpperCase()}-BR${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Branch', branchSchema);