import React, { useState, useMemo } from 'react';
import './ShopByCategory.css';

/**
 * Enhanced ShopByCategory Component with Ultra-Modern Premium Medical Tech Aesthetic
 * 
 * Design Features:
 * - Medical green/teal gradients with soft backgrounds
 * - Modern cards with rounded-xl corners and subtle drop shadows
 * - Smooth hover animations (transition-all duration-300)
 * - Micro-interactions for active states
 * - Premium medical tech aesthetic
 * 
 * Features:
 * - Category filtering with active state highlighting
 * - Sorting (price, name, popularity)
 * - Search functionality
 * - Pagination
 * - Price range filter
 * - Favorites/Wishlist
 * - Inventory status indicator
 * - Promotions/discounts badge
 * - Product reviews display
 */

const ShopByCategory = ({ onProductSelect = null, apiEndpoint = null, itemsPerPage = 12 }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  const categories = [
    {
      id: 'wellness',
      name: 'Wellness',
      icon: '💪',
      description: 'Supplements & wellness products'
    },
    {
      id: 'firstaid',
      name: 'First Aid',
      icon: '🏥',
      description: 'First aid supplies'
    },
    {
      id: 'vitamins',
      name: 'Vitamins',
      icon: '💊',
      description: 'Vitamins & minerals'
    },
    {
      id: 'herbal',
      name: 'Herbal',
      icon: '🌿',
      description: 'Herbal remedies'
    },
    {
      id: 'babycare',
      name: 'Baby Care',
      icon: '👶',
      description: 'Baby care products'
    },
    {
      id: 'coldflu',
      name: 'Cold & Flu',
      icon: '🤒',
      description: 'Cold & flu relief'
    }
  ];

  const allProducts = [
    { id: 1, name: 'Multivitamin Plus', category: 'vitamins', price: 12.99, image: '💊', reviews: 4.5, reviewCount: 128, inventory: 45, promotion: 10, rating: 4.5 },
    { id: 2, name: 'Vitamin C 1000mg', category: 'vitamins', price: 8.99, image: '💊', reviews: 4.8, reviewCount: 256, inventory: 89, promotion: 0, rating: 4.8 },
    { id: 3, name: 'Vitamin D3', category: 'vitamins', price: 14.99, image: '💊', reviews: 4.6, reviewCount: 189, inventory: 0, promotion: 15, rating: 4.6 },
    { id: 4, name: 'Protein Powder', category: 'wellness', price: 24.99, image: '💪', reviews: 4.7, reviewCount: 342, inventory: 23, promotion: 20, rating: 4.7 },
    { id: 5, name: 'Energy Boost', category: 'wellness', price: 18.99, image: '💪', reviews: 4.4, reviewCount: 97, inventory: 156, promotion: 5, rating: 4.4 },
    { id: 6, name: 'Ginger Tea', category: 'herbal', price: 6.99, image: '🌿', reviews: 4.3, reviewCount: 74, inventory: 234, promotion: 0, rating: 4.3 },
    { id: 7, name: 'Chamomile Tea', category: 'herbal', price: 7.99, image: '🌿', reviews: 4.6, reviewCount: 156, inventory: 145, promotion: 12, rating: 4.6 },
    { id: 8, name: 'Echinacea Extract', category: 'herbal', price: 11.99, image: '🌿', reviews: 4.2, reviewCount: 63, inventory: 2, promotion: 0, rating: 4.2 },
    { id: 9, name: 'Bandages Assorted', category: 'firstaid', price: 4.99, image: '🏥', reviews: 4.7, reviewCount: 198, inventory: 567, promotion: 0, rating: 4.7 },
    { id: 10, name: 'First Aid Kit', category: 'firstaid', price: 19.99, image: '🏥', reviews: 4.8, reviewCount: 412, inventory: 34, promotion: 25, rating: 4.8 },
    { id: 11, name: 'Antiseptic Spray', category: 'firstaid', price: 5.99, image: '🏥', reviews: 4.5, reviewCount: 145, inventory: 89, promotion: 8, rating: 4.5 },
    { id: 12, name: 'Baby Lotion', category: 'babycare', price: 9.99, image: '👶', reviews: 4.9, reviewCount: 523, inventory: 145, promotion: 10, rating: 4.9 },
    { id: 13, name: 'Baby Shampoo', category: 'babycare', price: 8.99, image: '👶', reviews: 4.7, reviewCount: 267, inventory: 0, promotion: 15, rating: 4.7 },
    { id: 14, name: 'Diaper Rash Cream', category: 'babycare', price: 7.99, image: '👶', reviews: 4.8, reviewCount: 356, inventory: 203, promotion: 0, rating: 4.8 },
    { id: 15, name: 'Cough Syrup', category: 'coldflu', price: 9.99, image: '🤒', reviews: 4.4, reviewCount: 89, inventory: 12, promotion: 20, rating: 4.4 },
    { id: 16, name: 'Throat Lozenges', category: 'coldflu', price: 4.99, image: '🤒', reviews: 4.3, reviewCount: 112, inventory: 345, promotion: 0, rating: 4.3 },
    { id: 17, name: 'Decongestant Tablets', category: 'coldflu', price: 6.99, image: '🤒', reviews: 4.6, reviewCount: 201, inventory: 67, promotion: 18, rating: 4.6 }
  ];

  const fetchProductsByCategory = async (categoryId) => {
    if (!apiEndpoint) {
      const filtered = allProducts.filter(product => product.category === categoryId);
      setFilteredProducts(filtered);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${apiEndpoint}?category=${categoryId}`);
      const data = await response.json();
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      const filtered = allProducts.filter(product => product.category === categoryId);
      setFilteredProducts(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
    fetchProductsByCategory(categoryId);
  };

  const handleShowAll = () => {
    setActiveCategory(null);
    setFilteredProducts([]);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseFloat(e.target.value);
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleProductSelect = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const processedProducts = useMemo(() => {
    const productsToProcess = activeCategory ? filteredProducts : allProducts;
    
    let result = [...productsToProcess];

    if (searchQuery.trim()) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [activeCategory, filteredProducts, searchQuery, priceRange, sortBy]);

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = processedProducts.slice(startIndex, startIndex + itemsPerPage);

  const categoryName = activeCategory 
    ? categories.find(cat => cat.id === activeCategory)?.name 
    : 'All Products';

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  const getInventoryStatus = (inventory) => {
    if (inventory === 0) return { status: 'Out of Stock', className: 'out-of-stock' };
    if (inventory < 5) return { status: 'Low Stock', className: 'low-stock' };
    return { status: 'In Stock', className: 'in-stock' };
  };

  return (
    <div className="shop-by-category">
      {/* Hero Section with Medical Green/Teal Gradient */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Premium Health & Wellness</h1>
          <p className="hero-subtitle">Discover trusted medical products for your family's wellbeing</p>
        </div>
      </div>

      {/* Category Section */}
      <div className="category-section">
        <h2 className="section-title">Shop by Category</h2>
        
        <div className="categories-container">
          {/* All Products Button */}
          <button
            className={`category-card all-products-btn ${!activeCategory ? 'active' : ''}`}
            onClick={handleShowAll}
            aria-pressed={!activeCategory}
          >
            <span className="category-icon">🛍️</span>
            <span className="category-name">All Products</span>
            {!activeCategory && <span className="active-badge">Active</span>}
          </button>

          {/* Category Cards with Modern Styling */}
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              aria-pressed={activeCategory === category.id}
              title={category.description}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              {activeCategory === category.id && <span className="active-badge">Active</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Controls Section */}
      <div className="product-grid-section">
        {/* Grid Header */}
        <div className="grid-header">
          <h3 className="grid-title">{categoryName}</h3>
          <span className="product-count">
            {processedProducts.length} product{processedProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Controls Bar with Modern Design */}
        <div className="controls-bar">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
              aria-label="Search products"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* Sort Dropdown */}
          <div className="sort-box">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="price-filter">
            <label>Price Range:</label>
            <div className="price-inputs">
              <input
                type="number"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="price-input"
                aria-label="Minimum price"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="price-input"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading premium products...</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(product => {
                  const inventoryStatus = getInventoryStatus(product.inventory);
                  const isOutOfStock = inventoryStatus.status === 'Out of Stock';
                  const isFavorite = favorites.has(product.id);

                  return (
                    <div 
                      key={product.id} 
                      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                    >
                      {/* Favorite Button with Micro-interaction */}
                      <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(product.id)}
                        aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                        title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isFavorite ? '❤️' : '🤍'}
                      </button>

                      {/* Promotion Badge */}
                      {product.promotion > 0 && (
                        <div className="promotion-badge">
                          -{product.promotion}%
                        </div>
                      )}

                      {/* Inventory Status Badge */}
                      <div className={`inventory-badge ${inventoryStatus.className}`}>
                        {inventoryStatus.status}
                      </div>

                      {/* Product Image with Smooth Hover */}
                      <div className="product-image">{product.image}</div>

                      {/* Product Name */}
                      <h4 className="product-name">{product.name}</h4>

                      {/* Reviews */}
                      <div className="product-reviews">
                        <div className="stars">
                          {renderStars(product.reviews)}
                        </div>
                        <span className="review-count">({product.reviewCount})</span>
                      </div>

                      {/* Price */}
                      <div className="product-price-section">
                        {product.promotion > 0 ? (
                          <>
                            <span className="original-price">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="sale-price">
                              ${(product.price * (1 - product.promotion / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="product-price">${product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Add to Cart Button with Smooth Transition */}
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleProductSelect(product)}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="no-products">
                  <p>No products found matching your filters.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Previous page"
                >
                  ← Previous
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopByCategory;