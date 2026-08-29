// Server Component for SEO purposes
import { Metadata } from 'next';
import FaqSection from '@/components/FaqSection';
import ToolHeroSection from '@/components/tool-content/ToolHeroSection';
import ToolContentLayout from '@/components/tool-content/ToolContentLayout';
import { ToolContentConfig } from '@/components/tool-content/ToolContentTypes';
import SchemaMarkupGeneratorNoSSR from '@/components/tools/schema-generator/SchemaMarkupGeneratorNoSSR';
import "@/styles/schema-markup-generator.css";

export const metadata: Metadata = {
    title: 'Free SEO Schema Markup Generator & Validator | ToolTive',
    description: 'Generate and validate Schema.org JSON-LD markup for articles, products, FAQs, businesses, and more with ToolTive\'s free online schema tool.',
    keywords: 'schema markup generator, SEO schema generator, JSON-LD generator, structured data generator, schema validator, SEO tool, free schema markup checker',
    robots: { index: true, follow: true },
    alternates: { canonical: '/all-tools/seo/free-seo-schema-markup-generator' },
};

// Content configuration
const schemaContentConfig: ToolContentConfig = {
    categoryLabel: 'SEO Tools',
    intro: {
        heading: 'Free SEO Schema Markup',
        headingAccent: 'Generator & Validator.',
        description: 'Generate, validate, and improve Schema.org JSON-LD markup for your website with a free browser-based tool.',
    },
    valueProps: [
        {
            icon: 'fas fa-code',
            title: '10+ Schema Types',
            description: 'Support for Article, FAQ, Product, LocalBusiness, Organization, and more.'
        },
        {
            icon: 'fas fa-check-circle',
            title: 'Real-time Validation',
            description: 'Catch errors and warnings before you publish to Google.'
        },
        {
            icon: 'fas fa-shield-alt',
            title: '100% Client-Side',
            description: 'Your data never leaves your browser.'
        },
        {
            icon: 'fas fa-save',
            title: 'Local Auto-save',
            description: 'Never lose your progress with local draft persistence.'
        }
    ],
    whyUse: {
        eyebrow: 'Why Use This Tool',
        heading: 'Why Use Our Free SEO Schema Markup Generator?',
        description: 'Writing JSON-LD by hand is prone to syntax errors and missing properties. Our tool builds structurally sound, semantically correct markup while ensuring you meet Schema.org guidelines without needing to code.',
        points: [
            {
                title: 'Avoid syntax errors',
                description: 'The visual builder prevents trailing commas and missing quotes.'
            },
            {
                title: 'Catch SEO issues early',
                description: 'The built-in validator highlights missing required properties before testing in Google.'
            },
            {
                title: 'No manual coding required',
                description: 'Simply fill out the form, and the JSON-LD is generated automatically.'
            },
            {
                title: 'Data loss protection',
                description: 'Your progress is automatically saved to your browser so you can resume later.'
            }
        ]
    },
    features: {
        eyebrow: 'Key Features',
        heading: 'Generate and Validate with Confidence',
        description: 'We combined generation and validation into one seamless workflow.',
        items: [
            {
                title: 'Live Preview',
                description: 'See the JSON-LD code update instantly as you type.'
            },
            {
                title: 'Smart Validator',
                description: 'Paste existing schema to detect syntax errors and missing properties.'
            },
            {
                title: 'Schema Graph Support',
                description: 'Build multiple related schemas in a single structured @graph.'
            },
            {
                title: '1-Click Copy & Download',
                description: 'Export your finished schema directly to your clipboard or as a file.'
            }
        ]
    },
    howTo: {
        eyebrow: 'Step by Step',
        heading: 'How to Generate SEO Schema Markup',
        description: 'Creating valid structured data is quick and simple.',
        steps: [
            {
                title: 'Select a Schema Type',
                description: 'Choose the schema that best matches your page content (e.g., Article, FAQ, Product).'
            },
            {
                title: 'Fill out the properties',
                description: 'Enter your data into the generated form fields. Required fields are marked.'
            },
            {
                title: 'Check Schema Health',
                description: 'Review any warnings or suggestions in the Schema Health panel to improve your markup.'
            },
            {
                title: 'Copy or Download',
                description: 'Copy the final JSON-LD snippet and place it in the <head> or <body> of your page.'
            }
        ]
    },
    goodToKnow: [
        { label: 'Supported Types', value: '10+ Core Schemas' },
        { label: 'Format', value: 'JSON-LD' },
        { label: 'Validation', value: 'Schema.org & Google Rules' },
        { label: 'Processing', value: 'Browser-Based' }
    ],
    privacy: {
        title: 'Browser-based processing',
        description: 'All schema generation and validation happens locally in your browser. No data is sent to our servers.'
    },
    relatedTools: [
        {
            href: '/all-tools/compress/free-image-compressor',
            title: 'Image Compressor',
            description: 'Reduce image file sizes without losing quality.',
            icon: 'fas fa-compress-arrows-alt'
        },
        {
            href: '/all-tools/business/free-invoice-generator',
            title: 'Free Invoice Generator',
            description: 'Create professional invoices, quotes, and credit notes directly in your browser.',
            icon: 'fas fa-file-invoice-dollar'
        }
    ]
};

const schemaFaqs = [
    {
        question: "What is Schema Markup?",
        answer: <>Schema markup (or structured data) is a standardized format for providing information about a page and classifying the page content, helping search engines understand it better.</>,
        schemaAnswer: "Schema markup (or structured data) is a standardized format for providing information about a page and classifying the page content, helping search engines understand it better."
    },
    {
        question: "Does Schema guarantee rich results in Google?",
        answer: <>No. Adding valid schema markup makes your page eligible for rich results, but Google ultimately decides whether to display them based on many factors including content quality and relevance.</>,
        schemaAnswer: "No. Adding valid schema markup makes your page eligible for rich results, but Google ultimately decides whether to display them based on many factors including content quality and relevance."
    },
    {
        question: "Can I validate my existing JSON-LD?",
        answer: <>Yes. Switch to the 'Validate' tab and paste your JSON-LD code to check for syntax errors and missing properties.</>,
        schemaAnswer: "Yes. Switch to the 'Validate' tab and paste your JSON-LD code to check for syntax errors and missing properties."
    },
    {
        question: "Is it safe to paste sensitive data into the validator?",
        answer: <>Yes. The tool runs entirely in your browser. We do not send your pasted code or entered data to any server.</>,
        schemaAnswer: "Yes. The tool runs entirely in your browser. We do not send your pasted code or entered data to any server."
    }
];

export default function SchemaGeneratorPage() {
    // Structured data for the tool itself
    const toolJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free SEO Schema Markup Generator & Validator",
        "url": "https://tooltive.com/all-tools/seo/free-seo-schema-markup-generator",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Generate, validate, and improve Schema.org JSON-LD markup for your website."
    };

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
            />

            <ToolHeroSection
                categoryLabel={schemaContentConfig.categoryLabel}
                heading={schemaContentConfig.intro.heading}
                headingAccent={schemaContentConfig.intro.headingAccent}
                description={schemaContentConfig.intro.description}
            />

            <SchemaMarkupGeneratorNoSSR />

            <ToolContentLayout config={schemaContentConfig} />

            <FaqSection
                faqs={schemaFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our Free SEO Schema Markup Generator."
                label="FAQ"
            />
        </main>
    );
}
