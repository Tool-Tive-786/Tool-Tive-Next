import { Metadata } from 'next';
import AISearchOptimizerNoSSR from '@/components/tools/ai-search-optimizer/AISearchOptimizerNoSSR';
import ToolHeroSection from '@/components/tool-content/ToolHeroSection';
import ToolContentLayout from '@/components/tool-content/ToolContentLayout';
import FaqSection from '@/components/FaqSection';
import { ToolContentConfig } from '@/components/tool-content/ToolContentTypes';
import { getToolBySlug } from '@/lib/tools';
import '@/styles/tool-content.css';
import '@/styles/ai-search-optimizer.css';

export const metadata: Metadata = {
    title: 'AI Search Optimizer - Basic Scan Report',
    description: 'Audit your website for technical accessibility, security, and AI-search readiness signals with our free Basic Scan.',
    keywords: 'AI Search Optimizer, AI Search Readiness, Website Audit, SEO Scan, Technical SEO, Website Crawler',
    robots: { index: true, follow: true },
    alternates: { canonical: '/all-tools/seo/ai-search-optimizer' },
};

const aiSearchContentConfig: ToolContentConfig = {
    categoryLabel: 'SEO Tools',
    intro: {
        heading: 'AI Search',
        headingAccent: 'Optimizer.',
        description: 'Audit your website for technical accessibility, security, and AI-search readiness signals with our free Basic Scan. Understand what AI search engines see and how to improve your site.',
    },
    valueProps: [
        {
            icon: 'fas fa-robot',
            title: 'AI Readiness',
            description: 'Evaluate your site against AI-search readiness signals.'
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Security Posture',
            description: 'Check HTTPS, mixed content, and essential security headers.'
        },
        {
            icon: 'fas fa-search',
            title: 'Discoverability',
            description: 'Audit robots.txt, XML sitemaps, and internal linking structure.'
        },
        {
            icon: 'fas fa-code',
            title: 'Structured Data',
            description: 'Validate Schema.org JSON-LD to help AI understand your content.'
        }
    ],
    whyUse: {
        eyebrow: 'Why Use This Tool',
        heading: 'Why optimize for AI Search?',
        description: 'Search engines are increasingly using AI to answer user queries directly. Ensuring your site is technically accessible, clearly structured, and uses structured data helps AI understand and cite your content.',
        points: [
            {
                title: 'Clear signals matter',
                description: 'AI bots rely on clear headings, concise text, and structured data to synthesize answers.'
            },
            {
                title: 'Technical health is the foundation',
                description: 'If a bot cannot crawl your site due to poor robots.txt rules or server errors, your content will not be cited.'
            }
        ]
    },
    features: {
        eyebrow: 'Features',
        heading: 'Basic Scan Scope',
        description: 'The Basic Scan checks up to 10 pages for the following signals.',
        items: [
            {
                title: 'Technical Accessibility',
                description: 'HTTP status, HTTPS, canonical tags, and robots permissions.'
            },
            {
                title: 'Content Clarity',
                description: 'Title tags, H1 headings, and meaningful visible text length.'
            },
            {
                title: 'Internal Linking',
                description: 'Checks if important pages are discoverable via internal links.'
            },
            {
                title: 'Schema & Ecosystem',
                description: 'Detects Schema.org JSON-LD and ecosystem signals like llms.txt.'
            }
        ]
    },
    howTo: {
        eyebrow: 'How To Use',
        heading: 'How to scan your website',
        description: 'Follow these steps to run a Basic Scan.',
        steps: [
            {
                title: 'Enter your URL',
                description: 'Provide the public website URL you want to audit. Make sure it is publicly accessible.'
            },
            {
                title: 'Start the scan',
                description: 'Click "Start Basic Scan". The crawler will fetch the homepage, robots.txt, sitemaps, and up to 10 pages.'
            },
            {
                title: 'Review the report',
                description: 'Once complete, review the overall score and prioritized recommendations to improve your site.'
            }
        ]
    },
    relatedTools: [
        {
            href: '/all-tools/seo/free-robots-txt-generator',
            title: 'Free Robots.txt Generator & Tester',
            description: 'Create and test crawler directives to guide search bots effectively.',
            icon: 'fas fa-robot'
        },
        {
            href: '/all-tools/seo/free-xml-sitemap-generator',
            title: 'Free XML Sitemap Generator',
            description: 'Generate and validate XML sitemaps to ensure all pages are discovered.',
            icon: 'fas fa-sitemap'
        },
        {
            href: '/all-tools/seo/free-seo-schema-markup-generator',
            title: 'Free SEO Schema Markup Generator',
            description: 'Generate, validate, and improve Schema.org JSON-LD structured data.',
            icon: 'fas fa-code'
        }
    ]
};

const aiSearchFaqs = [
    {
        question: 'What is the Basic Scan?',
        answer: 'The Basic Scan is a fast, deterministic audit of up to 10 pages on your website. It checks technical SEO, security headers, and AI-search readiness signals.'
    },
    {
        question: 'Does this guarantee inclusion in AI overviews?',
        answer: 'No. This tool measures technical readiness signals, but cannot guarantee rankings or inclusion in any specific AI search experience like Google AI Overviews or ChatGPT.'
    },
    {
        question: 'Why did the scan fail to crawl my site?',
        answer: 'The crawler respects robots.txt directives and strict security boundaries (SSRF protection). If your site blocks bots or is hosted on a private network, the scan will fail or skip pages.'
    }
];

export default function AISearchOptimizerPage() {
    const tool = getToolBySlug("ai-search-optimizer");

    if (!tool) {
        return <div>Tool not found in registry.</div>;
    }

    return (
        <main className="tools-page">
            <ToolHeroSection
                categoryLabel={aiSearchContentConfig.categoryLabel}
                heading={aiSearchContentConfig.intro.heading}
                headingAccent={aiSearchContentConfig.intro.headingAccent}
                description={aiSearchContentConfig.intro.description}
            />

            <div className="tc-shell" style={{ marginTop: '1.5rem', marginBottom: '4rem' }}>
                <AISearchOptimizerNoSSR />
            </div>

            <ToolContentLayout config={aiSearchContentConfig} />

            <FaqSection
                faqs={aiSearchFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Common questions about AI search optimization, crawler behavior, and scan reports."
                label="FAQ"
            />
        </main>
    );
}
