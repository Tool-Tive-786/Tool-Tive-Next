import { getLatestTools, type Tool } from '@/lib/tools';

interface ToolCardProps {
  tool: Tool;
  ctaLabel?: string;
  stampLabel?: string;
}

const categoryLabels: Record<string, string> = {
  pdf: 'PDF & Files',
  compress: 'Images',
  business: 'Business',
  seo: 'SEO',
};

const applicationCategories: Record<string, string> = {
  pdf: 'UtilitiesApplication',
  compress: 'UtilitiesApplication',
  business: 'BusinessApplication',
  seo: 'DeveloperApplication',
};

const latestToolIds = new Set(getLatestTools(3).map((tool) => tool.id));

function formatPublishedDate(pubDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${pubDate}T00:00:00Z`));
}

export default function ToolCard({
  tool,
  ctaLabel = 'Use tool',
  stampLabel,
}: ToolCardProps) {
  const title = tool.cardTitle || tool.title;
  const description = tool.cardExcerpt || tool.seoDescription;
  const href = `/all-tools/${tool.category}/${tool.slug}`;
  const badge = stampLabel ?? (latestToolIds.has(tool.id) ? 'New' : 'Free');

  return (
    <li className="site-tool-item">
      <a
        href={href}
        className="latest-tool-card"
        aria-label={`${ctaLabel}: ${title}`}
        itemProp="itemListElement"
        itemScope
        itemType="https://schema.org/SoftwareApplication"
      >
        <meta itemProp="url" content={`https://tooltive.com${href}`} />
        <meta itemProp="applicationCategory" content={applicationCategories[tool.category] || 'WebApplication'} />
        <meta itemProp="operatingSystem" content="Any" />
        <meta itemProp="datePublished" content={tool.pubDate} />
        <span itemProp="offers" itemScope itemType="https://schema.org/Offer" hidden>
          <meta itemProp="price" content="0" />
          <meta itemProp="priceCurrency" content="USD" />
        </span>

        <span className="latest-tool-stamp" aria-hidden="true">{badge}</span>
        <span
          className="latest-tool-icon"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: tool.icon }}
        />

        <span className="latest-tool-category">
          <i aria-hidden="true"></i>
          {categoryLabels[tool.category] || tool.category}
          <span aria-hidden="true">·</span>
          <time dateTime={tool.pubDate}>{formatPublishedDate(tool.pubDate)}</time>
        </span>

        <h3 className="latest-tool-name" itemProp="name">{title}</h3>
        <p className="latest-tool-description" itemProp="description">{description}</p>

        <span className="latest-tool-tags" aria-label="Tool features">
          {tool.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>

        <span className="latest-tool-footer">
          <span className="latest-tool-free">Free · No signup</span>
          <span className="latest-tool-leader" aria-hidden="true"></span>
          <span className="latest-tool-button">
            {ctaLabel}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </span>
      </a>
    </li>
  );
}
