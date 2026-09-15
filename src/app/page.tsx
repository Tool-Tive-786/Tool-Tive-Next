import type { Metadata } from 'next';
import Link from 'next/link';
import { getLatestTools } from '@/lib/tools';
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
  // This stays automatic: every newly published tool with a current `pubDate`
  // replaces the oldest item in the homepage's three-tool showcase.
  const latestTools = getLatestTools(3);
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <>
      <Hero />

      <section className="section container" id="tools">
        <header className="section-header">
          <div className="section-badge">
            JUST ADDED
          </div>
          <h2 className="section-heading">
            Latest <span className="highlight">Tools.</span>
          </h2>
          <p className="section-description">
            Explore our three newest free tools, built to make your work faster and easier. No signup needed.
          </p>
        </header>

        <HomeToolsSection tools={latestTools} />
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
