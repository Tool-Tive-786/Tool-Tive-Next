import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

interface ArticleCardProps {
    title: string;
    description: string;
    category: string;
    slug: string;
    pubDate: string;
    contentHtml?: string;
    image?: string;
    imageAlt?: string;
    imageTitle?: string;
}

function getDateParts(pubDate: string) {
    const value = /^\d{4}-\d{2}-\d{2}$/.test(pubDate) ? `${pubDate}T00:00:00Z` : pubDate;
    const date = new Date(value);

    return {
        day: new Intl.DateTimeFormat('en-US', { day: '2-digit', timeZone: 'UTC' }).format(date),
        month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date),
        full: new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(date),
    };
}

function getReadingTime(contentHtml = '') {
    const words = contentHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 220));
}

export default function ArticleCard({
    title,
    description,
    category,
    slug,
    pubDate,
    contentHtml,
    image,
    imageAlt,
    imageTitle,
}: ArticleCardProps) {
    const date = getDateParts(pubDate);
    const readingTime = getReadingTime(contentHtml);
    const href = `/blog/${category}/${slug}`;
    const featuredImage = image || '/hero-section.webp';
    const canonicalUrl = `https://tooltive.com${href}`;
    const schemaImage = featuredImage.startsWith('http') ? featuredImage : `https://tooltive.com${featuredImage}`;
    const formattedCategory = category.replace(/-/g, ' ');

    return (
        <li>
            <Link
                href={href}
                className="blog-reading-row"
                itemProp="blogPost"
                itemScope
                itemType="https://schema.org/BlogPosting"
                aria-label={`Read ${title}, ${readingTime} minute read`}
            >
                <meta itemProp="url mainEntityOfPage" content={canonicalUrl} />
                <meta itemProp="image" content={schemaImage} />
                <meta itemProp="timeRequired" content={`PT${readingTime}M`} />
                <meta itemProp="dateModified" content={pubDate} />
                <span itemProp="author publisher" itemScope itemType="https://schema.org/Organization" hidden>
                    <meta itemProp="name" content="ToolTive" />
                    <meta itemProp="url" content="https://tooltive.com" />
                </span>

                <time className="blog-reading-date" dateTime={pubDate} itemProp="datePublished">
                    <strong>{date.day}</strong>
                    <span>{date.month}</span>
                    <span className="card-sr-only">{date.full}</span>
                </time>

                <span className="blog-reading-image">
                    <Image
                        src={featuredImage}
                        alt={imageAlt || title}
                        title={imageTitle || title}
                        fill
                        sizes="(max-width: 600px) 68px, (max-width: 860px) 112px, 140px"
                    />
                </span>

                <span className="blog-reading-body">
                    <span className="blog-reading-category caps" itemProp="articleSection">{formattedCategory}</span>
                    <span className="blog-reading-title" itemProp="headline">{title}</span>
                    <span className="blog-reading-description" itemProp="description">{description}</span>
                </span>

                <span className="blog-reading-end" aria-hidden="true">
                    <span className="blog-reading-gauge">
                        <span style={{ '--reading-progress': `${Math.min(readingTime * 13, 86)}%` } as CSSProperties}></span>
                    </span>
                    <span className="blog-reading-time">{readingTime} min</span>
                    <svg viewBox="0 0 24 24">
                        <path d="M4 12h15" />
                        <path d="m13 6 6 6-6 6" />
                    </svg>
                </span>
            </Link>
        </li>
    );
}
