"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import type { BlogPost } from '@/lib/blog';

export default function BlogPageClient({ posts, categories }: { posts: BlogPost[], categories: string[] }) {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

    // Sync state if URL changes
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setActiveCategory(cat);
        } else {
            setActiveCategory('all');
        }
    }, [searchParams]);

    const filteredPosts = useMemo(() => {
        if (activeCategory === 'all') return posts;
        return posts.filter(p => p.category === activeCategory);
    }, [posts, activeCategory]);

    return (
        <>
            <div className="filters-wrap">
                <div className="home-tool-categories" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {cat === 'all' ? 'All Articles' : cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="blog-content">
                <div className="blog-grid">
                    {filteredPosts.map((post) => (
                        <ArticleCard
                            key={post.slug}
                            title={post.title}
                            description={post.description}
                            category={post.category}
                            slug={post.slug}
                            pubDate={post.pubDate}
                            image={post.image}
                            imageAlt={post.imageAlt}
                            imageTitle={post.imageTitle}
                        />
                    ))}
                </div>
                {filteredPosts.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                        No articles found in this category.
                    </p>
                )}
            </div>
        </>
    );
}