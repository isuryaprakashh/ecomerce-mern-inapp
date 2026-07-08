import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { api } from '../utils/api.js';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let result;
      if (isLogin) {
        result = await api.login(formData.email, formData.password);
      } else {
        result = await api.register(formData.name, formData.email, formData.password);
      }

      onAuthSuccess(result);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Authentication failed. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '40px', flexDirection: 'column' }}
      >
        {/* Close */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close authentication">
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <p className="uppercase-tracking">Botanical Ritual</p>
          <h2 style={{ fontSize: '2.2rem', marginTop: '6px' }}>
            {isLogin ? "Sign In" : "Register"}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {isLogin 
              ? "Access your personal order rituals and profiles." 
              : "Register to track purchases and unlock early collections."}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#FDF2F2',
            border: '1px solid #FDE8E8',
            color: '#E02424',
            padding: '12px 16px',
            borderRadius: '2px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Jane Doe"
                  style={{ paddingLeft: '40px' }}
                  disabled={isSubmitting}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="jane.doe@example.com"
                style={{ paddingLeft: '40px' }}
                disabled={isSubmitting}
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                disabled={isSubmitting}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Connecting..." 
              : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{isLogin ? "Sign In" : "Register Account"} <ArrowRight size={16} /></span>
            }
          </button>
        </form>

        {/* Info seeding tip */}
        {isLogin && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            🔑 <strong>Demo Access (Admin):</strong> <br />
            Email: <code>admin@rosebud.com</code> <br />
            Password: <code>admin123</code>
          </div>
        )}

        {/* Switch links */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already registered? "}
          </span>
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
            }}
          >
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
