"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/styles/header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="navbar-inner">
        <Link href="/" className="logo">
          <div className="logo-icon"><i className="fas fa-bolt"></i></div>
          Tool<span>Tive.</span>
        </Link>

        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li className="dropdown">
            <button className="dropdown-trigger">
              Tools
              <i className="fas fa-chevron-down" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
            </button>
            <div className="dropdown-menu">
              <Link href="/business/invoice-generator" className="dropdown-item">Business</Link>
              <Link href="/editing/free-image-refiner-and-upscaler-online" className="dropdown-item">Editing</Link>
              <Link href="/tools" className="dropdown-item" style={{ borderTop: '1px solid var(--border-default)', marginTop: '4px', paddingTop: '10px' }}>All Tools</Link>
            </div>
          </li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/contact" className="nav-cta desktop-cta">Let's Build</Link>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/business/invoice-generator" onClick={() => setMobileMenuOpen(false)}>Invoice Generator</Link>
          <Link href="/editing/free-image-refiner-and-upscaler-online" onClick={() => setMobileMenuOpen(false)}>Image Refiner</Link>
          <Link href="/tools" onClick={() => setMobileMenuOpen(false)}>All Tools</Link>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          <Link href="/contact" className="nav-cta mobile-cta" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', marginTop: '8px' }}>Let's Build</Link>
        </div>
      </div>
    </nav>
  );
}
