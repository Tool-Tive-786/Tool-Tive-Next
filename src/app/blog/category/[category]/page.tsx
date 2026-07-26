import { getAllPosts, getAllCategories } from '@/lib/blog';
import ArticleCard from '@/components/ArticleCard';
import '@/styles/blog.css';

interface Props {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  return {
    title: `Blog: ${resolvedParams.category.charAt(0).toUpperCase() + resolvedParams.category.slice(1)}`,
    description: `Browse articles in the ${resolvedParams.category} category.`,
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({
    category: cat,
  }));
}

export default async function BlogCategoryIndex({ params }: Props) {
  const resolvedParams = await params;
  const currentCategory = resolvedParams.category;
  
  const allPosts = await getAllPosts();
  const posts = allPosts.filter(p => p.category === currentCategory);
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
              className={`filter-btn ${cat === currentCategory ? 'active' : ''}`}
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
        {posts.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
            No articles found in this category.
          </p>
        )}
      </div>
    </section>
  );
}
