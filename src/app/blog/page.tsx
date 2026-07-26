import { getAllPosts, getAllCategories } from '@/lib/blog';
import ArticleCard from '@/components/ArticleCard';
import '@/styles/blog.css';

export const metadata = {
  title: 'Blog',
  description: 'Free online tools, guides, and articles for business and creatives.',
};

export default async function BlogIndex() {
  const posts = await getAllPosts();
  const categories = ['all', ...(await getAllCategories())];

  return (
    <section className="blog-page">
      <h1 className="blog-heading">Blog</h1>
      <p className="blog-sub">Browse by category or read our latest articles.</p>

      <div className="filters-wrap">
        <div className="tool-filters">
          {categories.map(cat => (
            <a
              key={cat}
              href={cat === 'all' ? '/blog' : `/blog/category/${cat}`}
              className={`filter-btn ${cat === 'all' ? 'active' : ''}`}
            >
              {cat === 'all' ? 'All Articles' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </a>
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
