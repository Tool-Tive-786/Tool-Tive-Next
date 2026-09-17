"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/header.css';
import { getAllTools } from '@/lib/tools';
import SearchModal from '@/components/SearchModal';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBtnRef = useRef<HTMLButtonElement>(null);

  const tools = getAllTools();
  const categories = useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category)));
  }, [tools]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (e.key === '/' && !searchOpen && !isTyping) {
        e.preventDefault();
        setSearchOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape' && searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchOpen]);

  const handleCloseSearch = () => {
    setSearchOpen(false);
    searchBtnRef.current?.focus();
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="navbar-inner">
          <Link href="/" className="logo">
            <Image
              className="logo-mark"
              src="/brand/tooltive-tt-mark.png"
              alt=""
              width={973}
              height={681}
              priority
            />
            <span className="logo-wordmark">ToolTive.</span>
          </Link>

          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
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

          <div className="nav-actions">
            {/* SEARCH BUTTON */}
            <button
              type="button"
              className="nav-search-btn"
              id="searchBtn"
              ref={searchBtnRef}
              aria-label="Search tools and articles"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              title="Search (Press /)"
            >
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5"/>
                <path d="M15.5 15.5L21 21"/>
              </svg>
              <span>Search</span>
            </button>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-inner">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            {categories.map(cat => (
              <Link key={cat} href={`/all-tools/${cat}`} onClick={() => setMobileMenuOpen(false)} style={{ textTransform: 'capitalize' }}>
                {cat === 'pdf' ? 'PDF' : cat} Tools
              </Link>
            ))}
            <Link href="/all-tools" onClick={() => setMobileMenuOpen(false)}>All Tools</Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        </div>
      </nav>

      {/* SEARCH OVERLAY */}
      <SearchModal isOpen={searchOpen} onClose={handleCloseSearch} />
    </>
  );
}
