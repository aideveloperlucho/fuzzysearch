const Fuse = require('fuse.js');
const fs = require('fs').promises;
const path = require('path');

class SearchService {
  constructor() {
    this.inventory = [];
    this.fuse = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Load inventory data
      const dataPath = path.join(__dirname, '../../data/INVENTARIO_ACTUAL.json');
      const rawData = await fs.readFile(dataPath, 'utf8');
      this.inventory = JSON.parse(rawData);

      // Configure Fuse.js options
      const fuseOptions = {
        keys: [
          {
            name: 'marca_vehiculo',
            weight: 0.6
          },
          {
            name: 'descripcion_corta',
            weight: 0.4
          }
        ],
        threshold: parseFloat(process.env.FUSE_THRESHOLD) || 0.3,  // More strict
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 3,  // Require at least 3 characters
        findAllMatches: true,
        location: 0,
        distance: 100,  // Shorter distance for more precision
        useExtendedSearch: true,
        ignoreLocation: true,  // Position matters
        ignoreFieldNorm: true  // Field length matters
      };

      this.fuse = new Fuse(this.inventory, fuseOptions);
      this.isInitialized = true;
      
      console.log(`✅ Search service initialized with ${this.inventory.length} items`);
    } catch (error) {
      console.error('❌ Error initializing search service:', error);
      throw error;
    }
  }

  async search(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    // Only use options that actually matter for search
    const {
      limit = parseInt(process.env.DEFAULT_SEARCH_LIMIT) || 10,
      page = 1
    } = options;

    // Validate limit
    const maxLimit = parseInt(process.env.MAX_SEARCH_LIMIT) || 100;
    const actualLimit = Math.min(limit, maxLimit);

    try {
      // Perform search using constructor settings
      const results = this.fuse.search(query, {
        limit: actualLimit * page // Get more results for pagination
      });

      // Apply pagination
      const startIndex = (page - 1) * actualLimit;
      const endIndex = startIndex + actualLimit;
      const paginatedResults = results.slice(startIndex, endIndex);

      // Format results
      const formattedResults = paginatedResults.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches
      }));

      const searchTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          results: formattedResults,
          total: results.length,
          page,
          limit: actualLimit,
          totalPages: Math.ceil(results.length / actualLimit),
          query,
          searchTime: `${searchTime}ms`
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async searchByBrand(brand, options = {}) {
    return this.search(brand, {
      ...options,
      fields: ['marca_vehiculo']
    });
  }

  async searchByDescription(description, options = {}) {
    return this.search(description, {
      ...options,
      fields: ['descripcion_corta']
    });
  }

  async searchWithYearRange(query, searchYear, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    const {
      limit = parseInt(process.env.DEFAULT_SEARCH_LIMIT) || 10,
      page = 1
    } = options;

    // Validate limit
    const maxLimit = parseInt(process.env.MAX_SEARCH_LIMIT) || 100;
    const actualLimit = Math.min(limit, maxLimit);

    try {
      // Step 1: Perform fuzzy search for text
      const textResults = this.fuse.search(query, {
        limit: actualLimit * page * 2 // Get more results for filtering
      });

      // Step 2: Filter by year range if specified
      let filteredResults = textResults;
      if (searchYear && !isNaN(searchYear)) {
        filteredResults = textResults.filter(result => {
          const item = result.item;
          const itemYearFrom = item.anio_desde;
          const itemYearTo = item.anio_hasta;
          
          // Check if the search year falls within the item's year range
          return searchYear >= itemYearFrom && searchYear <= itemYearTo;
        });
      }

      // Step 3: Apply pagination to filtered results
      const startIndex = (page - 1) * actualLimit;
      const endIndex = startIndex + actualLimit;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      // Step 4: Format results
      const formattedResults = paginatedResults.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches
      }));

      const searchTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          results: formattedResults,
          total: filteredResults.length,
          page,
          limit: actualLimit,
          totalPages: Math.ceil(filteredResults.length / actualLimit),
          query,
          searchYear: searchYear || null,
          searchTime: `${searchTime}ms`,
          yearFiltered: searchYear ? true : false
        }
      };
    } catch (error) {
      console.error('Search with year range error:', error);
      throw error;
    }
  }

  async getVehicleBrands() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const brands = [...new Set(this.inventory.map(item => item.marca_vehiculo))];
    return {
      success: true,
      data: {
        brands: brands.sort(),
        total: brands.length
      }
    };
  }

  async getSearchStats() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const brands = [...new Set(this.inventory.map(item => item.marca_vehiculo))];
    const conditions = [...new Set(this.inventory.map(item => item.condicion))];
    const qualities = [...new Set(this.inventory.map(item => item.calidad_repuesto))];

    return {
      success: true,
      data: {
        totalItems: this.inventory.length,
        uniqueBrands: brands.length,
        brands: brands.sort(),
        conditions: conditions.sort(),
        qualities: qualities.sort(),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  async getItemById(productId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const item = this.inventory.find(item => item.producto_id === productId);
    
    if (!item) {
      return {
        success: false,
        message: 'Item not found'
      };
    }

    return {
      success: true,
      data: item
    };
  }
}

module.exports = new SearchService(); 