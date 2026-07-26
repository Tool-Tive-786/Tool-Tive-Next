import Link from 'next/link';
import { getAllTools } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';
import ArticleCard from '@/components/ArticleCard';
import Hero from '@/components/Hero';
import HomeToolsSection from '@/components/HomeToolsSection';
import '@/styles/home.css';
import '@/styles/tools.css';

export default async function Home() {
  const tools = getAllTools();
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <>
      <Hero />

      <section className="section container" id="tools">
        <header className="section-header">
          <div className="section-badge">
            <span className="dot"></span> OUR TOOLBOX
          </div>
          <h2 className="section-heading">
            Powerful Tools for <span className="highlight">Every Task.</span>
          </h2>
          <p className="section-description">
            Browse our collection of free, high-quality tools designed to make your work faster and easier. No signup needed.
          </p>
        </header>

        <HomeToolsSection tools={tools} />
      </section>

      <section className="blog-section" id="blog" itemScope itemType="https://schema.org/Blog">
        <div className="blog-container">
          <header className="blog-header">
            <div className="blog-label">
              <span className="pulse"></span>
              From the Blog
            </div>
            <h2>
              Latest <span className="highlight">Articles.</span>
            </h2>
            <p>
              Stay updated with our latest guides, tips, and professional resources to help you excel.
            </p>
          </header>

          <div className="blog-grid">
            {recentPosts.map((post) => (
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

          <div className="view-all-wrap">
            <Link href="/blog" className="view-all-btn">
              <i className="fas fa-book-open"></i>
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <header className="section-header">
          <div className="section-badge">
            <span className="dot"></span> SUPPORT
          </div>
          <h2 className="section-heading">
            Frequently Asked <span className="highlight">Questions.</span>
          </h2>
          <p className="section-description">
            Everything you need to know about ToolTive and how our tools work securely in your browser.
          </p>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-default)', boxShadow: '0 4px 14px var(--accent-glow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Are the tools on ToolTive really free?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Yes, all tools on ToolTive including the Invoice Generator and Image Refiner are 100% free to use with no hidden costs, subscriptions, or watermarks.</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-default)', boxShadow: '0 4px 14px var(--accent-glow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Do I need to create an account?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>No signup is required. You can use all our tools instantly directly in your browser without creating an account or providing an email address.</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-default)', boxShadow: '0 4px 14px var(--accent-glow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Is my data secure?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Absolutely. All processing happens locally in your web browser. We do not store your images, financial data, or documents on our servers. Once you close the tab, the data is gone.</p>
          </div>
        </div>
      </section>
    </>
  );
}
