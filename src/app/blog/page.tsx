import { Suspense } from 'react';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogPageClient from '@/components/BlogPageClient';
import ArticleCard from '@/components/ArticleCard';
import '@/styles/blog.css';

export const metadata = {
  title: 'Blog',
  description: 'Free online tools, guides, and articles for business and creatives.',
  alternates: { canonical: '/blog' },
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
            <div className="blog-grid">
              {posts.map((post) => (
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
          </div>
        </>
      }>
        <BlogPageClient posts={posts} categories={categories} />
      </Suspense>
    </section>
  );
}