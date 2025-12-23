const Service = require('../../models/Service');
const Category = require('../../models/Category');
const { validationResult } = require('express-validator');
const { SERVICE_STATUS } = require('../../utils/constants');

/**
 * Get all services
 * GET /api/admin/services
 */
const getAllServices = async (req, res) => {
  try {
    const { status, categoryId } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (categoryId) query.categoryIds = categoryId;

    const services = await Service.find(query)
      .populate('categoryIds', 'title slug')
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    // Helper function to clean MongoDB _id fields from nested objects
    const cleanMongoIds = (obj) => {
      if (!obj) return obj;
      if (Array.isArray(obj)) {
        return obj.map(item => cleanMongoIds(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === '_id') continue; // Skip _id fields
          cleaned[key] = cleanMongoIds(value);
        }
        return cleaned;
      }
      return obj;
    };

    res.status(200).json({
      success: true,
      count: services.length,
      services: services.map(svc => ({
        id: svc._id.toString(),
        title: svc.title,
        slug: svc.slug,
        categoryIds: (svc.categoryIds || []).map(cat => (cat && cat._id) ? cat._id.toString() : cat.toString()),
        categoryTitles: (svc.categoryIds || []).map(cat => (cat && cat.title) ? cat.title : null).filter(Boolean),
        categoryId: svc.categoryIds?.[0]?._id?.toString() || svc.categoryIds?.[0]?.toString(),
        categoryTitle: svc.categoryIds?.[0]?.title || null,
        iconUrl: svc.iconUrl,
        badge: svc.badge,
        routePath: svc.routePath,
        basePrice: svc.basePrice,
        discountPrice: svc.discountPrice,
        status: svc.status,
        isPopular: svc.isPopular,
        isFeatured: svc.isFeatured,
        rating: svc.rating,
        totalBookings: svc.totalBookings,
        page: cleanMongoIds(svc.page) || {},
        sections: cleanMongoIds(svc.sections) || [],
        createdAt: svc.createdAt,
        updatedAt: svc.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services. Please try again.'
    });
  }
};

/**
 * Get single service by ID
 * GET /api/admin/services/:id
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate('categoryIds', 'title slug')
      .select('-__v')
      .lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Helper function to clean MongoDB _id fields from nested objects
    const cleanMongoIds = (obj) => {
      if (!obj) return obj;
      if (Array.isArray(obj)) {
        return obj.map(item => cleanMongoIds(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === '_id') continue; // Skip _id fields
          cleaned[key] = cleanMongoIds(value);
        }
        return cleaned;
      }
      return obj;
    };

    res.status(200).json({
      success: true,
      service: {
        id: service._id.toString(),
        title: service.title,
        slug: service.slug,
        categoryIds: (service.categoryIds || []).map(cat => cat._id?.toString() || cat.toString()),
        categoryTitles: (service.categoryIds || []).map(cat => cat.title).filter(Boolean),
        categoryId: service.categoryIds?.[0]?._id?.toString() || service.categoryIds?.[0]?.toString(),
        categoryTitle: service.categoryIds?.[0]?.title || null,
        iconUrl: service.iconUrl,
        badge: service.badge,
        routePath: service.routePath,
        basePrice: service.basePrice,
        discountPrice: service.discountPrice,
        status: service.status,
        isPopular: service.isPopular,
        isFeatured: service.isFeatured,
        rating: service.rating,
        totalBookings: service.totalBookings,
        page: cleanMongoIds(service.page) || {},
        sections: cleanMongoIds(service.sections) || [],
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service. Please try again.'
    });
  }
};

/**
 * Create new service
 * POST /api/admin/services
 */
const createService = async (req, res) => {
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
      categoryId, // backward compatibility
      categoryIds: providedCategoryIds, // array
      iconUrl,
      badge,
      basePrice,
      discountPrice,
      page,
      sections
    } = req.body;

    // Determine final category IDs
    const categoryIds = providedCategoryIds || (categoryId ? [categoryId] : []);

    if (categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one category'
      });
    }

    // Validate categories exist
    const categoriesCount = await Category.countDocuments({ _id: { $in: categoryIds } });
    if (categoriesCount !== categoryIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more categories not found'
      });
    }

    // Check if service with same title or slug exists
    const existingService = await Service.findOne({
      $or: [
        { title: title.trim() },
        { slug: slug?.trim().toLowerCase() }
      ]
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this title or slug already exists'
      });
    }

    // Helper to sanitize targetCategoryId
    const sanitizeId = (id) => id === '' ? null : id;

    const sanitizedPage = page ? { ...page } : {
      banners: [],
      ratingTitle: title.trim(),
      ratingValue: '',
      bookingsText: '',
      paymentOffersEnabled: true,
      paymentOffers: [],
      serviceCategoriesGrid: []
    };

    if (sanitizedPage.serviceCategoriesGrid) {
      sanitizedPage.serviceCategoriesGrid = sanitizedPage.serviceCategoriesGrid.map(item => ({
        ...item,
        targetCategoryId: sanitizeId(item.targetCategoryId)
      }));
    }

    const sanitizedSections = (sections || []).map(section => {
      const newSection = { ...section };
      if (Array.isArray(newSection.cards)) {
        newSection.cards = newSection.cards.map(card => ({
          ...card,
          targetCategoryId: sanitizeId(card.targetCategoryId)
        }));
      }
      return newSection;
    });

    const service = await Service.create({
      title: title.trim(),
      slug: slug?.trim().toLowerCase() || undefined,
      categoryIds: categoryIds,
      iconUrl: iconUrl || null,
      badge: badge?.trim() || null,
      routePath: `/user/${slug?.trim().toLowerCase() || title.trim().toLowerCase().replace(/\s+/g, '-')}`,
      basePrice: basePrice || 0,
      discountPrice: discountPrice || null,
      page: sanitizedPage,
      sections: sanitizedSections,
      status: SERVICE_STATUS.ACTIVE,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        id: service._id,
        title: service.title,
        slug: service.slug,
        categoryIds: service.categoryIds.map(c => c.toString()),
        iconUrl: service.iconUrl,
        badge: service.badge,
        routePath: service.routePath,
        page: service.page,
        sections: service.sections,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }
    });
  } catch (error) {
    console.error('Create service error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service with this title or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create service. Please try again.'
    });
  }
};

