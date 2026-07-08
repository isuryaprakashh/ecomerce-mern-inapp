import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, RefreshCw, Mail, ShieldCheck } from 'lucide-react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import ProductDetailModal from './components/ProductDetailModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import OrderSuccessModal from './components/OrderSuccessModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import UserOrdersModal from './components/UserOrdersModal.jsx';
import { api } from './utils/api.js';

export default function App() {
  // Catalog State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('featured');
  const [catalogVersion, setCatalogVersion] = useState(0);

  // Authentication Session State
  const [currentUser, setCurrentUser] = useState(null);

  // Interface Modals State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderCompleteDetails, setOrderCompleteDetails] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('rosebud_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('rosebud_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load user session on boot
  useEffect(() => {
    const loadSession = async () => {
      const token = localStorage.getItem('rosebud_token');
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
          if (user.role === 'admin') {
            setIsAdminOpen(true);
          }
        } catch (err) {
          console.warn("Session auto-load failed. Token might be expired.");
          api.logout();
        }
      }
    };
    loadSession();
  }, []);

  // Fetch products from database / mock fallback API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProducts({
          category: activeCategory,
          search: searchQuery,
          sort: activeSort
        });
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [activeCategory, searchQuery, activeSort, catalogVersion]);

  // Cart Handlers
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item._id === product._id);
      if (existing) {
        return prevItems.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const handleCheckoutSubmit = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (details) => {
    setOrderCompleteDetails(details);
    setIsCheckoutOpen(false);
    setCartItems([]);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleSubscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('subscribing');
    setTimeout(() => {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 4000);
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Header 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOrdersClick={() => setIsOrdersOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
      />

      {/* Hero Spotlight */}
      <Hero 
        onExploreClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Philosophy Banner */}
      <section id="about" style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', padding: '20px', gap: '14px' }}>
            <Sparkles size={24} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.4rem' }}>Slow Botanical Alchemy</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We extract our botanicals in micro-batches to guarantee bio-active potency and absolute ingredient freshness.
            </p>
          </div>
          <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', padding: '20px', gap: '14px' }}>
            <Heart size={24} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.4rem' }}>Ethically Cultivated</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Sourced directly from family-run farms in Bulgaria and Provence. Vegan, cruelty-free, and wild-harvested.
            </p>
          </div>
          <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', padding: '20px', gap: '14px' }}>
            <ShieldCheck size={24} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.4rem' }}>Clean Integrity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Zero parabens, synthetic colors, or artificial fillers. Just 100% natural healing power for your skin.
            </p>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <ProductCatalog 
        products={products}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        onProductClick={setSelectedProduct}
        isLoading={isLoading}
      />

      {/* Newsletter Signup */}
      <section id="contact" style={{ padding: '100px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <p className="uppercase-tracking" style={{ marginBottom: '12px' }}>Rose Bud Journal</p>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Receive Botanical Rituals</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>
            Subscribe to our seasonal journal to receive skincare wisdom, ingredient spotlights, and exclusive early access to product releases.
          </p>

          <form onSubmit={handleSubscribeNewsletter} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <input 
              type="email" 
              placeholder="Your email address" 
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              style={{
                flexGrow: 1,
                border: '1px solid var(--border-color)',
                padding: '14px 20px',
                fontSize: '0.9rem',
                borderRadius: '2px',
                backgroundColor: 'var(--bg-primary)'
              }}
              disabled={newsletterStatus === 'subscribing'}
            />
            <button 
              type="submit" 
              className="btn-primary"
              style={{ minWidth: '130px' }}
              disabled={newsletterStatus === 'subscribing'}
            >
              {newsletterStatus === 'subscribing' ? <RefreshCw className="spinning-fast" size={16} /> : "Subscribe"}
            </button>
          </form>

          {newsletterStatus === 'success' && (
            <p style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginTop: '12px', fontWeight: 500 }}>
              ✓ Welcome to the ritual. Please check your inbox for verification.
            </p>
          )}
          <style>{`
            .spinning-fast { animation: spin 0.8s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <span className="footer-logo">Rose Bud</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', maxWidth: '240px' }}>
                Formulating clean, organic botanical treatments designed to support skin longevity and natural radiance.
              </p>
            </div>
            <div>
              <h4 className="footer-col-title">Collections</h4>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#shop" onClick={() => setActiveCategory('Mists')}>Facial Mists</a></li>
                <li className="footer-link-item"><a href="#shop" onClick={() => setActiveCategory('Serums')}>Elixir Serums</a></li>
                <li className="footer-link-item"><a href="#shop" onClick={() => setActiveCategory('Masks')}>Clay Treatments</a></li>
                <li className="footer-link-item"><a href="#shop" onClick={() => setActiveCategory('Oils')}>Face Oils</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Assistance</h4>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#">Ritual Guide</a></li>
                <li className="footer-link-item"><a href="#">Shipping & Returns</a></li>
                <li className="footer-link-item"><a href="#">Ingredient Library</a></li>
                <li className="footer-link-item"><a href="#">FAQ Helpline</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Our Boutique</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                Rose Bud Atelier <br />
                28 Rue de la Rose, Provence, France <br />
                support@rosebudskincare.com
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: '0.8' + 'rem', color: 'var(--text-light)' }}>
              &copy; {new Date().getFullYear()} Rose Bud Organic. Crafted for luxury, clean beauty.
            </p>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Overlay Modals & Drawers --- */}

      {/* Auth Modal */}
      {isAuthOpen && (
        <AuthModal 
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin') {
              setIsAdminOpen(true);
            }
          }}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && currentUser?.role === 'admin' && (
        <AdminDashboard 
          onClose={() => setIsAdminOpen(false)}
          onProductsUpdated={() => setCatalogVersion(v => v + 1)}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      )}

      {/* User Orders Modal */}
      {isOrdersOpen && (
        <UserOrdersModal 
          onClose={() => setIsOrdersOpen(false)}
        />
      )}

      {/* Product Details Drawer/Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutSubmit}
      />

      {/* Checkout details collector */}
      {isCheckoutOpen && (
        <CheckoutModal 
          cartItems={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {/* Order Confirmed Splash */}
      {orderCompleteDetails && (
        <OrderSuccessModal 
          orderDetails={orderCompleteDetails}
          onClose={() => setOrderCompleteDetails(null)}
        />
      )}
    </div>
  );
}
