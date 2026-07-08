import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Shield } from 'lucide-react';

export default function Header({ 
  cartCount, 
  onCartClick, 
  currentUser, 
  onAuthClick, 
  onLogout, 
  onOrdersClick, 
  onAdminClick 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={`header-nav glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        {/* Brand Logo */}
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          Rose Bud<span className="logo-dot"></span>
        </a>

        {/* Desktop Navigation Links */}
        {currentUser?.role !== 'admin' && (
          <ul className="nav-links">
            <li><a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
            <li><a href="#shop" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('shop'); }}>Shop</a></li>
            <li><a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About Us</a></li>
            <li><a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a></li>
          </ul>
        )}

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* User Profile / Login Action */}
          {currentUser ? (
            <div className="profile-dropdown-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                className="nav-action-btn flex-center" 
                style={{ gap: '6px' }}
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                aria-label="Toggle profile menu"
              >
                <User size={20} strokeWidth={1.8} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '80px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' && <Shield size={12} color="var(--accent-gold)" style={{ fill: 'var(--accent-gold)' }} />}
              </button>

              {/* Dropdown Card */}
              {isProfileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: '4px',
                  width: '200px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '8px 0',
                  animation: 'slideUp 0.2s ease-out'
                }}>
                  {currentUser.role === 'admin' && (
                    <button 
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--accent-rose)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => { setIsProfileDropdownOpen(false); onAdminClick(); }}
                    >
                      <Shield size={14} /> Admin Dashboard
                    </button>
                  )}

                  <button 
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => { setIsProfileDropdownOpen(false); onOrdersClick(); }}
                  >
                    <ShoppingBag size={14} /> My Orders
                  </button>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                  <button 
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: 'var(--text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => { setIsProfileDropdownOpen(false); onLogout(); }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="nav-action-btn flex-center" 
              style={{ gap: '6px', fontSize: '0.85rem', fontWeight: 500 }}
              onClick={onAuthClick}
            >
              <User size={20} strokeWidth={1.8} /> Sign In
            </button>
          )}

          {/* Cart Icon */}
          <button className="nav-action-btn" onClick={onCartClick} aria-label="Open Cart">
            <ShoppingBag size={21} strokeWidth={1.8} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Mobile Menu Icon */}
          {currentUser?.role !== 'admin' && (
            <button 
              className="nav-action-btn mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && currentUser?.role !== 'admin' && (
        <div style={{
          position: 'fixed',
          top: isScrolled ? '75px' : '90px',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 40px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <a href="#" style={{ fontSize: '1.1rem', fontWeight: 500 }} onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
          <a href="#shop" style={{ fontSize: '1.1rem', fontWeight: 500 }} onClick={(e) => { e.preventDefault(); scrollToSection('shop'); }}>Shop</a>
          <a href="#about" style={{ fontSize: '1.1rem', fontWeight: 500 }} onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About Us</a>
          <a href="#contact" style={{ fontSize: '1.1rem', fontWeight: 500 }} onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
        </div>
      )}
    </nav>
  );
}
