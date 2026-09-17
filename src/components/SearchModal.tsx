"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { getAllTools } from '@/lib/tools';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  name: string;
  url: string;
  cat: string;
  type: 'tool' | 'blog';
  tags?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  pdf: 'PDF & Files',
  compress: 'Images',
  business: 'Business',
  seo: 'SEO',
};

const BLOG_ITEMS: SearchItem[] = [
  {
    id: 'blog-profit-margin',
    name: 'How to Calculate Profit Margin: Formula, Examples, and Pricing Tips',
    url: '/blog/business/how-to-calculate-profit-margin',
    cat: 'Business',
    type: 'blog',
    tags: ['Profit Margin', 'Business Pricing', 'Markup', 'Business Tools', 'Formula'],
  },
  {
    id: 'blog-qwen',
    name: 'Qwen3.8-Max for Coding: Why It Stands Out in 2026',
    url: '/blog/ai/qwen3-8-max-for-coding',
    cat: 'AI',
    type: 'blog',
    tags: ['Qwen3.8-Max', 'AI Coding', 'Software Development', 'Next.js', 'React', 'TypeScript', 'AI'],
  },
  {
    id: 'blog-invoice',
    name: 'Free Invoice Generator Online | Create Professional Invoices',
    url: '/blog/business/free-invoice-generator-online',
    cat: 'Business',
    type: 'blog',
    tags: ['Invoice Generator', 'Free Tools', 'PDF Export', 'Word Export', 'Billing'],
  },
];

function renderCatIcon(cat: string) {
  const k = cat.toLowerCase();
  if (k.includes('pdf')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
        <path d="M13 3v6h6" />
      </svg>
    );
  }
  if (k.includes('image') || k.includes('compress')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path d="M4.5 16.5l4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5" />
      </svg>
    );
  }
  if (k.includes('text') || k.includes('code')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4L7.5 20" />
        <path d="M16.5 4L15 20" />
        <path d="M4 9h16" />
        <path d="M3.5 15h16" />
      </svg>
    );
  }
  if (k.includes('seo')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7.2l9.3 9.3a1.5 1.5 0 0 1 0 2.1l-5.1 5.1a1.5 1.5 0 0 1-2.1 0L4 11.2V4z" />
        <circle cx="8.2" cy="8.2" r="1.4" />
      </svg>
    );
  }
  // business / default
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </svg>
  );
}

function renderBlogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M7 9h10" />
      <path d="M7 13h7" />
      <path d="M7 16.5h4" />
    </svg>
  );
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isOpenClass, setIsOpenClass] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toolItems: SearchItem[] = useMemo(() => {
    const rawTools = getAllTools();
    return rawTools.map((t) => ({
      id: t.id,
      name: t.cardTitle || t.title,
      url: `/all-tools/${t.category}/${t.slug}`,
      cat: CATEGORY_LABELS[t.category] || t.category,
      type: 'tool' as const,
      tags: t.tags || [],
    }));
  }, []);

  // Filter tools and blogs ONLY when query is typed
  const { toolResults, blogResults, flatList } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { toolResults: [], blogResults: [], flatList: [] };
    }

    const toolR = toolItems.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q);
      const matchCat = t.cat.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      return matchName || matchCat || matchTag;
    }).slice(0, 6);

    const blogR = BLOG_ITEMS.filter((b) => {
      const matchTitle = b.name.toLowerCase().includes(q);
      const matchCat = b.cat.toLowerCase().includes(q);
      const matchTag = b.tags?.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchCat || matchTag;
    }).slice(0, 4);

    const flatList: SearchItem[] = [...toolR, ...blogR];
    return { toolResults: toolR, blogResults: blogR, flatList };
  }, [query, toolItems]);

  // Reset selected item when results change
  useEffect(() => {
    setSel(flatList.length > 0 ? 0 : -1);
  }, [flatList.length, query]);

  // Auto-scroll selected row into view
  useEffect(() => {
    if (sel >= 0 && bodyRef.current) {
      const rows = bodyRef.current.querySelectorAll('.sres');
      if (rows[sel]) {
        rows[sel].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [sel]);

  // Open / Close animation and body scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setQuery('');
      setSel(0);
      document.body.style.overflow = 'hidden';

      const animTimer = requestAnimationFrame(() => {
        setIsOpenClass(true);
        inputRef.current?.focus({ preventScroll: true });
      });

      return () => {
        cancelAnimationFrame(animTimer);
      };
    } else {
      setIsOpenClass(false);
      document.body.style.overflow = '';
      const closeTimer = setTimeout(() => {
        setIsRendered(false);
      }, 200);

      return () => {
        clearTimeout(closeTimer);
      };
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatList.length > 0) {
        setSel((prev) => (prev + 1) % flatList.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatList.length > 0) {
        setSel((prev) => (prev - 1 + flatList.length) % flatList.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sel >= 0 && sel < flatList.length) {
        const item = flatList[sel];
        onClose();
        router.push(item.url);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!mounted || !isRendered) {
    return null;
  }

  let currentIndex = 0;

  const modalContent = (
    <div className={`srch ${isOpenClass ? 'is-open' : ''}`} id="srch" aria-hidden={!isOpen}>
      <div className="srch__scrim" onClick={onClose} data-close aria-hidden="true" />

      <div
        className="srch__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search ToolTive"
      >
        <div className="srch__head">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5L21 21" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            id="srchInput"
            placeholder="Search tools & articles…"
            autoComplete="off"
            spellCheck="false"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="srchBody"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd onClick={onClose} style={{ cursor: 'pointer' }}>esc</kbd>
        </div>

        <div
          className="srch__body"
          id="srchBody"
          ref={bodyRef}
          role="listbox"
          aria-label="Search results"
        >
          {toolResults.length > 0 && (
            <>
              <p className="srch__group">Tools</p>
              {toolResults.map((t) => {
                const itemIndex = currentIndex++;
                const isSelected = itemIndex === sel;
                return (
                  <Link
                    key={`tool-${t.url}`}
                    href={t.url}
                    className={`sres ${isSelected ? 'is-sel' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(t.url);
                    }}
                    onMouseEnter={() => setSel(itemIndex)}
                  >
                    <span className="sres__ic">
                      {renderCatIcon(t.cat)}
                    </span>
                    <span className="sres__name">{t.name}</span>
                    <span className="sres__cat">{t.cat}</span>
                    <svg className="sres__go" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 12h15" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                );
              })}
            </>
          )}

          {blogResults.length > 0 && (
            <>
              <p className="srch__group">From the blog</p>
              {blogResults.map((b) => {
                const itemIndex = currentIndex++;
                const isSelected = itemIndex === sel;
                return (
                  <Link
                    key={`blog-${b.url}`}
                    href={b.url}
                    className={`sres ${isSelected ? 'is-sel' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(b.url);
                    }}
                    onMouseEnter={() => setSel(itemIndex)}
                  >
                    <span className="sres__ic">
                      {renderBlogIcon()}
                    </span>
                    <span className="sres__name">{b.name}</span>
                    <span className="sres__cat">{b.cat}</span>
                    <svg className="sres__go" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 12h15" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                );
              })}
            </>
          )}

          {!query.trim() ? (
            <p className="srch__empty">
              Type to search tools and articles…
            </p>
          ) : toolResults.length === 0 && blogResults.length === 0 ? (
            <p className="srch__empty">
              Nothing for “{query.trim()}” — try another word.
            </p>
          ) : null}
        </div>

        <div className="srch__foot">
          <span id="srchCount">
            {query.trim()
              ? `${toolResults.length} tools · ${blogResults.length} articles`
              : ''}
          </span>
          <span className="srch__hints">
            {flatList.length > 0 ? (
              <>
                <kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> open
              </>
            ) : (
              <>
                <kbd>esc</kbd> close
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
