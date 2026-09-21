import type { Metadata } from 'next';
import { getAllTools, getLatestTools } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';
import ArticleCard from '@/components/ArticleCard';
import Hero from '@/components/Hero';
import LatestToolsSection from '@/components/LatestToolsSection';
import FaqSection, { type FaqItem } from '@/components/FaqSection';
import SiteIcon from '@/components/SiteIcon';
import '@/styles/home.css';
import '@/styles/tools.css';

const categoryCards = [
  {
    category: 'pdf',
    title: 'PDF & Files',
    description: 'Convert and work with documents through practical PDF utilities designed for everyday file workflows.',
    href: '/all-tools/pdf',
    icon: 'pdf',
  },
  {
    category: 'compress',
    title: 'Images & Compression',
    description: 'Resize, compress, and optimize images for websites, documents, and everyday digital work.',
    href: '/all-tools/compress',
    icon: 'image',
  },
  {
    category: 'business',
    title: 'Business',
    description: 'Handle practical business tasks such as invoicing and profit calculations with simple online utilities.',
    href: '/all-tools/business',
    icon: 'business',
  },
  {
    category: 'seo',
    title: 'SEO',
    description: 'Build and manage essential technical SEO assets including Schema Markup, XML Sitemaps, and robots.txt files.',
    href: '/all-tools/seo',
    icon: 'seo',
  },
] as const;

const platformValues = [
  {
    title: 'Built for Real Work',
    description: 'ToolTive focuses on practical tasks people actually need to complete — from business calculations and file conversion to image optimization and technical SEO.',
    icon: 'work',
  },
  {
    title: 'Simple Without Being Basic',
    description: "The goal isn't to remove useful functionality. It's to make powerful workflows easier to understand and easier to use.",
    icon: 'simple',
  },
  {
    title: 'Privacy-Conscious by Design',
    description: 'Where supported, tools process data directly in your browser. When a workflow requires remote processing, ToolTive aims to make that behavior clear.',
    icon: 'privacy',
  },
  {
    title: 'Growing Into a Complete Toolkit',
    description: 'Today the platform covers several essential categories. Over time, ToolTive is being built into a broader collection of online tools ranging from everyday utilities to more advanced workflows.',
    icon: 'growth',
  },
] as const;

const homepageFaqs: FaqItem[] = [
  {
    question: 'Is ToolTive free to use?',
    answer: 'Yes. ToolTive currently provides its available online tools free to use. The platform may introduce paid products or features in the future, but the current ToolTive toolkit is available without a subscription.',
    schemaAnswer: 'Yes. ToolTive currently provides its available online tools free to use. The platform may introduce paid products or features in the future, but the current ToolTive toolkit is available without a subscription.',
  },
  {
    question: 'What can I use ToolTive for?',
    answer: 'ToolTive provides online tools for a range of everyday digital tasks, including PDF and image workflows, business calculations and invoicing, and technical SEO tasks such as Schema Markup, XML Sitemaps, and robots.txt management. The platform is designed to expand over time.',
    schemaAnswer: 'ToolTive provides online tools for PDF and image workflows, business calculations and invoicing, and technical SEO tasks such as Schema Markup, XML Sitemaps, and robots.txt management.',
  },
  {
    question: 'Do I need to create an account?',
    answer: "ToolTive's current tools are designed to be used without an account or unnecessary signup. Simply choose a tool and start working.",
    schemaAnswer: "ToolTive's current tools are designed to be used without an account or unnecessary signup. Simply choose a tool and start working.",
  },
  {
    question: 'Are ToolTive tools private?',
    answer: "Privacy depends on the individual tool. Some tools process files or information directly in your browser. Other workflows, particularly tools that need to retrieve remote URLs, may use ToolTive's edge infrastructure. Each tool's page provides relevant information about how its workflow operates.",
    schemaAnswer: "Privacy depends on the individual tool. Some tools process files or information directly in your browser, while workflows that retrieve remote URLs may use ToolTive's edge infrastructure.",
  },
  {
    question: 'Can I use ToolTive tools for business work?',
    answer: 'Yes. ToolTive includes practical business utilities such as an invoice generator and profit margin calculator, along with other tools that can support everyday professional workflows.',
    schemaAnswer: 'Yes. ToolTive includes practical business utilities such as an invoice generator and profit margin calculator, along with other tools that support everyday professional workflows.',
  },
  {
    question: 'Are new tools added to ToolTive?',
    answer: 'Yes. ToolTive is being developed as a growing online toolkit, with new tools and more advanced workflows planned over time.',
    schemaAnswer: 'Yes. ToolTive is being developed as a growing online toolkit, with new tools and more advanced workflows planned over time.',
  },
];

