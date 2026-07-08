import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, RefreshCw } from 'lucide-react';
import { api } from '../utils/api.js';

export default function UserOrdersModal({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '650px', 
          width: '95vw',
          maxHeight: '80vh',
          flexDirection: 'column', 
          padding: '40px',
          overflowY: 'auto'
        }}
      >
        {/* Close */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close orders modal">
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <p className="uppercase-tracking">Personal Ritual Ledger</p>
          <h2 style={{ fontSize: '2.2rem', marginTop: '6px' }}>Your Order History</h2>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex-center" style={{ height: '200px' }}>
            <RefreshCw size={24} className="spinning" />
            <style>{`.spinning { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-center" style={{ height: '200px', flexDirection: 'column', color: 'var(--text-light)', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🌿</span>
            <p>No orders registered yet under your profile.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div 
                key={order.orderId}
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px',
                  padding: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  fontSize: '0.85rem'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Ref: </span>
                    <code style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{order.orderId}</code>
                  </div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span style={{ 
                      color: '#FFF', 
                      backgroundColor: order.status === 'paid' ? 'var(--success-color)' : '#E02424',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items and sum */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div>
                    <ul style={{ paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.name} (x{item.quantity}) — ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Total Paid</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--accent-rose)' }}>₹{order.amount}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
