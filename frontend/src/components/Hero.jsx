import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import heroImage from '../assets/hero-image-pc.webp';

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
              src={heroImage} 
              alt="Rose Bud Skincare bottle surrounded by fresh pink roses and water splashes" 
              className="hero-img"
            />
          </div>


        </div>
      </div>
    </header>
  );
}
