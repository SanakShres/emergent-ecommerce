import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Star, SlidersHorizontal } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'created_at'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
      params.sort = filters.sort;

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const newParams = {};
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) newParams[k] = newFilters[k];
    });
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen" data-testid="products-page">
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4" data-testid="products-title">
            {filters.category || 'All Products'}
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="products-count">
            {products.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1" data-testid="filters-sidebar">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2" data-testid="filters-title">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" data-testid="search-label">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="w-full input-underline"
                  data-testid="search-input"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" data-testid="category-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full input-underline"
                  data-testid="category-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" data-testid="price-range-label">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-1/2 input-underline"
                    data-testid="min-price-input"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-1/2 input-underline"
                    data-testid="max-price-input"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" data-testid="sort-label">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full input-underline"
                  data-testid="sort-select"
                >
                  <option value="created_at">Newest</option>
                  <option value="base_price">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({ category: '', search: '', minPrice: '', maxPrice: '', sort: 'created_at' });
                  setSearchParams({});
                }}
                className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
                data-testid="clear-filters-button"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12" data-testid="loading-spinner">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12" data-testid="no-products">
                <p className="text-lg text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" data-testid="products-grid">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group"
                    data-testid={`product-card-${product.id}`}
                  >
                    <div className="relative aspect-square bg-secondary mb-4 overflow-hidden">
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        data-testid={`product-image-${product.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground" data-testid={`product-category-${product.id}`}>{product.category}</p>
                      <h3 className="font-medium" data-testid={`product-name-${product.id}`}>{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center" data-testid={`product-rating-${product.id}`}>
                          <Star className="w-4 h-4 fill-current text-primary" />
                          <span className="text-sm ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground" data-testid={`product-review-count-${product.id}`}>({product.review_count})</span>
                      </div>
                      <p className="text-lg font-semibold" data-testid={`product-price-${product.id}`}>${product.base_price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
