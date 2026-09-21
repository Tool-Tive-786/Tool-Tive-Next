import { Suspense } from 'react';
import { getAllTools } from '@/lib/tools';
import ToolsPageClient from '@/components/ToolsPageClient';
import '@/styles/tools.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Tools',
    description: 'Browse all free online tools and utilities available on ToolTive, from PDF and image converters to business calculators and SEO generators.',
    alternates: { canonical: '/all-tools' },
    openGraph: {
        title: 'All Tools · ToolTive',
        description: 'Browse all free online tools and utilities available on ToolTive, from PDF and image converters to business calculators and SEO generators.',
        url: '/all-tools',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'All Tools · ToolTive',
        description: 'Browse all free online tools and utilities available on ToolTive, from PDF and image converters to business calculators and SEO generators.',
    },
};

export default function ToolsIndex() {
    const tools = getAllTools();

    return (
        <section className="tools-page container">
            <h1 className="page-heading" style={{ textAlign: 'center' }}>All Tools</h1>
            <p className="page-sub" style={{ margin: '8px auto 40px auto', textAlign: 'center' }}>
                Free, no-signup tools to make your work easier.
            </p>

            <ToolsPageClient activeCategory="all" tools={tools} />
        </section>
    );
}