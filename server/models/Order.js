const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: String,
  displayName: String,
  variants: [{
    groupName:   String,
    optionName:  String,
    optionPrice: Number
  }],
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  specialRequests: String,
  status: { 
    type: String, 
    enum: ["pending","in-progress","ready","served","cancelled"], 
    default: "pending" 
  },
  preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  prepStartedAt: Date,
  prepCompletedAt: Date
});

const orderSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  orderNumber: { type: String, unique: true, sparse: true },   // ✅ Not required (hook generates)
  table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0 },                       // ✅ Removed required
  serviceCharge: { type: Number, default: 0 },
  vat: { type: Number, default: 0 },
  discount: {
    amount: { type: Number, default: 0 },
    reason: String,
    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  totalAmount: { type: Number, default: 0 },                    // ✅ Removed required
  status: { type: String, enum: ["active","completed","cancelled"], default: "active", index: true },
  waiters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: { name: String, phone: String, email: String },
  orderType: { type: String, enum: ["dine-in","takeout","delivery"], default: "dine-in" },
  paymentMethod: String,
  notes: String,
  completedAt: Date
}, { timestamps: true });

// ✅ Generate orderNumber BEFORE validation
orderSchema.pre("validate", async function() {
  if (!this.orderNumber) {
    const Branch = mongoose.model("Branch");
    const branch = await Branch.findById(this.branch);
    if (!branch) {
      throw new Error("Branch not found for order");
    }
    const date = new Date();
    const dateStr = String(date.getFullYear()) +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0");
    const count = await this.constructor.countDocuments({
      branch: this.branch,
      createdAt: { $gte: new Date(date.setHours(0, 0, 0, 0)) }
    });
    this.orderNumber = branch.code + "-" + dateStr + "-" + String(count + 1).padStart(4, "0");
  }
});

// ✅ Calculate totals before save
orderSchema.pre("save", function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.serviceCharge = parseFloat((this.subtotal * 0.10).toFixed(2));
  this.vat = parseFloat((this.subtotal * 0.13).toFixed(2));
  this.totalAmount = parseFloat((this.subtotal + this.serviceCharge + this.vat - (this.discount?.amount || 0)).toFixed(2));
});

module.exports = mongoose.model("Order", orderSchema);