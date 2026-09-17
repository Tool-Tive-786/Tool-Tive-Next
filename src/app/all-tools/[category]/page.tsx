import React from 'react';
import Link from 'next/link';
import { getToolsByCategory, getCategories } from '@/lib/tools';
import ToolCard from '@/components/ToolCard';
import { notFound } from 'next/navigation';
import '@/styles/tools.css';

interface Props {
  params: Promise<{
    category: string;
  }>;
}

const categoryMetaMap: Record<string, { title: string; desc: string; heading: string }> = {
  pdf: {
    title: 'Free Online PDF Tools & Converters | ToolTive',
    desc: 'Convert images to PDF and manage document workflows directly in your browser. Fast, secure, and 100% free with no file uploads to servers.',
    heading: 'PDF Tools',
  },
  compress: {
    title: 'Free Image Compressor & Resizer Online | ToolTive',
    desc: 'Compress JPG, PNG, and WebP images by up to 90% without losing quality. Fast client-side image optimization with zero watermarks or file uploads.',
    heading: 'Image Compression Tools',
  },
  business: {
    title: 'Free Business Tools & Financial Calculators | ToolTive',
    desc: 'Generate professional invoices and calculate profit margins with ToolTive’s free online business tools. Fast, private, and no signup required.',
    heading: 'Business & Financial Tools',
  },
  seo: {
    title: 'Free Technical SEO Tools & Generators | ToolTive',
    desc: 'Generate and validate Schema.org JSON-LD, XML sitemaps, and robots.txt directives with ToolTive’s free technical SEO utilities.',
    heading: 'Technical SEO Tools',
  },
};

const categoryIntroContent: Record<string, React.ReactNode> = {
  pdf: (
    <>
      <p>
        ToolTive’s browser-based PDF utilities empower professionals, students, creators, and freelancers to handle everyday document workflows quickly and securely. Modern digital paperwork should not require cumbersome desktop software installations or expensive recurring subscriptions. Our PDF tools are engineered to execute processing directly inside your web browser using client-side JavaScript, meaning your sensitive images, receipts, and personal documents never need to be uploaded to our servers for conversion.
      </p>
      <p style={{ marginTop: '12px' }}>
        Whether you need to convert and merge multiple photo formats (JPG, PNG, WebP) into a clean, consolidated PDF document for job applications, compile receipts for accounting records, or assemble study notes for school projects, ToolTive delivers crisp, cleanly formatted outputs in seconds. Enjoy instant conversions with zero watermarks, no daily limits, and complete on-device privacy across your desktop, tablet, or smartphone.
      </p>
    </>
  ),
  compress: (
    <>
      <p>
        Optimizing visual media is essential for modern web performance, faster page loading, improved search engine rankings, and efficient storage management. ToolTive&apos;s image compression suite enables users to dramatically shrink file weights for JPG, PNG, and WebP images by up to 90% while preserving high visual fidelity and sharpness.
      </p>
      <p style={{ marginTop: '12px' }}>
        Because our compression algorithms operate entirely on the client side using your browser’s local canvas and blob engines, your private graphics, product photography, and personal pictures are processed directly on your device without ever being uploaded across the network. Adjust compression levels in real time to strike the ideal balance between quality and file size, compare before-and-after weights instantly, and batch-download web-ready assets ready for publishing, emailing, or social media sharing—completely free, with no account registration or watermarks.
      </p>
    </>
  ),
  business: (
    <>
      <p>
        Managing commercial finances, pricing structures, and client transactions should be accurate, reliable, and accessible without expensive accounting software. ToolTive’s business utilities serve freelancers, small business owners, e-commerce sellers, and independent contractors with essential everyday workflows.
      </p>
      <p style={{ marginTop: '12px' }}>
        Generate professional, customized invoices with automated tax, discount calculations, and instant PDF downloads using our Free Invoice Generator. Accurately plan product pricing, determine required markups, and protect bottom-line revenues using our Free Profit Margin Calculator, which factors in cost of goods, marketplace seller fees, shipping expenses, and promotional discounts. Because these calculations and draft templates operate locally within your browser, your proprietary sales figures, client billing records, and financial margins remain completely private on your personal device.
      </p>
    </>
  ),
  seo: (
    <>
      <p>
        Technical search engine optimization is the foundation of digital visibility and sustainable organic search traffic. ToolTive provides a suite of interconnected, free, browser-based SEO utilities designed to help webmasters, developers, and digital marketers audit and implement essential site architecture signals.
      </p>
      <p style={{ marginTop: '12px' }}>
        Structure your content for rich snippets, search enhancements, and improved click-through rates using our <Link href="/all-tools/seo/free-seo-schema-markup-generator" style={{ color: 'var(--accent)', fontWeight: 600 }}>Schema Markup Generator</Link>, which generates and validates Schema.org JSON-LD for Articles, Products, FAQs, and Local Businesses. Ensure search engine bots discover and index all your important content by generating and validating comprehensive XML feeds with our <Link href="/all-tools/seo/free-xml-sitemap-generator" style={{ color: 'var(--accent)', fontWeight: 600 }}>XML Sitemap Generator</Link>. Finally, steer crawler behavior, prevent crawling of duplicate content, and test access permissions with our <Link href="/all-tools/seo/free-robots-txt-generator" style={{ color: 'var(--accent)', fontWeight: 600 }}>Robots.txt Generator &amp; Tester</Link>. Together, these tools form a cohesive technical SEO toolkit for maintaining healthy, crawlable, and indexable websites without subscription limits.
      </p>
    </>
  ),
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.category.toLowerCase();
  const meta = categoryMetaMap[category];

  if (!meta) {
    return {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Tools | ToolTive`,
      description: `Free online ${category} tools from ToolTive.`,
      alternates: { canonical: `/all-tools/${category}` },
    };
  }

  return {
    title: meta.title,
    description: meta.desc,
    alternates: { canonical: `/all-tools/${category}` },
  };
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.category.toLowerCase();

  const categoryTools = getToolsByCategory(category);

  if (categoryTools.length === 0) {
    notFound();
  }

  const meta = categoryMetaMap[category];
  const heading = meta?.heading || `${category.charAt(0).toUpperCase() + category.slice(1)} Tools`;
  const intro = categoryIntroContent[category];

  return (
    <main className="tools-page container">
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 className="page-heading">
          {heading}
        </h1>
      </div>

      {intro && (
        <div
          className="category-intro-box"
          style={{
            maxWidth: '860px',
            margin: '0 auto 48px auto',
            padding: '24px 28px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)',
            fontSize: '0.96rem',
            lineHeight: '1.7',
            textAlign: 'left',
          }}
        >
          {intro}
        </div>
      )}

      <ul className="tools-grid tool-card-grid">
        {categoryTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
          />
        ))}
      </ul>
    </main>
  );
}
