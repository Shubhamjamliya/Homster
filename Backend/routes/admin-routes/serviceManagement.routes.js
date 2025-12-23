const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServicePage,
  uploadServiceImage
} = require('../../controllers/adminControllers/serviceController');
const { uploadImage } = require('../../middleware/uploadMiddleware');

// Validation rules
const createServiceValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Service title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('categoryIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one category is required')
    .custom((ids) => {
      if (ids && ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('One or more category IDs are invalid');
      }
      return true;
    }),
  body('slug')
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a non-negative number'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be active, inactive, or deleted')
];

const updateServiceValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Service title cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array')
    .custom((ids) => {
      if (ids && ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('One or more category IDs are invalid');
      }
      return true;
    }),
  body('slug')
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a non-negative number'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be active, inactive, or deleted')
];

// Routes
// GET /api/admin/services - Get all services
router.get('/services', authenticate, isAdmin, getAllServices);

// GET /api/admin/services/:id - Get single service
router.get('/services/:id', authenticate, isAdmin, getServiceById);

// POST /api/admin/services - Create new service
router.post('/services', authenticate, isAdmin, createServiceValidation, createService);

// PUT /api/admin/services/:id - Update service
router.put('/services/:id', authenticate, isAdmin, updateServiceValidation, updateService);

// DELETE /api/admin/services/:id - Delete service (soft delete)
router.delete('/services/:id', authenticate, isAdmin, deleteService);

// PATCH /api/admin/services/:id/page - Update service page content
router.patch('/services/:id/page', authenticate, isAdmin, updateServicePage);

// POST /api/admin/services/upload-image - Upload service image
router.post('/services/upload-image', authenticate, isAdmin, uploadImage, uploadServiceImage);

module.exports = router;

// Updated to use new uploadMiddleware structure
