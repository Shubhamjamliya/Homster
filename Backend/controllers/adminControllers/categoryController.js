const Category = require('../../models/Category');
const { validationResult } = require('express-validator');
const { SERVICE_STATUS } = require('../../utils/constants');

/**
 * Get all categories
 * GET /api/admin/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const { status, showOnHome, isPopular } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (showOnHome !== undefined) query.showOnHome = showOnHome === 'true';
    if (isPopular !== undefined) query.isPopular = isPopular === 'true';

    const categories = await Category.find(query)
      .select('-__v')
      .sort({ homeOrder: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories.map(cat => ({
        id: cat._id,
        title: cat.title,
        slug: cat.slug,
        homeIconUrl: cat.homeIconUrl,
        homeBadge: cat.homeBadge,
        hasSaleBadge: cat.hasSaleBadge,
        showOnHome: cat.showOnHome,
        homeOrder: cat.homeOrder,
        description: cat.description,
        imageUrl: cat.imageUrl,
        status: cat.status,
        isPopular: cat.isPopular,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories. Please try again.'
    });
  }
};

/**
 * Get single category by ID
 * GET /api/admin/categories/:id
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).select('-__v').lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category: {
        id: category._id,
        title: category.title,
        slug: category.slug,
        homeIconUrl: category.homeIconUrl,
        homeBadge: category.homeBadge,
        hasSaleBadge: category.hasSaleBadge,
        showOnHome: category.showOnHome,
        homeOrder: category.homeOrder,
        description: category.description,
        imageUrl: category.imageUrl,
        status: category.status,
        isPopular: category.isPopular,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category. Please try again.'
    });
  }
};

/**
 * Create new category
 * POST /api/admin/categories
 */
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      slug,
      homeIconUrl,
      homeBadge,
      hasSaleBadge,
      showOnHome,
      homeOrder,
      description,
      imageUrl,
      status,
      isPopular,
      metaTitle,
      metaDescription
    } = req.body;

    // Check if category with same title or slug exists
    const existingCategory = await Category.findOne({
      $or: [
        { title: title.trim() },
        { slug: slug?.trim().toLowerCase() }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this title or slug already exists'
      });
    }

    const category = await Category.create({
      title: title.trim(),
      slug: slug?.trim().toLowerCase() || undefined, // Will be auto-generated if not provided
      homeIconUrl: homeIconUrl || null,
      homeBadge: homeBadge?.trim() || null,
      hasSaleBadge: Boolean(hasSaleBadge),
      showOnHome: showOnHome !== false,
      homeOrder: Number(homeOrder) || 0,
      description: description?.trim() || null,
      imageUrl: imageUrl || null,
      status: status || SERVICE_STATUS.ACTIVE,
      isPopular: Boolean(isPopular),
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: {
        id: category._id,
        title: category.title,
        slug: category.slug,
        homeIconUrl: category.homeIconUrl,
        homeBadge: category.homeBadge,
        hasSaleBadge: category.hasSaleBadge,
        showOnHome: category.showOnHome,
        homeOrder: category.homeOrder,
        description: category.description,
        imageUrl: category.imageUrl,
        status: category.status,
        isPopular: category.isPopular,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });
  } catch (error) {
    console.error('Create category error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this title or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category. Please try again.'
    });
  }
};

/**
 * Update category
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      title,
      slug,
      homeIconUrl,
      homeBadge,
      hasSaleBadge,
      showOnHome,
      homeOrder,
      description,
      imageUrl,
      status,
      isPopular,
      metaTitle,
      metaDescription
    } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if title or slug conflicts with another category
    if (title || slug) {
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        $or: [
          title ? { title: title.trim() } : {},
          slug ? { slug: slug.trim().toLowerCase() } : {}
        ]
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this title or slug already exists'
        });
      }
    }

    // Update fields
    if (title !== undefined) category.title = title.trim();
    if (slug !== undefined) category.slug = slug.trim().toLowerCase();
    if (homeIconUrl !== undefined) category.homeIconUrl = homeIconUrl || null;
    if (homeBadge !== undefined) category.homeBadge = homeBadge?.trim() || null;
    if (hasSaleBadge !== undefined) category.hasSaleBadge = Boolean(hasSaleBadge);
    if (showOnHome !== undefined) category.showOnHome = showOnHome !== false;
    if (homeOrder !== undefined) category.homeOrder = Number(homeOrder) || 0;
    if (description !== undefined) category.description = description?.trim() || null;
    if (imageUrl !== undefined) category.imageUrl = imageUrl || null;
    if (status !== undefined) category.status = status;
    if (isPopular !== undefined) category.isPopular = Boolean(isPopular);
    if (metaTitle !== undefined) category.metaTitle = metaTitle?.trim() || null;
    if (metaDescription !== undefined) category.metaDescription = metaDescription?.trim() || null;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: {
        id: category._id,
        title: category.title,
        slug: category.slug,
        homeIconUrl: category.homeIconUrl,
        homeBadge: category.homeBadge,
        hasSaleBadge: category.hasSaleBadge,
        showOnHome: category.showOnHome,
        homeOrder: category.homeOrder,
        description: category.description,
        imageUrl: category.imageUrl,
        status: category.status,
        isPopular: category.isPopular,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });
  } catch (error) {
    console.error('Update category error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this title or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category. Please try again.'
    });
  }
};

/**
 * Delete category (soft delete - set status to deleted)
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Soft delete - set status to deleted
    category.status = SERVICE_STATUS.DELETED;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category. Please try again.'
    });
  }
};

/**
 * Update category order
 * PATCH /api/admin/categories/:id/order
 */
const updateCategoryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { homeOrder } = req.body;

    if (homeOrder === undefined || isNaN(homeOrder)) {
      return res.status(400).json({
        success: false,
        message: 'homeOrder is required and must be a number'
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.homeOrder = Number(homeOrder);
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category order updated successfully',
      category: {
        id: category._id,
        title: category.title,
        homeOrder: category.homeOrder
      }
    });
  } catch (error) {
    console.error('Update category order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category order. Please try again.'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder
};

