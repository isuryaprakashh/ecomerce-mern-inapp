import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <header className="hero-section">
      <div className="container hero-grid">
        {/* Editorial Text Column */}
        <div className="hero-content">
          <p className="uppercase-tracking hero-subtitle flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
            <Leaf size={14} /> 100% Organic & Clean Botanicals
          </p>
          <h1 className="hero-title">
            Unlock Your Skin’s <br />
            <span className="serif-italic text-gold">Natural Glow</span>
          </h1>
          <p className="hero-description">
            Experience the exquisite purity of wild-harvested Bulgarian roses. 
            We capture the finest botanical essences to deliver clean, deeply nourishing 
            skincare that honors your skin's natural wisdom.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onExploreClick}>
              Explore Collection <ArrowRight size={16} />
            </button>
            <a href="#about" className="btn-secondary flex-center" onClick={(e) => {
              e.preventDefault();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Our Philosophy
            </a>
          </div>
        </div>

        {/* Visual Showcase Column */}
        <div className="hero-image-wrapper">
          <div className="hero-image-container">
            <img 
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop" 
              alt="Rose Bud Skincare bottle surrounded by fresh pink roses and water splashes" 
              className="hero-img"
            />
          </div>

          {/* Luxury Floating Tag */}
          <div className="hero-floating-card glass">
            <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)'
              }}>
                ✨
              </div>
              <div>
                <h3 className="floating-card-title">Pure Damascus Rose</h3>
                <p className="floating-card-text">Every drop contains essences of over 100 hand-picked rose petals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
