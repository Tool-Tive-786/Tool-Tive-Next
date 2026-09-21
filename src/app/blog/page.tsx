import { Suspense } from 'react';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogPageClient from '@/components/BlogPageClient';
import ArticleCard from '@/components/ArticleCard';
import '@/styles/blog.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Free online tools, guides, and practical articles for business, AI, and creatives.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog · ToolTive',
    description: 'Free online tools, guides, and practical articles for business, AI, and creatives.',
    url: '/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog · ToolTive',
    description: 'Free online tools, guides, and practical articles for business, AI, and creatives.',
  },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();
  const categories = ['all', ...(await getAllCategories())];

  return (
    <section className="blog-page-container container" itemScope itemType="https://schema.org/Blog">
      <div style={{ textAlign: 'center' }}>
        <h1 className="page-heading">Blog</h1>
        <p className="page-sub" style={{ margin: '8px auto 40px auto' }}>Browse by category or read our latest articles.</p>
      </div>

      <Suspense fallback={
        <>
          <div className="filters-wrap">
            <div className="home-tool-categories" style={{ justifyContent: 'center', marginBottom: '40px' }}>
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`category-pill ${cat === 'all' ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {cat === 'all' ? 'All Articles' : cat}
                </span>
              ))}
            </div>
          </div>

          <div className="blog-content">
            <div className="blog-reading-labels" aria-hidden="true">
              <span>Date</span>
              <span></span>
              <span>The piece</span>
              <span>Read</span>
            </div>
            <ol className="blog-reading-list blog-page-reading-list">
              {posts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  title={post.title}
                  description={post.description}
                  category={post.category}
                  slug={post.slug}
                  pubDate={post.pubDate}
                  contentHtml={post.contentHtml}
                  image={post.image}
                  imageAlt={post.imageAlt}
                  imageTitle={post.imageTitle}
                />
              ))}
            </ol>
          </div>
        </>
      }>
        <BlogPageClient posts={posts} categories={categories} />
      </Suspense>
    </section>
  );
}
