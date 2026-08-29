import React from "react";
import { Metadata } from 'next';
import FaqSection from '@/components/FaqSection';
import ToolHeroSection from '@/components/tool-content/ToolHeroSection';
import ToolContentLayout from '@/components/tool-content/ToolContentLayout';
import { ToolContentConfig } from '@/components/tool-content/ToolContentTypes';
import SitemapGeneratorNoSSR from '@/components/tools/sitemap-generator/SitemapGeneratorNoSSR';
import "@/styles/tool-content.css";
import "@/styles/sitemap-generator.css";

export const metadata: Metadata = {
    title: 'Free XML Sitemap Generator | ToolTive',
    description: 'Generate, crawl, and validate XML sitemaps with precision. Handles up to 50k URLs with automatic splitting and SEO health checks.',
    keywords: 'xml sitemap generator, sitemap validator, free sitemap generator, SEO sitemap, create sitemap online',
    robots: { index: true, follow: true },
    alternates: { canonical: '/all-tools/seo/free-xml-sitemap-generator' },
    openGraph: {
        title: 'Free XML Sitemap Generator',
        description: 'Generate, crawl, and validate XML sitemaps with precision.',
        url: '/all-tools/seo/free-xml-sitemap-generator',
        images: [{ url: '/icon.svg', width: 800, height: 600, alt: 'ToolTive XML Sitemap Generator' }],
    }
};

const sitemapContentConfig: ToolContentConfig = {
    categoryLabel: 'SEO TOOLS',
    intro: {
        heading: 'Free XML Sitemap',
        headingAccent: 'Generator.',
        description: 'Generate, crawl, and validate XML sitemaps with precision. Handles up to 50k URLs with automatic splitting and SEO health checks.',
    },
    valueProps: [
        {
            icon: 'fas fa-spider',
            title: 'Live Website Crawler',
            description: 'Intelligently crawls your site respecting robots.txt and canonical tags.'
        },
        {
            icon: 'fas fa-check-double',
            title: 'Sitemap Validation',
            description: 'Validates XML syntax, sitemap structure, and provides an SEO health score.'
        },
        {
            icon: 'fas fa-layer-group',
            title: 'Auto-Splitting',
            description: 'Automatically creates a sitemap index and splits files exceeding 50,000 URLs or 50MB.'
        }
    ],
    whyUse: {
        eyebrow: 'Why Use This Tool',
        heading: 'Why Use Our Sitemap Generator?',
        description: 'Many free generators impose strict limits (e.g. 500 pages) or simply fail on complex sites. Our tool is built with a serverless resumable architecture that can safely handle massive crawls, respect SEO directives, and automatically structure standard-compliant XML.',
        points: [
            {
                title: 'No superficial limits',
                description: 'Generate up to the sitemaps.org official limit of 50,000 URLs per file.'
            },
            {
                title: 'SEO-safe crawler',
                description: 'Our crawler reads robots.txt, respects canonical tags, and drops noindex pages automatically.'
            },
            {
                title: 'Deterministic & reliable',
                description: 'No AI hallucinations. Just standard deterministic parsing and validation.'
            }
        ]
    },
    features: {
        eyebrow: 'Key Features',
        heading: 'Crawl, Generate, Validate',
        description: 'Three core modes to handle all your sitemap needs.',
        items: [
            {
                title: 'Deduplication & Normalization',
                description: 'Automatically removes tracking parameters (utm_*, fbclid) and prevents duplicate URLs.'
            },
            {
                title: 'SSRF Protected Crawler',
                description: 'Safely fetches your pages, extracts internal links, and protects against malicious payloads.'
            },
            {
                title: 'Diagnostics Engine',
                description: 'Detects broken URLs, non-canonical inclusions, and schema limit violations.'
            }
        ]
    },
    howTo: {
        eyebrow: 'Step by Step',
        heading: 'How to Generate or Validate a Sitemap',
        description: 'Choose your mode and get started in seconds.',
        steps: [
            {
                title: 'Choose a Mode',
                description: 'Select URL List, Crawl Website, or Validate Sitemap.'
            },
            {
                title: 'Provide Input',
                description: 'Paste your URLs, enter your homepage, or upload your existing XML file.'
            },
            {
                title: 'Review Results',
                description: 'Check the generated table. You can manually exclude specific URLs if needed.'
            },
            {
                title: 'Download',
                description: 'Click Download XML. If limits are exceeded, a ZIP archive with a Sitemap Index is provided.'
            }
        ]
    },
    goodToKnow: [
        { label: 'Max URLs/file', value: '50,000' },
        { label: 'Max File Size', value: '50 MB' },
        { label: 'Format', value: 'XML (sitemaps.org)' }
    ],
    privacy: {
        title: 'Secure & Private',
        description: 'We do not store your generated sitemaps. Crawls are executed safely and temporarily in memory.'
    },
    relatedTools: [
        {
            href: '/all-tools/seo/free-seo-schema-markup-generator',
            title: 'Free SEO Schema Markup Generator',
            description: 'Generate, validate, and improve Schema.org JSON-LD markup for your website.',
            icon: 'fas fa-code'
        },
        {
            href: '/all-tools/compress/free-image-compressor',
            title: 'Image Compressor',
            description: 'Reduce image file sizes without losing quality.',
            icon: 'fas fa-compress-arrows-alt'
        }
    ]
};

