import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

const CATEGORIES = ['All', 'Mists', 'Serums', 'Masks', 'Oils', 'Creams', 'Lips'];

export default function ProductCatalog({ 
  products, 
  activeCategory, 
  onCategoryChange, 
  searchQuery, 
  onSearchChange, 
  activeSort, 
  onSortChange, 
  onProductClick,
  isLoading
}) {
  return (
    <section id="shop" className="catalog-section">
      <div className="container">
        {/* Title */}
        <div className="catalog-header">
          <p className="uppercase-tracking">Sensory Botanicals</p>
          <h2 className="catalog-title">Shop The Collection</h2>
          <p className="catalog-subtitle">
            Indulge in botanical skincare formulated to revive, balance, and deeply hydrate your skin. Free from synthetic fragrances and parabens.
          </p>
        </div>

        {/* Dynamic Filters & Search Controller */}
        <div className="filter-bar">
          {/* Categories */}
          <div className="category-filters">
            {CATEGORIES.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="search-sort-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
              <Search className="search-icon-inside" size={18} strokeWidth={1.8} />
            </div>

            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '2px solid var(--border-color)',
              borderTopColor: 'var(--accent-rose)',
              borderRadius: '50%',
              animation: 'rotate 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Curating botanical extracts...</p>
            <style>{`
              @keyframes rotate {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🌿</span>
            <h3>No Products Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
              We couldn't find any products matching "{searchQuery}". Try selecting another category or refining your keywords.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
