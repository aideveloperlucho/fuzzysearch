const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// Basic fuzzy search
router.get('/search', searchController.search);

// Search by specific fields
router.get('/search/brand', searchController.searchByBrand);
router.get('/search/description', searchController.searchByDescription);

// Advanced search with multiple filters
router.get('/search/advanced', searchController.advancedSearch);

// Search with year range validation
router.get('/search/year-range', searchController.searchWithYearRange);

// Get available vehicle brands
router.get('/vehicles', searchController.getVehicleBrands);

// Get search statistics
router.get('/stats', searchController.getSearchStats);

// Get specific item by ID
router.get('/item/:productId', searchController.getItemById);

module.exports = router; 