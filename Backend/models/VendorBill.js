const mongoose = require('mongoose');
const { BILL_STATUS } = require('../utils/constants');

/**
 * Vendor Bill Model
 * Represents the final bill created by the vendor after a job
 */
const vendorBillSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },

  // Services from VendorServiceCatalog
  services: [{
    catalogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorServiceCatalog'
    },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    total: Number
  }],

  // Parts from VendorPartsCatalog
  parts: [{
    catalogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorPartsCatalog'
    },
    name: String,
    price: Number,
    gstPercentage: Number,
    quantity: { type: Number, default: 1 },
    gstAmount: Number,
    total: Number // includes GST
  }],

  // Custom Items (Ad-hoc)
  customItems: [{
    name: String,
    price: Number,
    gstApplicable: Boolean,
    gstPercentage: Number,
    quantity: { type: Number, default: 1 },
    gstAmount: Number,
    total: Number // includes GST
  }],

  // Totals
  totalServiceCharges: {
    type: Number,
    default: 0
  },
  totalPartsCharges: { // includes GST
    type: Number,
    default: 0
  },
  totalCustomCharges: { // includes GST
    type: Number,
    default: 0
  },

  // Final Calculations
  grandTotal: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: Object.values(BILL_STATUS),
    default: BILL_STATUS.DRAFT,
    index: true
  },

  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VendorBill', vendorBillSchema);
