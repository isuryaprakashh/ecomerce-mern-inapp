import React from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const freeShippingThreshold = 75;
  const shipping = subtotal >= freeShippingThreshold ? 0 : (subtotal > 0 ? 5.99 : 0);
  const total = subtotal + shipping;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title flex-center" style={{ gap: '10px' }}>
            <ShoppingBag size={22} strokeWidth={1.8} /> Your Drawer
          </h2>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-message">
              <span style={{ fontSize: '2.5rem' }}>🌹</span>
              <h3>Your cart is empty</h3>
              <p>Add some luxury botanicals to your self-care ritual.</p>
              <button 
                className="btn-outline" 
                style={{ marginTop: '12px' }}
                onClick={onClose}
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <div>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <span className="cart-item-price">${item.price} each</span>
                  </div>
                  
                  <div className="cart-item-controls">
                    {/* Qty pick */}
                    <div className="quantity-picker">
                      <button 
                        className="quantity-picker-btn" 
                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="quantity-picker-value" style={{ fontSize: '0.8rem' }}>{item.quantity}</span>
                      <button 
                        className="quantity-picker-btn" 
                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button 
                      className="cart-item-remove" 
                      onClick={() => onRemoveItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Free shipping counter bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>
                  {subtotal >= freeShippingThreshold 
                    ? "✨ You qualify for Free Standard Shipping!" 
                    : `Spend $${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping`}
                </span>
                <span>${subtotal.toFixed(2)} / ${freeShippingThreshold}</span>
              </div>
              <div style={{ 
                height: '4px', 
                backgroundColor: 'var(--border-color)', 
                borderRadius: '2px', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--accent-rose)', 
                  width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={onCheckout}>
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
