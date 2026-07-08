import React from 'react';
import { Star } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  const { name, price, category, rating, image, reviewsCount } = product;

  return (
    <div className="product-card" onClick={onClick}>
      {/* Product Image Frame */}
      <div className="product-card-image-box">
        <img 
          src={image} 
          alt={name} 
          className="product-card-img"
          loading="lazy"
        />
        {/* Hover overlay with button */}
        <div className="product-card-overlay">
          <button className="product-card-quick-view">
            Quick View
          </button>
        </div>
      </div>

      {/* Info details */}
      <div className="product-card-info">
        <span className="product-card-category">{category}</span>
        
        <div className="product-card-name-row">
          <h3 className="product-card-name">{name}</h3>
          <span className="product-card-price">${price}</span>
        </div>

        {/* Rating Row */}
        <div className="product-card-rating">
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className="rating-star-icon"
                style={{ 
                  fill: i < Math.floor(rating) ? 'var(--accent-gold)' : 'transparent',
                  color: i < Math.floor(rating) ? 'var(--accent-gold)' : 'var(--border-color)'
                }} 
              />
            ))}
          </div>
          <span>({reviewsCount})</span>
        </div>
      </div>
    </div>
  );
}
