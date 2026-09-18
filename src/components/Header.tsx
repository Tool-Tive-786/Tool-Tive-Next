"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/header.css';
import { getAllTools } from '@/lib/tools';
import SearchModal from '@/components/SearchModal';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBtnRef = useRef<HTMLButtonElement>(null);

  const tools = getAllTools();
  const categories = useMemo(() => {
    return Array.from(new Set(tools.map((tool) => tool.category)));
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
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar" aria-label="Primary navigation">
        <div className="navbar-inner">
          <Link href="/" className="logo" aria-label="ToolTive home">
            <Image
              className="logo-mark"
              src="/brand/tooltive-tt-mark-104.webp"
              alt=""
              width={104}
              height={73}
              sizes="(max-width: 768px) 40px, 44px"
              priority
            />
            <span className="logo-wordmark">ToolTive.</span>
          </Link>

          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li className="dropdown">
              <details onMouseLeave={(e) => e.currentTarget.removeAttribute('open')}>
                <summary className="dropdown-trigger">Tools</summary>
                <div className="dropdown-menu">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/all-tools/${category}`}
                      className="dropdown-item"
                      style={{ textTransform: 'capitalize' }}
                      onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}
                    >
                      {category === 'pdf' ? 'PDF' : category}
                    </Link>
                  ))}
                  <Link
                    href="/all-tools"
                    className="dropdown-item dropdown-all"
                    onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}
                  >
                    All Tools
                  </Link>
                </div>
              </details>
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
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5L21 21" />
              </svg>
              <span>Search</span>
            </button>

            <details className="mobile-menu-details">
              <summary className="mobile-menu-btn" aria-label="Menu">Menu</summary>
              <div className="mobile-menu">
                <div className="mobile-menu-inner">
                  <Link href="/">Home</Link>
                  <Link href="/about">About</Link>
                  {categories.map((category) => (
                    <Link key={category} href={`/all-tools/${category}`}>
                      {category === 'pdf' ? 'PDF' : category} Tools
                    </Link>
                  ))}
                  <Link href="/all-tools">All Tools</Link>
                  <Link href="/blog">Blog</Link>
                  <Link href="/contact">Contact</Link>
                </div>
              </div>
            </details>
          </div>
        </div>
      </nav>

      {/* SEARCH OVERLAY MODAL */}
      <SearchModal isOpen={searchOpen} onClose={handleCloseSearch} />
    </>
  );
}
