const mongoose = require('mongoose');
const { SERVICE_STATUS } = require('../utils/constants');

/**
 * Service Model
 * Represents individual services (e.g., Fan Repair, AC Service, etc.)
 */
const serviceSchema = new mongoose.Schema({
  // Frontend matching fields
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide at least one category'],
    index: true
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },
  iconUrl: {
    type: String,
    default: null
  },
  badge: {
    type: String,
    default: null,
    trim: true
  },
  routePath: {
    type: String,
    default: null
  },
  // Page content (matching frontend structure)
  page: {
    banners: [{
      imageUrl: String,
      text: String
    }],
    ratingTitle: {
      type: String,
      default: ''
    },
    ratingValue: {
      type: String,
      default: ''
    },
    bookingsText: {
      type: String,
      default: ''
    },
    paymentOffersEnabled: {
      type: Boolean,
      default: true
    },
    paymentOffers: [{
      title: String,
      discount: String,
      code: String,
      description: String,
      iconUrl: String
    }],
    serviceCategoriesGrid: [{
      title: String,
      imageUrl: String,
      badge: String
    }]
  },
  // Sections (matching frontend structure)
  sections: [{
    title: String,
    anchorId: String,
    navImageUrl: String,
    navBadge: String,
    type: {
      type: String,
      default: 'standard'
    },
    cards: [{
      title: String,
      subtitle: String,
      rating: String,
      reviews: String,
      price: String,
      originalPrice: String,
      duration: String,
      options: String,
      badge: String,
      label: String,
      offer: String,
      priceText: String,
      perBathroom: String,
      iconName: String,
      description: String,
      imageUrl: String,
      features: [String],
      imageText: {
        titleLines: [String],
        subtitle: String
      }
    }]
  }],
  // Additional backend fields for booking functionality
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  // Pricing (for booking)
  basePrice: {
    type: Number,
    default: null, // Optional - can be set per booking
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: null,
    min: [0, 'Discount price cannot be negative']
  },
  // Service Details
  duration: {
    type: Number, // Duration in minutes
    default: 60
  },
  unit: {
    type: String, // e.g., 'per unit', 'per hour', 'per service'
    default: 'per service'
  },
  // Status
  status: {
    type: String,
    enum: Object.values(SERVICE_STATUS),
    default: SERVICE_STATUS.ACTIVE,
    index: true
  },
  // Additional Info
  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  // SEO
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  // Admin tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
serviceSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  // Auto-generate routePath from slug
  if (this.isModified('slug') && !this.routePath) {
    this.routePath = `/user/${this.slug}`;
  }
  // Sync categoryId and categoryIds
  if (this.isModified('categoryId') && this.categoryId && !this.categoryIds.includes(this.categoryId)) {
    if (!this.categoryIds.includes(this.categoryId)) {
      this.categoryIds.push(this.categoryId);
    }
  }

  if (this.isModified('categoryIds') && this.categoryIds.length > 0) {
    this.categoryId = this.categoryIds[0];
  }

  next();
});

// Indexes for faster queries
serviceSchema.index({ categoryIds: 1, status: 1 });
serviceSchema.index({ status: 1, isPopular: 1, isFeatured: 1 });

module.exports = mongoose.model('Service', serviceSchema);

