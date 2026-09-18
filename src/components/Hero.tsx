import React from 'react';
import { getAllTools, type Tool } from '@/lib/tools';

const valuePoints = [
  {
    icon: 'tag',
    title: 'Free to Use',
    description: 'No subscription required for the current toolkit.',
  },
  {
    icon: 'gauge',
    title: 'Fast & Practical',
    description: 'Focused workflows for everyday tasks.',
  },
  {
    icon: 'lock',
    title: 'Privacy-Conscious',
    description: 'Browser and remote processing are clearly identified.',
  },
  {
    icon: 'check',
    title: 'No Unnecessary Complexity',
    description: 'Open a tool and get straight to the result.',
  },
];

function TrustIcon({ icon }: { icon: string }) {
  if (icon === 'tag') {
    return (
      <svg className="trust-value-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h7.2l9.3 9.3a1.5 1.5 0 0 1 0 2.1l-5.1 5.1a1.5 1.5 0 0 1-2.1 0L4 11.2V4z" />
        <circle cx="8.2" cy="8.2" r="1.4" />
      </svg>
    );
  }

  if (icon === 'gauge') {
    return (
      <svg className="trust-value-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4.5 17.5a7.5 7.5 0 0 1 15 0" />
        <path d="M12 17.5l3.6-4.6" />
        <circle cx="12" cy="17.5" r="1.3" />
      </svg>
    );
  }

  if (icon === 'lock') {
    return (
      <svg className="trust-value-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        <circle cx="12" cy="15.2" r="1.2" />
      </svg>
    );
  }

  return (
    <svg className="trust-value-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.3 12.4l2.6 2.6 4.9-5.4" />
    </svg>
  );
}

const publishedTools = getAllTools();

const categoryLabels: Record<string, string> = {
  pdf: 'PDF & Files',
  compress: 'Images',
  business: 'Business',
  seo: 'SEO',
};

function getFanCardStyle(index: number, count: number): React.CSSProperties {
  const position = count === 1 ? 0 : (index / (count - 1)) - 0.5;
  const distance = Math.abs(position);

  return {
    '--fan-r-stack': `${(position * 10).toFixed(2)}deg`,
    '--fan-x-stack': `${(position * 14.75).toFixed(1)}px`,
    '--fan-y-stack': `${(distance * 10 - 2).toFixed(1)}px`,
    '--fan-r-open': `${(position * Math.min(44, count * 9)).toFixed(2)}deg`,
    '--fan-x-open': `${(position * 155.8).toFixed(1)}px`,
    '--fan-y-open': `${(position * position * 120).toFixed(1)}px`,
    zIndex: Math.round(10 - distance * 10),
  } as React.CSSProperties;
}

function getToolDisplayName(tool: Tool) {
  return tool.cardTitle || tool.title;
}

export default function Hero() {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-layout container">
          <div className="hero-copy">
            <p className="hero-overline caps"><i aria-hidden="true"></i>Free · No sign-up</p>

            <h1 className="hero-title" aria-label="Free Online Tools for Work, Business and Everyday Tasks">
              <span className="hero-title-line"><span>Free Online Tools&nbsp;for</span></span>
              <span className="hero-title-line"><span>Work, Business&nbsp;&amp;</span></span>
              <span className="hero-title-line">
                <span><span className="hero-highlight"><em>Everyday Tasks</em><svg viewBox="0 0 320 14" aria-hidden="true"><path pathLength="100" d="M4 10 C 58 3, 126 13, 190 7 S 276 3, 316 8" /></svg></span></span>
              </span>
            </h1>

            <p className="hero-subcopy">
              Why pay for tools you only need to get the job done? ToolTive brings practical online tools into one simple platform — from file conversion and image compression to business, SEO, and everyday productivity tasks.
            </p>

            <div className="hero-main-actions">
              <a
                href="/all-tools"
                className="hero-main-cta"
              >
                Start using the tools
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
              </a>
            </div>

          </div>

          <aside className="hero-tool-stage" aria-label="Published ToolTive tools">
            <span className="hero-tool-stamp" aria-hidden="true">
              {publishedTools.length} live tools
            </span>

            <ol className="hero-tool-fan" aria-label={`${publishedTools.length} published tools`}>
              {publishedTools.map((tool, index) => {
                const toolPath = `/all-tools/${tool.category}/${tool.slug}`;
                const displayName = getToolDisplayName(tool);
                return (
                  <li
                    className="hero-tool-card"
                    key={tool.id}
                    style={getFanCardStyle(index, publishedTools.length)}
                    data-tool-path={toolPath}
                  >
                    <span className="hero-tool-card-top">
                      <span className="hero-tool-card-category">{categoryLabels[tool.category] || tool.category}</span>
                      <span className="hero-tool-card-number">No. {String(index + 1).padStart(2, '0')}</span>
                    </span>
                    <strong className="hero-tool-card-name">{displayName}</strong>
                    <span className="hero-tool-card-footer">
                      <span className="hero-tool-card-meta">Free · No signup</span>
                      <a
                        href={toolPath}
                        className="hero-tool-card-arrow"
                        aria-label={`Open ${displayName}`}
                        title={`Open ${displayName}`}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 12h15" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </a>
                    </span>
                  </li>
                );
              })}
            </ol>

            <span className="hero-tool-caption">
              <i aria-hidden="true"></i>
              ToolTive catalogue
            </span>
          </aside>

          <p className="hero-footnote">
            <i aria-hidden="true"></i>
            <span>Privacy-conscious by design: browser-based tools process locally where supported, while remote workflows clearly indicate how data is handled.</span>
          </p>
        </div>
      </section>

      <section className="trust-strip" aria-label="Why ToolTive — trust points">
        <h2 className="trust-strip-heading">Free, practical and privacy-conscious online tools without unnecessary complexity</h2>
        <div className="trust-strip-inner container">
          <ul className="trust-strip-list">
            {valuePoints.map((point) => (
              <li className="trust-value" key={point.title}>
                <TrustIcon icon={point.icon} />
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
