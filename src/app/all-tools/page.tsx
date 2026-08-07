import { Suspense } from 'react';
import { getAllTools } from '@/lib/tools';
import ToolsPageClient from '@/components/ToolsPageClient';
import '@/styles/tools.css';

export const metadata = {
    title: 'All Tools',
    description: 'Browse all free online tools available on ToolTive.',
    alternates: { canonical: '/all-tools' },
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