# FuzzySearch API

A powerful fuzzy search API built with Node.js and Fuse.js for searching vehicle inventory data. This API provides intelligent fuzzy matching capabilities across vehicle brands and product descriptions.

## 🚀 Features

- **Fuzzy Search**: Intelligent search using Fuse.js with configurable thresholds
- **Multi-field Search**: Search across `marca_vehiculo` and `descripcion_corta` fields
- **Advanced Filtering**: Filter by brand, condition, quality, and year range
- **Pagination**: Built-in pagination support for large result sets
- **RESTful API**: Clean and intuitive REST endpoints
- **Comprehensive Testing**: Full test coverage with Jest
- **Postman Collection**: Ready-to-use API testing collection

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fuzzysearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   FUSE_THRESHOLD=0.3
   DEFAULT_SEARCH_LIMIT=10
   MAX_SEARCH_LIMIT=100
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔍 API Endpoints

### Health Check
- `GET /health` - Check API health status

### Basic Search
- `GET /api/search?q={query}&limit={limit}&page={page}&threshold={threshold}` - Basic fuzzy search

### Field-Specific Search
- `GET /api/search/brand?brand={brand}&limit={limit}&page={page}` - Search by vehicle brand
- `GET /api/search/description?description={description}&limit={limit}&page={page}` - Search by description

### Advanced Search
- `GET /api/search/advanced?q={query}&brand={brand}&condition={condition}&quality={quality}&yearFrom={year}&yearTo={year}&limit={limit}&page={page}` - Advanced search with filters

### Data Endpoints
- `GET /api/vehicles` - Get all available vehicle brands
- `GET /api/stats` - Get search statistics
- `GET /api/item/{productId}` - Get specific item by product ID

## 📝 Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `q` | string | Search query | Required |
| `limit` | number | Number of results per page | 10 |
| `page` | number | Page number for pagination | 1 |
| `threshold` | number | Fuse.js threshold (0-1, lower = more strict) | 0.3 |
| `brand` | string | Vehicle brand filter | - |
| `condition` | string | Item condition filter | - |
| `quality` | string | Item quality filter | - |
| `yearFrom` | number | Minimum year filter | - |
| `yearTo` | number | Maximum year filter | - |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `FUSE_THRESHOLD` | Fuse.js search threshold | 0.3 |
| `DEFAULT_SEARCH_LIMIT` | Default results per page | 10 |
| `MAX_SEARCH_LIMIT` | Maximum results per page | 100 |

### Fuse.js Configuration

The search service is configured with the following Fuse.js options:

```javascript
{
  keys: [
    { name: 'marca_vehiculo', weight: 0.6 },
    { name: 'descripcion_corta', weight: 0.4 }
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  findAllMatches: true,
  location: 0,
  distance: 100,
  useExtendedSearch: true
}
```

## 📊 Example Usage

### Basic Search
```bash
curl "http://localhost:3000/api/search?q=Hyundai&limit=5"
```

### Search by Brand
```bash
curl "http://localhost:3000/api/search/brand?brand=Toyota&limit=10"
```

### Advanced Search
```bash
curl "http://localhost:3000/api/search/advanced?q=Hyundai&condition=Nuevo&yearFrom=2015&yearTo=2020&limit=10"
```

### Get Statistics
```bash
curl "http://localhost:3000/api/stats"
```

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "results": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "query": "Hyundai",
    "searchTime": "15ms"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Search query is required",
  "example": "/api/search?q=Hyundai&limit=10&page=1"
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
The test suite covers:
- Health check endpoint
- Basic search functionality
- Field-specific searches
- Advanced search with filters
- Error handling
- Pagination
- Data retrieval endpoints

## 📚 Postman Collection

Import the Postman collection from `postman/FuzzySearch_API.postman_collection.json` to test all endpoints with pre-configured requests.

The collection includes:
- Health check
- Basic search examples
- Brand-specific searches
- Description searches
- Advanced search scenarios
- Data retrieval endpoints
- Error case testing

## 🏗️ Project Structure

```
fuzzysearch/
├── src/
│   ├── controllers/
│   │   └── searchController.js    # HTTP request handlers
│   ├── services/
│   │   └── searchService.js       # Fuse.js search logic
│   ├── routes/
│   │   └── searchRoutes.js        # API route definitions
│   ├── middleware/
│   │   └── errorHandler.js        # Error handling middleware
│   └── app.js                     # Express application setup
├── data/
│   └── INVENTARIO_ACTUAL.json     # Inventory data
├── tests/
│   └── search.test.js             # Test suite
├── postman/
│   └── FuzzySearch_API.postman_collection.json
├── package.json
├── env.example
├── .gitignore
└── README.md
```

## 🔍 Search Examples

### Vehicle Brand Searches
- `Hyundai` - Find all Hyundai vehicles
- `Toyota` - Find all Toyota vehicles
- `Great Wall` - Find all Great Wall vehicles

### Description Searches
- `manguera` - Find radiator hoses
- `pastillas` - Find brake pads
- `sensor` - Find sensors
- `bujías` - Find spark plugs

### Combined Searches
- `Hyundai manguera` - Find Hyundai radiator hoses
- `Toyota sensor` - Find Toyota sensors

## 🚀 Performance

- **Search Speed**: Typically < 50ms for most queries
- **Memory Usage**: Optimized for large datasets
- **Scalability**: Designed to handle thousands of inventory items

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the test examples
- Use the Postman collection for testing
- Open an issue for bugs or feature requests 