import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCategories, getPostsByCategory } from '@/lib/blog';
import ArticleCard from '@/components/ArticleCard';
import '@/styles/blog.css';

interface Props {
  params: Promise<{
    category: string;
  }>;
}

const categoryMetaMap: Record<string, { title: string; desc: string; heading: string; intro: string }> = {
  business: {
    title: 'Business Guides & Insights',
    desc: 'Explore expert business guides, financial tips, invoicing strategies, and calculator walkthroughs from ToolTive.',
    heading: 'Business Guides & Articles',
    intro: 'Explore practical business guides, financial workflows, and invoicing best practices designed to help freelancers, contractors, and small business owners succeed.',
  },
  ai: {
    title: 'AI & Machine Learning Insights',
    desc: 'Discover in-depth analyses, coding comparisons, benchmarks, and practical evaluations of modern artificial intelligence models on ToolTive.',
    heading: 'AI & Machine Learning Articles',
    intro: 'Deep dives, benchmarks, and real-world evaluations of artificial intelligence models, coding assistants, and machine learning developer tools.',
  },
};

function getCategoryMeta(category: string) {
  const normalized = category.toLowerCase();
  if (categoryMetaMap[normalized]) {
    return categoryMetaMap[normalized];
  }
  const formatted = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return {
    title: `${formatted} Guides & Articles`,
    desc: `Browse practical ${formatted} articles, guides, and insights on ToolTive.`,
    heading: `${formatted} Articles`,
    intro: `Read the latest ${formatted} guides, tips, and tutorials from the ToolTive team.`,
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.category.toLowerCase();
  const allCategories = await getAllCategories();

  if (!allCategories.map((c) => c.toLowerCase()).includes(category)) {
    return { title: 'Category Not Found' };
  }

  const meta = getCategoryMeta(category);
  const canonicalUrl = `/blog/${category}`;

  return {
    title: meta.title,
    description: meta.desc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${meta.title} · ToolTive`,
      description: meta.desc,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} · ToolTive`,
      description: meta.desc,
    },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.category.toLowerCase();
  const allCategories = await getAllCategories();

  if (!allCategories.map((c) => c.toLowerCase()).includes(category)) {
    notFound();
  }

  const posts = await getPostsByCategory(category);
  const meta = getCategoryMeta(category);
  const navCategories = ['all', ...allCategories];

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${meta.heading} · ToolTive`,
    description: meta.desc,
    url: `https://tooltive.com/blog/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://tooltive.com/blog/${post.category}/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <section className="blog-page-container container" itemScope itemType="https://schema.org/Blog">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div style={{ textAlign: 'center' }}>
        <h1 className="page-heading">{meta.heading}</h1>
        <p className="page-sub" style={{ margin: '8px auto 40px auto', maxWidth: '640px' }}>
          {meta.intro}
        </p>
      </div>

      <div className="filters-wrap">
        <div className="home-tool-categories" style={{ justifyContent: 'center', marginBottom: '40px' }}>
          {navCategories.map((cat) => {
            const isAll = cat === 'all';
            const isActive = isAll ? false : cat.toLowerCase() === category;
            const href = isAll ? '/blog' : `/blog/${cat}`;
            const label = isAll
              ? 'All Articles'
              : cat.toLowerCase() === 'ai'
              ? 'AI'
              : cat.charAt(0).toUpperCase() + cat.slice(1);

            return (
              <Link
                key={cat}
                href={href}
                className={`category-pill ${isActive ? 'active' : ''}`}
                style={{ textTransform: isAll || cat.toLowerCase() === 'ai' ? 'none' : 'capitalize' }}
              >
                {label}
              </Link>
            );
          })}
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
        {posts.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
            No articles found in this category.
          </p>
        )}
      </div>
    </section>
  );
}
