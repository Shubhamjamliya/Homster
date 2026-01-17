const Category = require('../../models/Category');
const Service = require('../../models/Service');
const HomeContent = require('../../models/HomeContent');

/**
 * Public Catalog Controllers
 * These endpoints are accessible without authentication for user app
 */

/**
 * Get all active categories for user app
 * GET /api/public/categories
 */
const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' })
      .select('title slug homeIconUrl homeBadge hasSaleBadge homeOrder showOnHome')
      .sort({ homeOrder: 1, createdAt: -1 })
      .lean();

    // Prepare initial category list
    const initialCategories = categories.map(cat => ({
      id: cat._id.toString(),
      title: cat.title,
      slug: cat.slug,
      icon: cat.homeIconUrl || '',
      badge: cat.homeBadge || '',
      hasSaleBadge: cat.hasSaleBadge || false,
      showOnHome: cat.showOnHome || false,
      homeOrder: cat.homeOrder || 0
    }));

    // Fetch services for these categories
    const categoryIds = categories.map(c => c._id);
    const services = await Service.find({
      categoryIds: { $in: categoryIds },
      status: 'active'
    }).select('title categoryIds').lean();

    // Map services to categories
    const categoriesWithServices = initialCategories.map(cat => {
      const catServices = services.filter(s =>
        s.categoryIds && s.categoryIds.some(id => id.toString() === cat.id)
      ).map(s => s.title);
      return { ...cat, subServices: catServices };
    });

    res.status(200).json({
      success: true,
      categories: categoriesWithServices
    });
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories. Please try again.'
    });
  }
};

/**
 * Get all active services for user app
 * GET /api/public/services
 */
const getPublicServices = async (req, res) => {
  try {
    const { categoryId, categorySlug } = req.query;

    // Build query
    const query = { status: 'active' };
    if (categoryId) {
      query.categoryIds = categoryId;
    }

    let services = await Service.find(query)
      .select('title slug iconUrl imageUrl badge categoryIds basePrice discountPrice sections')
      .sort({ createdAt: -1 })
      .lean();

    // If categorySlug is provided, filter by category
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, status: 'active' }).lean();
      if (category) {
        services = services.filter(s =>
          Array.isArray(s.categoryIds) &&
          s.categoryIds.some(id => id.toString() === category._id.toString())
        );
      }
    }

    res.status(200).json({
      success: true,
      services: services.map(svc => ({
        id: svc._id.toString(),
        title: svc.title,
        slug: svc.slug,
        icon: svc.iconUrl || '',
        imageUrl: svc.imageUrl || svc.iconUrl || '',
        badge: svc.badge || '',
        price: svc.basePrice || 0,
        originalPrice: svc.discountPrice ? (svc.basePrice + svc.discountPrice) : (svc.basePrice || 0),
        categoryId: svc.categoryIds && svc.categoryIds.length > 0 ? svc.categoryIds[0].toString() : null,
        categoryIds: (svc.categoryIds || []).map(id => id.toString()),
        sections: svc.sections || []
      }))
    });
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services. Please try again.'
    });
  }
};

/**
 * Get service by slug for user app
 * GET /api/public/services/:slug
 */
const getPublicServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Service.findOne({ slug, status: 'active' })
      .populate('categoryIds', 'title slug')
      .lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Remove _id from nested objects
    const cleanService = JSON.parse(JSON.stringify(service));
    const removeIds = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => {
          if (item && typeof item === 'object') {
            const { _id, ...rest } = item;
            return removeIds(rest);
          }
          return item;
        });
      } else if (obj && typeof obj === 'object') {
        const { _id, ...rest } = obj;
        return Object.keys(rest).reduce((acc, key) => {
          acc[key] = removeIds(rest[key]);
          return acc;
        }, {});
      }
      return obj;
    };

    // Format response
    const formattedService = {
      id: service._id.toString(),
      title: service.title,
      slug: service.slug,
      icon: service.iconUrl || '',
      badge: service.badge || '',
      category: service.categoryIds && service.categoryIds[0] ? {
        id: service.categoryIds[0]._id.toString(),
        title: service.categoryIds[0].title,
        slug: service.categoryIds[0].slug
      } : null,
      categories: (service.categoryIds || []).map(cat => ({
        id: cat._id.toString(),
        title: cat.title,
        slug: cat.slug
      })),
      page: service.page ? removeIds(service.page) : null,
      sections: service.sections ? removeIds(service.sections) : []
    };

    res.status(200).json({
      success: true,
      service: formattedService
    });
  } catch (error) {
    console.error('Get public service by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service. Please try again.'
    });
  }
};

/**
 * Get home content for user app
 * GET /api/public/home-content
 */
