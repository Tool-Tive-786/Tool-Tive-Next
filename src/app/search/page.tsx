"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchTools } from '@/lib/search';
import { Tool } from '@/lib/tools';
import HomeToolsSection from '@/components/HomeToolsSection';
import '@/styles/home.css';
import '@/styles/tools.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Tool[]>([]);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchTools(query));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div style={{ paddingTop: '180px', paddingBottom: '100px', minHeight: '60vh' }} className="container">
      <header className="section-header" style={{ marginBottom: '60px' }}>
        <h1 className="section-heading" style={{ fontSize: '32px' }}>
          Search Results for <span className="highlight">"{query}"</span>
        </h1>
        <p className="section-description">
          {results.length} {results.length === 1 ? 'tool' : 'tools'} found matching your query.
        </p>
      </header>

      {results.length > 0 ? (
        <HomeToolsSection tools={results} />
      ) : (
        <div className="tools-empty" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <i className="fas fa-search" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '24px', opacity: 0.5 }}></i>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>No tools found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any tools matching "{query}". Try adjusting your keywords or browse all tools.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '180px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