const sitemapFaqs = [
    {
        question: "What is an XML sitemap?",
        answer: "An XML sitemap is a file that lists important URLs on a website to help search engines discover pages that you want them to crawl.",
        schemaAnswer: "An XML sitemap is a file that lists important URLs on a website to help search engines discover pages that you want them to crawl."
    },
    {
        question: "Can I generate an XML sitemap for my website for free?",
        answer: "Yes. This free XML sitemap generator can create a sitemap from your website URLs or a URL list, with no signup required.",
        schemaAnswer: "Yes. This free XML sitemap generator can create a sitemap from your website URLs or a URL list, with no signup required."
    },
    {
        question: "Should redirect and 404 URLs be included in a sitemap?",
        answer: "No. Redirecting URLs, 404/410 pages, and other unsuitable URLs should generally be excluded from the recommended XML sitemap. The final destination of a redirect can be included when it is a valid sitemap candidate.",
        schemaAnswer: "No. Redirecting URLs, 404/410 pages, and other unsuitable URLs should generally be excluded from the recommended XML sitemap. The final destination of a redirect can be included when it is a valid sitemap candidate."
    },
    {
        question: "How many URLs can an XML sitemap contain?",
        answer: "A single XML sitemap can contain up to 50,000 URLs or 50 MB of uncompressed XML, whichever limit is reached first. Larger websites can use multiple sitemap files with a sitemap index.",
        schemaAnswer: "A single XML sitemap can contain up to 50,000 URLs or 50 MB of uncompressed XML, whichever limit is reached first. Larger websites can use multiple sitemap files with a sitemap index."
    },
    {
        question: "Does an XML sitemap improve Google rankings?",
        answer: "An XML sitemap does not guarantee higher rankings. Its main purpose is to help search engines discover URLs that you want available for crawling and can be especially useful for larger or newer websites.",
        schemaAnswer: "An XML sitemap does not guarantee higher rankings. Its main purpose is to help search engines discover URLs that you want available for crawling and can be especially useful for larger or newer websites."
    }
];

export default function SitemapGeneratorPage() {
    // Structured data for the tool itself
    const toolJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free XML Sitemap Generator",
        "url": "https://tooltive.com/all-tools/seo/free-xml-sitemap-generator",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Generate, crawl, and validate XML sitemaps with precision. Handles up to 50k URLs with automatic splitting and SEO health checks."
    };

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
            />

            <ToolHeroSection
                categoryLabel={sitemapContentConfig.categoryLabel}
                heading={sitemapContentConfig.intro.heading}
                headingAccent={sitemapContentConfig.intro.headingAccent}
                description={sitemapContentConfig.intro.description}
            />
            
            <div className="tc-shell" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
                <SitemapGeneratorNoSSR />
            </div>

            <ToolContentLayout
                config={sitemapContentConfig}
            />

            <FaqSection
                faqs={sitemapFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our Free XML Sitemap Generator."
                label="FAQ"
            />
        </main>
    );
}
