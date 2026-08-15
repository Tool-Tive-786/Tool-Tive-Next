import React from 'react';
import Link from 'next/link';

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
                                <i className={tool.icon} aria-hidden="true"></i>
                            </div>
                            <div>
                                <h4>{tool.title}</h4>
                                <p>{tool.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
