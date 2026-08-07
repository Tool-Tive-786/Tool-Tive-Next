"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import '@/styles/header.css';
import { getAllTools } from '@/lib/tools';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tools = getAllTools();
  const categories = useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category)));
  }, [tools]); useEffect(() => {
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
          {/* <div className="logo-icon"></div> */}
          Tool<span>Tive.</span>
        </Link>

        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li className="dropdown">
            <button className="dropdown-trigger">
              Tools
            </button>
            <div className="dropdown-menu">
              {categories.map(cat => (
                <Link key={cat} href={`/all-tools/${cat}`} className="dropdown-item" style={{ textTransform: 'capitalize' }}>
                  {cat === 'pdf' ? 'PDF' : cat}
                </Link>
              ))}
              <Link href="/all-tools" className="dropdown-item" style={{ borderTop: '1px solid var(--border-default)', marginTop: '4px', paddingTop: '10px' }}>All Tools</Link>
            </div>
          </li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/contact" className="nav-cta desktop-cta">Let's Build</Link>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {categories.map(cat => (
            <Link key={cat} href={`/all-tools/${cat}`} onClick={() => setMobileMenuOpen(false)} style={{ textTransform: 'capitalize' }}>
              {cat === 'pdf' ? 'PDF' : cat} Tools
            </Link>
          ))}
          <Link href="/all-tools" onClick={() => setMobileMenuOpen(false)}>All Tools</Link>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          <Link href="/contact" className="nav-cta mobile-cta" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', marginTop: '8px' }}>Let's Build</Link>
        </div>
      </div>
    </nav>
  );
}