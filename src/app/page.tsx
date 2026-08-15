import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTools } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';
import ArticleCard from '@/components/ArticleCard';
import Hero from '@/components/Hero';
import HomeToolsSection from '@/components/HomeToolsSection';
import FaqSection from '@/components/FaqSection';
import '@/styles/home.css';
import '@/styles/tools.css';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

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
            OUR TOOLBOX
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
                image={post.image}
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

      <FaqSection />
    </>
  );
}