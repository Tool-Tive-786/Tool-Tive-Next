import { Suspense } from 'react';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogPageClient from '@/components/BlogPageClient';
import '@/styles/blog.css';

export const metadata = {
  title: 'Blog',
  description: 'Free online tools, guides, and articles for business and creatives.',
};

export default async function BlogIndex() {
  const posts = await getAllPosts();
  const categories = ['all', ...(await getAllCategories())];

  return (
    <section className="blog-page-container container">
      <div style={{ textAlign: 'center' }}>
        <h1 className="page-heading">Blog</h1>
        <p className="page-sub" style={{ margin: '8px auto 40px auto' }}>Browse by category or read our latest articles.</p>
      </div>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading articles...</div>}>
        <BlogPageClient posts={posts} categories={categories} />
      </Suspense>
    </section>
  );
}