const getPublicHomeContent = async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne().lean();

    if (!homeContent) {
      return res.status(200).json({
        success: true,
        homeContent: {
          banners: [],
          promos: [],
          curated: [],
          noteworthy: [],
          booked: [],
          categorySections: []
        }
      });
    }

    // Format response
    const formattedContent = {
      banners: (homeContent.banners || []).map(banner => ({
        id: banner._id ? banner._id.toString() : banner.id || Date.now().toString(),
        imageUrl: banner.imageUrl || '',
        text: banner.text || '',
        targetCategoryId: banner.targetCategoryId ? banner.targetCategoryId.toString() : null,
        slug: banner.slug || '',
        targetServiceId: banner.targetServiceId ? banner.targetServiceId.toString() : null,
        scrollToSection: banner.scrollToSection || '',
        order: banner.order || 0
      })),
      promos: (homeContent.promos || []).map(promo => ({
        id: promo._id ? promo._id.toString() : promo.id || Date.now().toString(),
        imageUrl: promo.imageUrl || '',
        title: promo.title || '',
        subtitle: promo.subtitle || '',
        description: promo.description || '',
        buttonText: promo.buttonText || 'Explore',
        gradientClass: promo.gradientClass || '',
        targetCategoryId: promo.targetCategoryId ? promo.targetCategoryId.toString() : null,
        slug: promo.slug || '',
        targetServiceId: promo.targetServiceId ? promo.targetServiceId.toString() : null,
        scrollToSection: promo.scrollToSection || '',
        order: promo.order || 0
      })),
      curated: (homeContent.curated || []).map(item => ({
        id: item._id ? item._id.toString() : item.id || Date.now().toString(),
        imageUrl: item.imageUrl || '',
        gifUrl: item.gifUrl || '',
        youtubeUrl: item.youtubeUrl || '',
        title: item.title || '',
        targetCategoryId: item.targetCategoryId ? item.targetCategoryId.toString() : null,
        slug: item.slug || '',
        targetServiceId: item.targetServiceId ? item.targetServiceId.toString() : null,
        order: item.order || 0
      })),
      noteworthy: (homeContent.noteworthy || []).map(item => ({
        id: item._id ? item._id.toString() : item.id || Date.now().toString(),
        imageUrl: item.imageUrl || '',
        title: item.title || '',
        targetCategoryId: item.targetCategoryId ? item.targetCategoryId.toString() : null,
        slug: item.slug || '',
        targetServiceId: item.targetServiceId ? item.targetServiceId.toString() : null,
        order: item.order || 0
      })),
      booked: (homeContent.booked || []).map(item => ({
        id: item._id ? item._id.toString() : item.id || Date.now().toString(),
        imageUrl: item.imageUrl || '',
        title: item.title || '',
        rating: item.rating || '',
        reviews: item.reviews || '',
        price: item.price || '',
        originalPrice: item.originalPrice || '',
        discount: item.discount || '',
        targetCategoryId: item.targetCategoryId ? item.targetCategoryId.toString() : null,
        slug: item.slug || '',
        targetServiceId: item.targetServiceId ? item.targetServiceId.toString() : null,
        order: item.order || 0
      })),
      categorySections: (homeContent.categorySections || []).map(section => ({
        id: section._id ? section._id.toString() : section.id || Date.now().toString(),
        title: section.title || '',
        subtitle: section.subtitle || '',
        seeAllTargetCategoryId: section.seeAllTargetCategoryId ? section.seeAllTargetCategoryId.toString() : null,
        seeAllSlug: section.seeAllSlug || '',
        seeAllTargetServiceId: section.seeAllTargetServiceId ? section.seeAllTargetServiceId.toString() : null,
        cards: (section.cards || []).map(card => ({
          id: card._id ? card._id.toString() : card.id || Date.now().toString(),
          title: card.title || '',
          imageUrl: card.imageUrl || '',
          rating: card.rating || '',
          reviews: card.reviews || '',
          price: card.price || '',
          originalPrice: card.originalPrice || '',
          discount: card.discount || '',
          badge: card.badge || '',
          targetCategoryId: card.targetCategoryId ? card.targetCategoryId.toString() : null,
          slug: card.slug || '',
          targetServiceId: card.targetServiceId ? card.targetServiceId.toString() : null,
          order: card.order || 0
        })),
        order: section.order || 0
      })),
      isBannersVisible: homeContent.isBannersVisible ?? true,
      isPromosVisible: homeContent.isPromosVisible ?? true,
      isCuratedVisible: homeContent.isCuratedVisible ?? true,
      isNoteworthyVisible: homeContent.isNoteworthyVisible ?? true,
      isBookedVisible: homeContent.isBookedVisible ?? true,
      isCategorySectionsVisible: homeContent.isCategorySectionsVisible ?? true,
      isCategoriesVisible: homeContent.isCategoriesVisible ?? true
    };

    res.status(200).json({
      success: true,
      homeContent: formattedContent
    });
  } catch (error) {
    console.error('Get public home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home content. Please try again.'
    });
  }
};

module.exports = {
  getPublicCategories,
  getPublicServices,
  getPublicServiceBySlug,
  getPublicHomeContent
};

