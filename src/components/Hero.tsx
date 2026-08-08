"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchTools } from '@/lib/search';
import { Tool } from '@/lib/tools';

export default function Hero() {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce the query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(handler);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const searchResults = searchTools(debouncedQuery).slice(0, 6); // Limit to 6 results
      setResults(searchResults);
      setIsDropdownOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsDropdownOpen(false);
    }
  }, [debouncedQuery]);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      setIsDropdownOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        const selectedTool = results[selectedIndex];
        setIsDropdownOpen(false);
        router.push(`/all-tools/${selectedTool.category}/${selectedTool.slug}`);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  const handleTagClick = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
    e.preventDefault();
    setQuery(text);
    if (searchInputRef.current) {
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
            <div className="hero-search-container" ref={searchContainerRef}>
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input 
                      type="text" 
                      ref={searchInputRef}
                      placeholder="Search for any tool (e.g., PDF Converter, Image Upscaler)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (query.trim().length > 0) setIsDropdownOpen(true);
                      }}
                      role="combobox"
                      aria-expanded={isDropdownOpen}
                      aria-controls="search-dropdown-list"
                      aria-autocomplete="list"
                    />
                    {query && (
                      <button 
                        className="clear-search-btn" 
                        onClick={() => {
                          setQuery('');
                          if (searchInputRef.current) searchInputRef.current.focus();
                        }}
                        aria-label="Clear search"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                    <button className="search-btn" onClick={handleSearchSubmit}>
                        <i className="fas fa-bolt"></i>
                        <span>Search</span>
                    </button>
                </div>

                {/* Live Search Dropdown */}
                {isDropdownOpen && (
                  <div className="search-dropdown" id="search-dropdown-list" role="listbox">
                    {results.length > 0 ? (
                      <>
                        {results.map((tool, index) => (
                          <Link 
                            key={tool.id}
                            href={`/all-tools/${tool.category}/${tool.slug}`}
                            className={`search-dropdown-item ${index === selectedIndex ? 'active' : ''}`}
                            onClick={() => setIsDropdownOpen(false)}
                            role="option"
                            aria-selected={index === selectedIndex}
                          >
                            <div className="search-item-icon" dangerouslySetInnerHTML={{ __html: tool.icon }} />
                            <div className="search-item-text">
                              <div className="search-item-title">{tool.title}</div>
                              <div className="search-item-cat">{tool.category.toUpperCase()}</div>
                            </div>
                          </Link>
                        ))}
                        <button 
                          className="search-dropdown-footer"
                          onClick={handleSearchSubmit}
                        >
                          View all results for "{query.trim()}" &rarr;
                        </button>
                      </>
                    ) : (
                      <div className="search-dropdown-empty">
                        <p>No tools found for "{query.trim()}"</p>
                        <span>Try another keyword or browse all tools.</span>
                      </div>
                    )}
                  </div>
                )}
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
