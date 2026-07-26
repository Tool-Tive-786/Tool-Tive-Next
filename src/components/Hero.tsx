"use client";

import React, { useRef } from 'react';
import Link from 'next/link';

export default function Hero() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleTagClick = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
    e.preventDefault();
    if (searchInputRef.current) {
      searchInputRef.current.value = text;
      searchInputRef.current.focus();
    }
  };

  return (
    <section className="hero" id="home">
        {/* Animated Background */}
        <div className="hero-bg">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
            <div className="grid-pattern"></div>
        </div>

        <div className="hero-content">
            {/* USP Badge */}
            <div className="hero-badge">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                </div>
                100% Free Tools — No Signup Required
            </div>

            {/* Headline & Sub-headline */}
            <h1>Every Tool You Need. <br />For <span className="highlight">Everything You Do.</span></h1>
            <p className="hero-desc">
                ToolTive provides a complete, high-quality toolkit for every field. Completely free, right in your browser.
            </p>

            {/* Premium Search Bar */}
            <div className="hero-search-container">
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input type="text" ref={searchInputRef} placeholder="Search for any tool (e.g., PDF Converter, Image Upscaler)..." />
                    <button className="search-btn">
                        <i className="fas fa-bolt"></i>
                        <span>Search</span>
                    </button>
                </div>
            </div>

            {/* Action Buttons (See All Tools + Blog) */}
            <div className="hero-actions">
                <Link href="#tools" className="btn-secondary">
                    <i className="fas fa-th-large"></i>
                    See All Tools
                </Link>
                <Link href="#blog" className="btn-tertiary">
                    <i className="fas fa-book-open"></i>
                    Read Our Blog
                </Link>
            </div>

            {/* Popular Categories Quick Access */}
            <div className="popular-tags">
                <span className="tag-label">Popular:</span>
                <a href="#" className="tag" onClick={(e) => handleTagClick(e, 'Image Tools')}>Image Tools</a>
                <a href="#" className="tag" onClick={(e) => handleTagClick(e, 'PDF Tools')}>PDF Tools</a>
                <a href="#" className="tag" onClick={(e) => handleTagClick(e, 'Text & Writing')}>Text & Writing</a>
                <a href="#" className="tag" onClick={(e) => handleTagClick(e, 'Developers')}>Developers</a>
                <a href="#" className="tag" onClick={(e) => handleTagClick(e, 'Calculators')}>Calculators</a>
            </div>
        </div>

        {/* Scroll Down Indicator */}
        <Link href="#tools" className="scroll-indicator">
            <span>Scroll</span>
            <i className="fas fa-chevron-down"></i>
        </Link>
    </section>
  );
}
