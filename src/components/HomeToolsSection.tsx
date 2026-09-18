"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolCard from './ToolCard';
import type { Tool } from '@/lib/tools';
import SiteIcon from '@/components/SiteIcon';

interface HomeToolsSectionProps {
  tools: Tool[];
  showFilters?: boolean;
  viewAllLabel?: string;
  cardCtaLabel?: string;
}

export default function HomeToolsSection({
  tools,
  showFilters = true,
  viewAllLabel = 'View All Tools',
  cardCtaLabel = 'Use tool',
}: HomeToolsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Derive unique categories from the actual tools array
  const categories = useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category)));
  }, [tools]);

  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') return tools;
    return tools.filter(t => t.category === activeCategory);
  }, [tools, activeCategory]);

  return (
    <>
      {showFilters && (
        <div className="home-tool-categories">
          <button
            onClick={() => setActiveCategory('all')}
            className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
          >
            All Tools
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <ul className="tools-grid tool-card-grid">
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            ctaLabel={cardCtaLabel}
          />
        ))}
      </ul>

      {filteredTools.length > 0 && (
        <div className="view-all-wrap">
          <Link href="/all-tools" className="view-all-btn">
            <SiteIcon name="th-large" />
            {viewAllLabel}
          </Link>
        </div>
      )}

      {filteredTools.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
          No tools found in this category.
        </p>
      )}
    </>
  );
}