/**
 * Update service
 * PUT /api/admin/services/:id
 */
const updateService = async (req, res) => {
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
      categoryId, // backward compatibility
      categoryIds: providedCategoryIds, // array
      iconUrl,
      badge,
      basePrice,
      discountPrice,
      page,
      sections,
      status
    } = req.body;

    const categoryIds = providedCategoryIds || (categoryId ? [categoryId] : undefined);

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Validate categories if provided
    if (categoryIds) {
      const categoriesCount = await Category.countDocuments({ _id: { $in: categoryIds } });
      if (categoriesCount !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more categories not found'
        });
      }
    }

    // Check if title or slug conflicts with another service
    if (title || slug) {
      const existingService = await Service.findOne({
        _id: { $ne: id },
        $or: [
          title ? { title: title.trim() } : {},
          slug ? { slug: slug.trim().toLowerCase() } : {}
        ]
      });

      if (existingService) {
        return res.status(400).json({
          success: false,
          message: 'Service with this title or slug already exists'
        });
      }
    }

    // Update fields
    if (title !== undefined) service.title = title.trim();
    if (slug !== undefined) {
      service.slug = slug.trim().toLowerCase();
      service.routePath = `/user/${slug.trim().toLowerCase()}`;
    }
    if (categoryIds !== undefined) service.categoryIds = categoryIds;
    if (iconUrl !== undefined) service.iconUrl = iconUrl || null;
    if (badge !== undefined) service.badge = badge?.trim() || null;
    if (basePrice !== undefined) service.basePrice = Number(basePrice) || 0;
    if (discountPrice !== undefined) service.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (page !== undefined) service.page = page;
    if (sections !== undefined) {
      // Helper to sanitize targetCategoryId
      const sanitizeId = (id) => id === '' ? null : id;

      if (Array.isArray(sections)) {
        service.sections = sections.map(section => {
          const newSection = { ...section };

          // Sanitize card IDs in sections
          if (Array.isArray(newSection.cards)) {
            newSection.cards = newSection.cards.map(card => ({
              ...card,
              targetCategoryId: sanitizeId(card.targetCategoryId)
            }));
          }

          return newSection;
        });
      } else {
        service.sections = sections;
      }
    }
    if (status !== undefined) service.status = status;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service: {
        id: service._id,
        title: service.title,
        slug: service.slug,
        categoryIds: service.categoryIds.map(c => c.toString()),
        iconUrl: service.iconUrl,
        badge: service.badge,
        routePath: service.routePath,
        page: service.page,
        sections: service.sections,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }
    });
  } catch (error) {
    console.error('Update service error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service with this title or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service. Please try again.'
    });
  }
};

/**
 * Delete service (soft delete - set status to deleted)
 * DELETE /api/admin/services/:id
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Soft delete - set status to deleted
    service.status = SERVICE_STATUS.DELETED;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service. Please try again.'
    });
  }
};

/**
 * Update service page content
 * PATCH /api/admin/services/:id/page
 */
const updateServicePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.body;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (page !== undefined) {
      // Helper to sanitize targetCategoryId
      const sanitizeId = (id) => id === '' ? null : id;

      const sanitizedPage = { ...page };

      if (sanitizedPage.serviceCategoriesGrid) {
        sanitizedPage.serviceCategoriesGrid = sanitizedPage.serviceCategoriesGrid.map(item => ({
          ...item,
          targetCategoryId: sanitizeId(item.targetCategoryId)
        }));
      }

      if (sanitizedPage.paymentOffers) {
        sanitizedPage.paymentOffers = sanitizedPage.paymentOffers.map(item => ({
          ...item,
          targetCategoryId: sanitizeId(item.targetCategoryId)
        }));
      }

      if (sanitizedPage.banners) {
        sanitizedPage.banners = sanitizedPage.banners.map(item => ({
          ...item,
          targetCategoryId: sanitizeId(item.targetCategoryId)
        }));
      }

      service.page = {
        ...service.page,
        ...sanitizedPage
      };
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service page content updated successfully',
      service: {
        id: service._id,
        page: service.page
      }
    });
  } catch (error) {
    console.error('Update service page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service page. Please try again.'
    });
  }
};

/**
 * Upload service image
 * POST /api/admin/services/upload-image
 */
const uploadServiceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // req.file.path contains the full Cloudinary URL when using multer-storage-cloudinary
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: req.file.path
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServicePage,
  uploadServiceImage
};

