"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ToolCard from '@/components/ToolCard';
import { getCategories, type Tool } from '@/lib/tools';

export default function ToolsPageClient({ activeCategory, tools }: { activeCategory: string, tools: Tool[] }) {
    const router = useRouter();

    // We fetch all categories from the lib to always display the full list of filters,
    // even if the currently passed `tools` prop only contains tools for one category.
    const allCategories = getCategories();

    return (
        <>
            <div className="filters-wrap">
                <div className="home-tool-categories" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                    <button
                        onClick={() => router.push('/all-tools')}
                        className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                    >
                        All Tools
                    </button>

                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => router.push(`/all-tools/${cat}`)}
                            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <ul className="tools-grid tool-card-grid">
                {tools.map((tool) => (
                    <ToolCard
                        key={tool.id}
                        tool={tool}
                    />
                ))}
            </ul>

            {tools.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                    No tools found in this category.
                </p>
            )}
        </>
    );
}
