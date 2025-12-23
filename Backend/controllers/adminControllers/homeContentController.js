const HomeContent = require('../../models/HomeContent');
const { validationResult } = require('express-validator');

/**
 * Get Home Content
 * GET /api/admin/home-content
 */
const getHomeContent = async (req, res) => {
  try {
    let homeContent = await HomeContent.findOne();

    if (!homeContent) {
      // Create empty home content if none exists
      homeContent = await HomeContent.create({});
    }

    res.status(200).json({
      success: true,
      homeContent: {
        id: homeContent._id,
        banners: homeContent.banners || [],
        promos: homeContent.promos || [],
        curated: homeContent.curated || [],
        noteworthy: homeContent.noteworthy || [],
        booked: homeContent.booked || [],
        categorySections: homeContent.categorySections || [],
        isActive: homeContent.isActive,
        createdAt: homeContent.createdAt,
        updatedAt: homeContent.updatedAt
      }
    });
  } catch (error) {
    console.error('Get home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home content. Please try again.'
    });
  }
};

/**
 * Update Home Content
 * PUT /api/admin/home-content
 */
const updateHomeContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let homeContent = await HomeContent.findOne();

    if (!homeContent) {
      homeContent = new HomeContent({});
    }

    // Helper to sanitize array items
    const sanitizeItems = (items) => {
      if (!Array.isArray(items)) return [];
      return items.map(item => {
        const newItem = { ...item };
        // Remove frontend-only 'id' fields that are strings
        if (typeof newItem.id === 'string' && (newItem.id.startsWith('hbnr-') || newItem.id.startsWith('hprm-') || newItem.id.startsWith('hcur-') || newItem.id.startsWith('hnot-') || newItem.id.startsWith('hbkd-'))) {
          delete newItem.id;
        }

        // Handle targetCategoryId/seeAllTargetCategoryId
        if (newItem.targetCategoryId === '') newItem.targetCategoryId = null;
        if (newItem.seeAllTargetCategoryId === '') newItem.seeAllTargetCategoryId = null;

        // Handle nested cards in categorySections
        if (Array.isArray(newItem.cards)) {
          newItem.cards = newItem.cards.map(card => {
            const newCard = { ...card };
            if (newCard.targetCategoryId === '') newCard.targetCategoryId = null;
            return newCard;
          });
        }

        return newItem;
      });
    };

    // Update fields with sanitization
    if (req.body.banners !== undefined) homeContent.banners = sanitizeItems(req.body.banners);
    if (req.body.promos !== undefined) homeContent.promos = sanitizeItems(req.body.promos);
    if (req.body.curated !== undefined) homeContent.curated = sanitizeItems(req.body.curated);
    if (req.body.noteworthy !== undefined) homeContent.noteworthy = sanitizeItems(req.body.noteworthy);
    if (req.body.booked !== undefined) homeContent.booked = sanitizeItems(req.body.booked);
    if (req.body.categorySections !== undefined) homeContent.categorySections = sanitizeItems(req.body.categorySections);
    if (req.body.isActive !== undefined) homeContent.isActive = req.body.isActive;

    await homeContent.save();

    res.status(200).json({
      success: true,
      message: 'Home content updated successfully',
      homeContent: {
        id: homeContent._id,
        banners: homeContent.banners,
        promos: homeContent.promos,
        curated: homeContent.curated,
        noteworthy: homeContent.noteworthy,
        booked: homeContent.booked,
        categorySections: homeContent.categorySections,
        isActive: homeContent.isActive
      }
    });
  } catch (error) {
    console.error('Update home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update home content. Please try again.'
    });
  }
};

module.exports = {
  getHomeContent,
  updateHomeContent
};

