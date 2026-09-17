import Link from 'next/link';
import type { Tool } from '@/lib/tools';
import ToolCard from '@/components/ToolCard';

interface LatestToolsSectionProps {
  tools: Tool[];
}

const applicationCategories: Record<string, string> = {
  pdf: 'UtilitiesApplication',
  compress: 'UtilitiesApplication',
  business: 'BusinessApplication',
  seo: 'DeveloperApplication',
};

export default function LatestToolsSection({ tools }: LatestToolsSectionProps) {
  const latestToolsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Latest Tools from ToolTive',
    description: 'The three most recently published free online tools on ToolTive.',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: tool.cardTitle || tool.title,
        url: `https://tooltive.com/all-tools/${tool.category}/${tool.slug}`,
        description: tool.cardExcerpt || tool.seoDescription,
        applicationCategory: applicationCategories[tool.category] || 'WebApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires a modern web browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        datePublished: tool.pubDate,
      },
    })),
  };

  return (
    <section className="latest-tools-section" id="latest-tools" aria-labelledby="latest-tools-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(latestToolsSchema).replace(/</g, '\\u003c'),
        }}
      />

      <div className="container">
        <header className="latest-tools-head">
          <div>
            <p className="latest-tools-eyebrow caps">
              <span aria-hidden="true"></span>
              Just Published
            </p>
            <h2 id="latest-tools-title" className="latest-tools-title">
              Fresh off the{' '}
              <span className="latest-tools-highlight">
                <em>workbench</em>
                <svg viewBox="0 0 220 14" aria-hidden="true">
                  <path pathLength="100" d="M4 10 C44 3 92 13 132 7 S196 3 216 8" />
                </svg>
              </span>
              .
            </h2>
            <p className="latest-tools-description">
              New tools are added as ToolTive grows — here are the three most recent additions to the toolkit.
            </p>
          </div>
        </header>

        <ol className="latest-tools-grid tool-card-grid" aria-label="Three latest ToolTive tools">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </ol>

        <footer className="latest-tools-footer">
          <Link href="/all-tools" className="latest-tools-all">
            Explore All Tools
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </footer>
      </div>
    </section>
  );
}
