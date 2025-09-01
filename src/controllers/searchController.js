const searchService = require('../services/searchService');

class SearchController {
  async search(req, res, next) {
    try {
      const { q, limit, page, threshold } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
          example: '/api/search?q=Hyundai&limit=10&page=1'
        });
      }

      const options = {
        limit: parseInt(limit) || undefined,
        page: parseInt(page) || 1,
        threshold: parseFloat(threshold) || undefined
      };

      const result = await searchService.search(q.trim(), options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchByBrand(req, res, next) {
    try {
      const { brand, limit, page, threshold } = req.query;

      if (!brand || brand.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Brand parameter is required',
          example: '/api/search/brand?brand=Hyundai&limit=10&page=1'
        });
      }

      const options = {
        limit: parseInt(limit) || undefined,
        page: parseInt(page) || 1,
        threshold: parseFloat(threshold) || undefined
      };

      const result = await searchService.searchByBrand(brand.trim(), options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchByDescription(req, res, next) {
    try {
      const { description, limit, page, threshold } = req.query;

      if (!description || description.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Description parameter is required',
          example: '/api/search/description?description=manguera&limit=10&page=1'
        });
      }

      const options = {
        limit: parseInt(limit) || undefined,
        page: parseInt(page) || 1,
        threshold: parseFloat(threshold) || undefined
      };

      const result = await searchService.searchByDescription(description.trim(), options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getVehicleBrands(req, res, next) {
    try {
      const result = await searchService.getVehicleBrands();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSearchStats(req, res, next) {
    try {
      const result = await searchService.getSearchStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getItemById(req, res, next) {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
          example: '/api/item/PRD-2022'
        });
      }

      const result = await searchService.getItemById(productId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async advancedSearch(req, res, next) {
    try {
      const { 
        q, 
        brand, 
        condition, 
        quality, 
        yearFrom, 
        yearTo,
        limit, 
        page, 
        threshold 
      } = req.query;

      if (!q && !brand && !condition && !quality) {
        return res.status(400).json({
          success: false,
          message: 'At least one search parameter is required (q, brand, condition, or quality)',
          example: '/api/search/advanced?q=Hyundai&condition=Nuevo&limit=10'
        });
      }

      const options = {
        limit: parseInt(limit) || undefined,
        page: parseInt(page) || 1,
        threshold: parseFloat(threshold) || undefined
      };

      // Build search query
      let searchQuery = '';
      if (q) searchQuery += q + ' ';
      if (brand) searchQuery += brand + ' ';
      if (condition) searchQuery += condition + ' ';
      if (quality) searchQuery += quality + ' ';

      const result = await searchService.search(searchQuery.trim(), options);
      
      // Apply additional filters if needed
      if (yearFrom || yearTo) {
        result.data.results = result.data.results.filter(item => {
          const year = item.anio_desde;
          if (yearFrom && year < parseInt(yearFrom)) return false;
          if (yearTo && year > parseInt(yearTo)) return false;
          return true;
        });
        result.data.total = result.data.results.length;
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchWithYearRange(req, res, next) {
    try {
      const { q, year, limit, page } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
          example: '/api/search/year-range?q=Hyundai manguera&year=2016&limit=10'
        });
      }

      if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({
          success: false,
          message: 'Valid year parameter is required',
          example: '/api/search/year-range?q=Hyundai manguera&year=2016&limit=10'
        });
      }

      const searchYear = parseInt(year);
      const options = {
        limit: parseInt(limit) || undefined,
        page: parseInt(page) || 1
      };

      const result = await searchService.searchWithYearRange(q.trim(), searchYear, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController(); 