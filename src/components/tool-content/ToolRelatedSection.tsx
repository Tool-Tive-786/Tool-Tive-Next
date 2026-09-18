import React from 'react';
import Link from 'next/link';
import SiteIcon from '@/components/SiteIcon';

interface RelatedTool {
    href: string;
    title: string;
    description: string;
    icon: string;
}

interface ToolRelatedSectionProps {
    tools: RelatedTool[];
}

export default function ToolRelatedSection({ tools }: ToolRelatedSectionProps) {
    if (!tools || tools.length === 0) return null;

    return (
        <div className="container">
            <div className="tc-related">
                <h2 className="tc-related-heading">Explore Related Tools</h2>
                <div className="tc-related-grid">
                    {tools.map((tool, index) => (
                        <Link key={index} href={tool.href} className="tc-related-card">
                            <div className="tc-related-icon">
                                <SiteIcon name={tool.icon} />
                            </div>
                            <div>
                                <h3>{tool.title}</h3>
                                <p>{tool.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
