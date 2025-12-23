const mongoose = require('mongoose');

/**
 * HomeContent Model
 * Manages homepage content: banners, promos, curated services, etc.
 */
const homeContentSchema = new mongoose.Schema({
  // Banners (main homepage banners)
  banners: [{
    imageUrl: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    scrollToSection: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Promo Carousel
  promos: [{
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: 'Explore'
    },
    gradientClass: {
      type: String,
      default: 'from-blue-600 to-blue-800'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    scrollToSection: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Curated Services
  curated: [{
    title: {
      type: String,
      required: true
    },
    gifUrl: {
      type: String,
      default: ''
    },
    youtubeUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // New & Noteworthy
  noteworthy: [{
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Most Booked Services
  booked: [{
    title: {
      type: String,
      required: true
    },
    rating: {
      type: String,
      default: ''
    },
    reviews: {
      type: String,
      default: ''
    },
    price: {
      type: String,
      default: ''
    },
    originalPrice: {
      type: String,
      default: ''
    },
    discount: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Category Sections
  categorySections: [{
    title: {
      type: String,
      required: true
    },
    seeAllTargetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    cards: [{
      title: String,
      imageUrl: String,
      badge: String,
      targetCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
      }
    }],
    order: {
      type: Number,
      default: 0
    }
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one home content document exists
homeContentSchema.statics.getHomeContent = async function () {
  let homeContent = await this.findOne();
  if (!homeContent) {
    homeContent = await this.create({});
  }
  return homeContent;
};

module.exports = mongoose.model('HomeContent', homeContentSchema);