const finalTrustItems = [
  { label: 'Free to use', icon: 'fas fa-gift' },
  { label: 'Practical workflows', icon: 'fas fa-list-check' },
  { label: 'Privacy-conscious design', icon: 'fas fa-shield-halved' },
  { label: 'Tools that keep growing', icon: 'fas fa-arrow-trend-up' },
];

function CategoryIcon({ icon }: { icon: (typeof categoryCards)[number]['icon'] }) {
  if (icon === 'pdf') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
        <path d="M13 3v6h6" />
      </svg>
    );
  }

  if (icon === 'image') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path d="m4.5 16.5 4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5" />
      </svg>
    );
  }

  if (icon === 'business') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="6.5" width="17" height="13" rx="2" />
        <path d="M9 6.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12h17M9.5 12v2h5v-2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M7.5 12.5V10M10.5 12.5V7.5M13.5 12.5v-3" />
    </svg>
  );
}

function PlatformValueIcon({ icon }: { icon: (typeof platformValues)[number]['icon'] }) {
  if (icon === 'work') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
      </svg>
    );
  }

  if (icon === 'simple') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.3 12.4 2.6 2.6 4.9-5.4" />
      </svg>
    );
  }

  if (icon === 'privacy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        <circle cx="12" cy="15.2" r="1.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21v-9M12 12C12 7.5 8.5 5 4 5c0 4.5 3.5 7 8 7ZM12 12c0-4.5 3.5-7 8-7 0 4.5-3.5 7-8 7Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'Free Online Tools for Work, Business & Everyday Tasks',
  description: 'Use free online tools for PDF and image workflows, business tasks, SEO, and everyday productivity — with no unnecessary complexity.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Free Online Tools for Work, Business & Everyday Tasks · ToolTive',
    description: 'Use free online tools for PDF and image workflows, business tasks, SEO, and everyday productivity — with no unnecessary complexity.',
    url: '/',
    type: 'website',
    siteName: 'ToolTive',
    images: [{ url: '/hero-section.webp', width: 1200, height: 630, alt: 'ToolTive Free Online Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Tools for Work, Business & Everyday Tasks · ToolTive',
    description: 'Use free online tools for PDF and image workflows, business tasks, SEO, and everyday productivity — with no unnecessary complexity.',
    images: ['/hero-section.webp'],
  },
};

export default async function Home() {
  // This stays automatic: every newly published tool with a current `pubDate`
  // replaces the oldest item in the homepage's three-tool showcase.
  const latestTools = getLatestTools(3);
  const allTools = getAllTools();
  const categoryShowcases = categoryCards.map((category) => ({
    ...category,
    tools: allTools.filter((tool) => tool.category === category.category),
  }));
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 3);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ToolTive',
    url: 'https://tooltive.com',
    description: 'Free utilities for professionals and creatives. No signups, no hassle.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://tooltive.com/all-tools?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolTive',
    url: 'https://tooltive.com',
    logo: 'https://tooltive.com/tooltive-logo.webp',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero />

      <section className="home-categories-section" id="tools" aria-labelledby="home-categories-title">
        <div className="container">
          <header className="home-categories-head">
            <p className="home-categories-eyebrow caps">
              <span aria-hidden="true"></span>
              Explore by Category
            </p>
            <h2 id="home-categories-title" className="home-categories-title">
              Free Online Tools for{' '}
              <span className="home-categories-highlight">
                <em>Real-World Work</em>
                <svg viewBox="0 0 220 14" aria-hidden="true">
                  <path pathLength="100" d="M4 10 C44 3 92 13 132 7 S196 3 216 8" />
                </svg>
              </span>
            </h2>
            <p className="home-categories-description">
              ToolTive brings useful web tools together in one place so you can handle common tasks without jumping between multiple websites. Choose a category and go straight to the workflow you need.
            </p>
          </header>

          <div className="home-category-labels" aria-hidden="true">
            <span>No.</span>
            <span></span>
            <span>Category</span>
            <span>Tools</span>
          </div>

          <ol className="home-category-list" aria-label="Tool categories">
            {categoryShowcases.map((category, index) => {
              const visibleTools = category.tools.slice(0, 4);
              const toolCount = category.tools.length;

              return (
                <li key={category.category}>
                  <a
                    href={category.href}
                    className="home-category-row"
                    aria-label={`${category.title}: explore ${toolCount} ${toolCount === 1 ? 'tool' : 'tools'}`}
                  >
                    <span className="home-category-row-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="home-category-row-icon" aria-hidden="true">
                      <CategoryIcon icon={category.icon} />
                    </span>

                    <span className="home-category-row-body">
                      <span className="home-category-row-name">{category.title}</span>
                      <span className="home-category-row-swap">
                        <span className="home-category-row-description">{category.description}</span>
                        <span className="home-category-row-roster" aria-hidden="true">
                          {visibleTools.map((tool) => (
                            <span key={tool.id}>{tool.cardTitle || tool.title}</span>
                          ))}
                        </span>
                      </span>
                    </span>

                    <span className="home-category-row-end">
                      <span className="home-category-row-count">
                        <b>{toolCount}</b> {toolCount === 1 ? 'tool' : 'tools'}
                      </span>
                      <svg className="home-category-row-arrow" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 12h15" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>

          <footer className="home-categories-footer">
            <a href="/all-tools" className="home-categories-all">
              Browse All Tools
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
          </footer>
        </div>
      </section>

      <LatestToolsSection tools={latestTools} />

      <section className="why-tooltive-section" id="why-tooltive" aria-labelledby="why-tooltive-title">
        <div className="container">
          <div className="why-tooltive-grid">
            <header className="why-tooltive-side">
              <p className="why-tooltive-eyebrow caps">
                <span aria-hidden="true"></span>
                The ToolTive Approach
              </p>
              <h2 id="why-tooltive-title" className="why-tooltive-title">Why ToolTive?</h2>
              <p className="why-tooltive-description">
                There are plenty of online tools available. ToolTive is built around a simpler idea: useful tools should be easy to access, practical to use, and worth coming back to.
              </p>
            </header>

            <ol className="why-tooltive-list">
              {platformValues.map((value, index) => (
                <li key={value.title}>
                  <article className="why-tooltive-row">
                    <span className="why-tooltive-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="why-tooltive-icon" aria-hidden="true">
                      <PlatformValueIcon icon={value.icon} />
                    </span>
                    <div>
                      <h3>{value.title}</h3>
                      <p>{value.description}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="blog-section" id="blog" aria-labelledby="home-blog-title" itemScope itemType="https://schema.org/Blog">
        <meta itemProp="name" content="The ToolTive Blog" />
        <meta itemProp="url" content="https://tooltive.com/blog" />
        <div className="blog-container">
          <header className="blog-header">
            <div>
              <p className="blog-label caps">
                <span aria-hidden="true"></span>
                Resources
              </p>
              <h2 id="home-blog-title">
                The{' '}
                <span className="blog-title-highlight">
                  <em>ToolTive</em>
                  <svg viewBox="0 0 220 14" aria-hidden="true">
                    <path pathLength="100" d="M4 10 C44 3 92 13 132 7 S196 3 216 8" />
                  </svg>
                </span>{' '}
                Blog
              </h2>
              <p className="blog-description">
                Guides and tutorials that go with the tools — the how-to, the why, and the number you should have been charging all along.
              </p>
            </div>
            <p className="blog-note">Guides</p>
          </header>

          <div className="blog-reading-labels" aria-hidden="true">
            <span>Date</span>
            <span></span>
            <span>The piece</span>
            <span>Read</span>
          </div>

          <ol className="blog-reading-list">
            {recentPosts.map((post) => (
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

          <footer className="blog-reading-footer">
            <a href="/blog" className="blog-reading-all">
              Explore All Article
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
          </footer>
        </div>
      </section>

      <FaqSection
        faqs={homepageFaqs}
        title={<>Frequently <span className="faq-title-highlight"><em>Asked</em><svg viewBox="0 0 180 14" aria-hidden="true"><path pathLength="100" d="M4 10 C38 4 74 13 108 7 S155 4 176 8" /></svg></span> Questions</>}
        description="Clear answers about ToolTive, how the tools work, and what you can expect from the platform."
        label="Helpful Answers"
        showCta={false}
      />

      <section className="final-cta-section" aria-labelledby="final-cta-heading">
        <div className="container final-cta-wrapper">
          <div className="final-cta-card">
            <div className="final-cta-content">
              <div className="section-badge caps">Ready When You Are</div>
              <h2 id="final-cta-heading">Get More Done with <span className="highlight">ToolTive</span></h2>
              <p>
                Explore a growing collection of free online tools built to make everyday digital work simpler. Find the tool you need, get the job done, and come back whenever the next task comes up.
              </p>
              <div className="final-cta-actions">
                <a href="/all-tools" className="hero-primary-cta">
                  Explore All Tools <SiteIcon name="arrow-right" />
                </a>
                <a href="/blog" className="hero-secondary-cta">
                  Read ToolTive Blog <SiteIcon name="book" />
                </a>
              </div>
            </div>

            <aside className="final-trust-strip" aria-label="ToolTive commitments">
              <div className="final-trust-grid">
                {finalTrustItems.map((item) => (
                  <div className="final-trust-item" key={item.label}>
                    <SiteIcon name={item.icon} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
