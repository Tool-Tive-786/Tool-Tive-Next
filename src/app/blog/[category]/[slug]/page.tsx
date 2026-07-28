import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import '@/styles/blog.css';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) {
    return { title: 'Not Found' };
  }
  return {
    title: post.title,
    description: post.description,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.pubDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="container blog-page-container">
      <div className="blog-layout">
        {/* Main Content (65%) */}
        <article className="blog-article">
          <div className="category-label">{post.category.replace(/-/g, ' ')}</div>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            {formattedDate} • ToolTive Team
          </div>

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>

        {/* Sidebar / Table of Contents (30%) */}
        <aside className="blog-sidebar">
          <div className="toc-box">
            <h3 className="toc-title">Table of Contents</h3>
            <ul className="toc-list">
              <li><a href="#">Why Use Our Free Invoice Generator?</a></li>
              <li><a href="#">Everything You Need in One Invoice Maker</a></li>
              <li>
                <a href="#">How to Make an Invoice for Free</a>
                <ul className="toc-sublist">
                  <li><a href="#">Step 1: Details</a></li>
                  <li><a href="#">Step 2: Pricing</a></li>
                </ul>
              </li>
              <li><a href="#">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Sample Promo / Widget */}
          <div className="sidebar-widget">
            <div className="widget-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <h4>Try Our Free Tools</h4>
            <p>Speed up your workflow with our premium tools, completely free.</p>
            <a href="/all-tools" className="widget-btn">View All Tools <i className="fas fa-arrow-right"></i></a>
          </div>
        </aside>
      </div>
    </div>
  );
}