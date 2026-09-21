import React from "react";
import type { Metadata } from "next";
import FaqSection from "@/components/FaqSection";
import ToolHeroSection from "@/components/tool-content/ToolHeroSection";
import ToolContentLayout from "@/components/tool-content/ToolContentLayout";
import { ToolContentConfig } from "@/components/tool-content/ToolContentTypes";
import RobotsTxtTool from "@/components/tools/robots-txt/RobotsTxtTool";
import "@/styles/tool-content.css";
import "@/styles/robots-txt.css";

export const metadata: Metadata = {
    title: {
        absolute: "Free Robots.txt Generator & Tester | ToolTive"
    },
    description: "Generate, test, and validate robots.txt rules for search crawlers with ToolTive's free online robots.txt generator and tester.",
    keywords: "robots.txt generator, robots.txt tester, robots.txt checker, robots.txt validator, robots txt generator free, robots.txt checker online, test robots.txt, robots.txt generator online, robots.txt allow disallow, robots.txt sitemap, robots.txt user agent",
    robots: { index: true, follow: true },
    alternates: { canonical: "/all-tools/seo/free-robots-txt-generator" },
    openGraph: {
        title: "Free Robots.txt Generator & Tester | ToolTive",
        description: "Generate, test, and validate robots.txt rules for search crawlers with ToolTive's free online robots.txt generator and tester.",
        url: "/all-tools/seo/free-robots-txt-generator",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Robots.txt Generator & Tester | ToolTive",
        description: "Generate, test, and validate robots.txt rules for search crawlers with ToolTive's free online robots.txt generator and tester.",
    },
};

const robotsTxtContentConfig: ToolContentConfig = {
    categoryLabel: "SEO TOOLS",
    intro: {
        heading: "Free Robots.txt",
        headingAccent: "Generator & Tester.",
        description: "Generate, test, and validate robots.txt rules for search crawlers with a clean, privacy-focused browser tool. Control crawler access, specify sitemaps, and test URLs before deployment.",
    },
    valueProps: [
        {
            icon: "fas fa-robot",
            title: "Crawler Control",
            description: "Customize directives for Googlebot, Bingbot, and AI crawlers with precise allow/disallow paths."
        },
        {
            icon: "fas fa-vial",
            title: "Instant Rule Testing",
            description: "Test your live or custom URLs against robots.txt directives to catch blocking errors."
        },
        {
            icon: "fas fa-shield-alt",
            title: "100% Client-Side",
            description: "Your directives and configurations are processed right in your browser for maximum privacy."
        },
        {
            icon: "fas fa-file-code",
            title: "Syntax Compliant",
            description: "Produces clean, RFC-standard compliant robots exclusion protocol markup ready for production."
        }
    ],
    whyUse: {
        eyebrow: "Why Use This Tool",
        heading: "Why Use Our Free Robots.txt Generator & Tester?",
        description: "A single misconfigured character in robots.txt can inadvertently de-index an entire website or block essential CSS and JavaScript assets. Our tool helps you construct compliant directives visually and test real paths before going live.",
        points: [
            {
                title: "Prevent accidental indexing blocks",
                description: "Ensure your primary pages and assets remain crawlable by major search engines while keeping admin directories private."
            },
            {
                title: "Test before deploying",
                description: "Check whether critical landing pages are allowed or disallowed before uploading changes to your server."
            },
            {
                title: "Declare sitemaps accurately",
                description: "Automatically append valid XML sitemap directives so web crawlers discover your content hierarchy efficiently."
            },
            {
                title: "No signup or server upload required",
                description: "Everything runs client-side in your web browser with instantaneous preview, copy, and file export."
            }
        ]
    },
    features: {
        eyebrow: "Key Features",
        heading: "Generate, Validate, and Test Directives",
        description: "A complete toolkit designed to streamline robots.txt file creation and audit.",
        items: [
            {
                title: "Visual Rule Builder",
                description: "Easily add, edit, and organize allow and disallow directives for specific user-agents or all bots."
            },
            {
                title: "Real-Time URL Tester",
                description: "Enter any URL path to instantly verify whether crawlers are granted or denied access."
            },
            {
                title: "Sitemap Declarations",
                description: "Add one or multiple XML sitemap URLs directly to the bottom of your generated robots.txt."
            },
            {
                title: "1-Click Copy & Download",
                description: "Export the finalized text file instantly or copy the raw directives directly to your clipboard."
            }
        ]
    },
    howTo: {
        eyebrow: "Step by Step",
        heading: "How to Generate and Test Your Robots.txt File",
        description: "Build standard-compliant crawler instructions in four straightforward steps.",
        steps: [
            {
                title: "Configure User-Agents",
                description: "Target all bots with a wildcard (*) or configure directives for specific search crawlers."
            },
            {
                title: "Specify Allow and Disallow Rules",
                description: "Add paths you want crawlers to access or avoid (e.g., /admin/, /private/, /api/)."
            },
            {
                title: "Include Sitemap URL",
                description: "Provide the absolute URL of your XML sitemap so bots can easily find your index."
            },
            {
                title: "Test and Export",
                description: "Test key URLs with the validator, then download your robots.txt file to place in your site's root."
            }
        ]
    },
    goodToKnow: [
        { label: "Standard", value: "Robots Exclusion Protocol" },
        { label: "Default Location", value: "root domain (/robots.txt)" },
        { label: "Directives", value: "User-agent, Allow, Disallow, Sitemap" },
        { label: "Processing", value: "Browser-Based" }
    ],
    privacy: {
        title: "Browser-based processing",
        description: "Your robots.txt rules, site URLs, and test queries are processed entirely in your web browser. Nothing is stored on our servers."
    },
    relatedTools: [
        {
            href: "/all-tools/seo/free-xml-sitemap-generator",
            title: "XML Sitemap Generator",
            description: "Generate, crawl, and validate XML sitemaps with up to 50k URLs and automatic splitting.",
            icon: "fas fa-sitemap"
        },
        {
            href: "/all-tools/seo/free-seo-schema-markup-generator",
            title: "Schema Markup Generator",
            description: "Generate, validate, and improve Schema.org JSON-LD markup for your website.",
            icon: "fas fa-code"
        }
    ]
};

