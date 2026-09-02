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
    robots: {
      index: true,
      follow: true,
    },
    alternates: { canonical: `/blog/${resolvedParams.category}/${resolvedParams.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: new Date(post.pubDate).toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
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

  const canonicalUrl = `https://tooltive.com/blog/${post.category}/${post.slug}`;

  const postImageUrl = post.image
    ? (post.image.startsWith('http') ? post.image : `https://tooltive.com${post.image}`)
    : "https://tooltive.com/hero-section.webp";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": postImageUrl,
    "url": canonicalUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "datePublished": new Date(post.pubDate).toISOString(),
    "dateModified": new Date(post.pubDate).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "ToolTive Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolTive",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tooltive.com/tooltive-logo.webp"
      }
    }
  };

  const faqJsonLd = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="container blog-page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="blog-layout">
        {/* Main Content (65%) */}
        <article className="blog-article">
          <h1 className="article-title" style={{ marginTop: 0 }}>{post.title}</h1>
          
          <div className="article-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '32px' }}>
            <span className="category-label" style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)', margin: 0 }}>
              {post.category.replace(/-/g, ' ')}
            </span>
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
            {post.toc && post.toc.length > 0 ? (
              <ul className="toc-list">
                {post.toc.filter(item => item.level === 2).map((h2) => {
                  const h2Index = post.toc!.indexOf(h2);
                  const nextH2Index = post.toc!.findIndex((item, i) => i > h2Index && item.level === 2);
                  const children = post.toc!.filter((item, i) => 
                    i > h2Index && 
                    (nextH2Index === -1 || i < nextH2Index) && 
                    item.level === 3
                  );

                  return (
                    <li key={h2.id}>
                      <a href={`#${h2.id}`}>{h2.text}</a>
                      {children.length > 0 && (
                        <ul className="toc-sublist">
                          {children.map(h3 => (
                            <li key={h3.id}><a href={`#${h3.id}`}>{h3.text}</a></li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No sections available.</p>
            )}
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