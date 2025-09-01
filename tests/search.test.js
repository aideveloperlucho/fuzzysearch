const request = require('supertest');
const app = require('../src/app');
const searchService = require('../src/services/searchService');

describe('FuzzySearch API', () => {
  beforeAll(async () => {
    // Initialize search service before tests
    await searchService.initialize();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Search Endpoints', () => {
    it('should perform basic fuzzy search', async () => {
      const response = await request(app)
        .get('/api/search?q=Hyundai&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('query', 'Hyundai');
      expect(response.body.data.results.length).toBeLessThanOrEqual(5);
    });

    it('should return error for missing query', async () => {
      const response = await request(app)
        .get('/api/search?limit=5')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Search query is required');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/search?q=manguera&limit=3&page=1')
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('limit', 3);
      expect(response.body.data.results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Search by Brand', () => {
    it('should search by vehicle brand', async () => {
      const response = await request(app)
        .get('/api/search/brand?brand=Toyota&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeInstanceOf(Array);
      
      // Check that all results contain Toyota brand
      response.body.data.results.forEach(item => {
        expect(item.marca_vehiculo).toContain('Toyota');
      });
    });
  });

  describe('Search by Description', () => {
    it('should search by description', async () => {
      const response = await request(app)
        .get('/api/search/description?description=sensor&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeInstanceOf(Array);
    });
  });

  describe('Vehicle Brands', () => {
    it('should return all vehicle brands', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('brands');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.brands).toBeInstanceOf(Array);
      expect(response.body.data.brands.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should return search statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalItems');
      expect(response.body.data).toHaveProperty('uniqueBrands');
      expect(response.body.data).toHaveProperty('brands');
      expect(response.body.data).toHaveProperty('conditions');
      expect(response.body.data).toHaveProperty('qualities');
    });
  });

  describe('Get Item by ID', () => {
    it('should return item by product ID', async () => {
      const response = await request(app)
        .get('/api/item/PRD-2022')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('producto_id', 'PRD-2022');
      expect(response.body.data).toHaveProperty('marca_vehiculo');
      expect(response.body.data).toHaveProperty('descripcion_corta');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/item/NON-EXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Item not found');
    });
  });

  describe('Advanced Search', () => {
    it('should perform advanced search with filters', async () => {
      const response = await request(app)
        .get('/api/search/advanced?q=Hyundai&condition=Nuevo&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeInstanceOf(Array);
    });

    it('should return error for advanced search without parameters', async () => {
      const response = await request(app)
        .get('/api/search/advanced?limit=5')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('At least one search parameter is required');
    });
  });

  describe('Search with Year Range', () => {
    it('should search with year range validation', async () => {
      const response = await request(app)
        .get('/api/search/year-range?q=Hyundai manguera&year=2016&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('searchYear', 2016);
      expect(response.body.data).toHaveProperty('yearFiltered', true);
    });

    it('should return error for missing query', async () => {
      const response = await request(app)
        .get('/api/search/year-range?year=2016&limit=5')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Search query is required');
    });

    it('should return error for invalid year', async () => {
      const response = await request(app)
        .get('/api/search/year-range?q=Hyundai&year=invalid&limit=5')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valid year parameter is required');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
  });
}); 