const robotsTxtFaqs = [
    {
        question: "What is a robots.txt file?",
        answer: <>A robots.txt file is a plain text file placed in the root directory of your website to tell search engine crawlers which pages or files they can or cannot request from your site.</>,
        schemaAnswer: "A robots.txt file is a plain text file placed in the root directory of your website to tell search engine crawlers which pages or files they can or cannot request from your site."
    },
    {
        question: "Where should the robots.txt file be placed?",
        answer: <>The robots.txt file must always be located at the top-level root of your domain (for example, <code>https://example.com/robots.txt</code>). Subdirectory placements like <code>https://example.com/blog/robots.txt</code> are ignored by search crawlers.</>,
        schemaAnswer: "The robots.txt file must always be located at the top-level root of your domain (for example, https://example.com/robots.txt). Subdirectory placements are ignored by search crawlers."
    },
    {
        question: "Does robots.txt prevent pages from being indexed?",
        answer: <>Not necessarily. Robots.txt tells search engines not to crawl a page. If other sites link to that disallowed page, search engines might still index the URL without crawling its content. To guarantee a page is not indexed, use a <code>noindex</code> meta tag or HTTP header.</>,
        schemaAnswer: "Not necessarily. Robots.txt tells search engines not to crawl a page. If other sites link to that disallowed page, search engines might still index the URL without crawling its content. To guarantee a page is not indexed, use a noindex meta tag or HTTP header."
    },
    {
        question: "How do I test if my robots.txt is working properly?",
        answer: <>You can test your directives right inside our tool by entering sample URLs into the rule tester, or verify after deployment using Google Search Console's URL Inspection tool.</>,
        schemaAnswer: "You can test your directives right inside our tool by entering sample URLs into the rule tester, or verify after deployment using Google Search Console's URL Inspection tool."
    }
];

export default function RobotsTxtGeneratorPage() {
    const toolJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free Robots.txt Generator & Tester",
        "url": "https://tooltive.com/all-tools/seo/free-robots-txt-generator",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Generate, test, and validate robots.txt rules for search crawlers with ToolTive's free online robots.txt generator and tester."
    };

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
            />

            <ToolHeroSection
                categoryLabel={robotsTxtContentConfig.categoryLabel}
                heading={robotsTxtContentConfig.intro.heading}
                headingAccent={robotsTxtContentConfig.intro.headingAccent}
                description={robotsTxtContentConfig.intro.description}
            />

            <RobotsTxtTool />

            <ToolContentLayout config={robotsTxtContentConfig} />

            <FaqSection
                faqs={robotsTxtFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Common questions about robots.txt configuration, crawler behavior, and SEO best practices."
                label="FAQ"
            />
        </main>
    );
}
