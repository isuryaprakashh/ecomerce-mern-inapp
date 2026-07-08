import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Check } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Product Image */}
        <div className="product-detail-img-box">
          <img src={product.image} alt={product.name} className="product-detail-img" />
        </div>

        {/* Product details */}
        <div className="product-detail-info-box">
          <span className="product-detail-category">{product.category}</span>
          <h2 className="product-detail-name">{product.name}</h2>
          
          <div className="product-detail-price-row">
            <span className="product-detail-price">${product.price}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: 500 }}>
              ✓ In Stock & Fresh
            </span>
          </div>

          <p className="product-detail-description">
            {product.description}
          </p>

          {/* Details Collapsible/Information blocks */}
          <div className="product-detail-meta-tabs">
            <div className="meta-tab-item">
              <h4 className="meta-tab-title">Key Benefits</h4>
              <p className="meta-tab-content">{product.benefits}</p>
            </div>
            <div className="meta-tab-item">
              <h4 className="meta-tab-title">Full Ingredients</h4>
              <p className="meta-tab-content" style={{ fontStyle: 'italic' }}>{product.ingredients}</p>
            </div>
          </div>

          {/* Quantity and Checkout buttons */}
          <div className="product-detail-actions">
            <div className="quantity-picker">
              <button className="quantity-picker-btn" onClick={handleDecrement} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="quantity-picker-value">{quantity}</span>
              <button className="quantity-picker-btn" onClick={handleIncrement} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>

            <button 
              className="btn-primary" 
              style={{ 
                flexGrow: 1, 
                backgroundColor: isAdded ? 'var(--success-color)' : 'var(--accent-rose)' 
              }}
              onClick={handleAdd}
              disabled={isAdded}
            >
              {isAdded ? (
                <>
                  <Check size={18} /> Added to Drawer
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add to Cart — ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
