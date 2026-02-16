const mongoose = require('mongoose');
const { SERVICE_STATUS } = require('../utils/constants');

/**
 * User Service Model
 * Represents individual services strictly under a Brand
 * separate from internal services or global services
 */
const userServiceSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Please provide a brand ID'],
    index: true
  },
  // Added based on user request "category -> brand -> service", 
  // ensuring we can link if needed, though brand already links to category.
  // Making it optional for now to avoid breaking existing flows if not sent.
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    // Removed unique: true from here to allow same slug in different brands
    lowercase: true,
    index: true
  },
  iconUrl: {
    type: String,
    default: null
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  gstPercentage: {
    type: Number,
    required: [true, 'GST percentage is required'],
    min: 0,
    default: 18
  },
  status: {
    type: String,
    enum: Object.values(SERVICE_STATUS),
    default: SERVICE_STATUS.ACTIVE,
    index: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure slug is unique PER BRAND
userServiceSchema.index({ brandId: 1, slug: 1 }, { unique: true });

// Generate slug from title before saving
userServiceSchema.pre('validate', async function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('UserService', userServiceSchema);
