"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolCard from './ToolCard';
import type { Tool } from '@/lib/tools';

const categoryIcons: Record<string, string> = {
  'business': 'fas fa-briefcase',
  'editing': 'fas fa-image', // specific to image refiner
  'pdf': 'fas fa-file-pdf',
  'security': 'fas fa-shield-alt',
  'writing': 'fas fa-pen',
};

export default function HomeToolsSection({ tools }: { tools: Tool[] }) {
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
      <div className="home-tool-categories">
        <button 
          onClick={() => setActiveCategory('all')} 
          className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
        >
          <i className="fas fa-border-all"></i> All Tools
        </button>
        
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)} 
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            <i className={categoryIcons[cat.toLowerCase()] || 'fas fa-folder'}></i> {cat}
          </button>
        ))}
      </div>

      <ul className="tools-grid">
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.seoDescription}
            icon={tool.icon}
            tags={tool.tags}
            category={tool.category}
            href={`/${tool.category}/${tool.slug}`}
          />
        ))}
      </ul>

      {filteredTools.length > 0 && (
        <div className="view-all-wrap">
          <Link href="/tools" className="view-all-btn">
            <i className="fas fa-th-large"></i>
            View All Tools
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
