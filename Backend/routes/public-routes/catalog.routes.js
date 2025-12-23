const express = require('express');
const router = express.Router();
const {
  getPublicCategories,
  getPublicServices,
  getPublicServiceBySlug,
  getPublicHomeContent
} = require('../../controllers/publicControllers/catalogController');

// Public routes - no authentication required
router.get('/categories', getPublicCategories);
router.get('/services', getPublicServices);
router.get('/services/slug/:slug', getPublicServiceBySlug);
router.get('/home-content', getPublicHomeContent);

module.exports = router;

