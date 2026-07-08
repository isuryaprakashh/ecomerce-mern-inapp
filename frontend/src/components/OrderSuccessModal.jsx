import React from 'react';
import { Check, Calendar, Mail, MapPin } from 'lucide-react';

export default function OrderSuccessModal({ orderDetails, onClose }) {
  if (!orderDetails) return null;

  const { orderId, paymentId, amount, shippingDetails } = orderDetails;

  return (
    <div className="modal-overlay">
      <div className="modal-content success-modal-content">
        {/* Pulsing check logo */}
        <div className="success-icon-wrapper">
          <Check size={36} strokeWidth={2.5} />
        </div>

        <h2 className="success-title">Order Confirmed</h2>
        <p className="success-text">
          Thank you for choosing Rose Bud. Your botanical treatment is being formulated and prepared for shipment.
        </p>

        {/* Invoice Summary Card */}
        <div className="success-meta">
          <div className="success-meta-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
            <span className="success-meta-label">Amount Paid</span>
            <span className="success-meta-val" style={{ color: 'var(--success-color)', fontSize: '1rem' }}>₹{amount}</span>
          </div>
          
          <div className="success-meta-row">
            <span className="success-meta-label">Order Reference</span>
            <span className="success-meta-val" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{orderId}</span>
          </div>

          <div className="success-meta-row">
            <span className="success-meta-label">Transaction ID</span>
            <span className="success-meta-val" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{paymentId}</span>
          </div>

          <div className="success-meta-row" style={{ marginTop: '6px', alignItems: 'flex-start' }}>
            <span className="success-meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Ship To</span>
            <span className="success-meta-val" style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 500, maxWidth: '200px' }}>
              {shippingDetails.name} <br />
              {shippingDetails.address}, {shippingDetails.city} - {shippingDetails.postalCode}
            </span>
          </div>

          <div className="success-meta-row" style={{ marginTop: '6px' }}>
            <span className="success-meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> Email</span>
            <span className="success-meta-val" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{shippingDetails.email}</span>
          </div>
        </div>

        {/* Closing CTA */}
        <button 
          className="btn-primary" 
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );
}
