import React from 'react';

interface ToolHeroSectionProps {
    categoryLabel: string;
    heading: string;
    headingAccent: string;
    description: string;
    featuredImage?: string;
    featuredImageAlt?: string;
}

export default function ToolHeroSection({
    categoryLabel,
    heading,
    headingAccent,
    description,
    featuredImage,
    featuredImageAlt
}: ToolHeroSectionProps) {
    return (
        <section className="container tc-hero">
            <div className="tc-hero-content">
                <div className="tc-hero-eyebrow">{categoryLabel}</div>
                <h1 className="tc-hero-title">
                    {heading} <span>{headingAccent}</span>
                </h1>
                <p className="tc-hero-desc">{description}</p>
            </div>
            {/* 
                Hero image rendering removed as per centered hero design update. 
                featuredImage props are preserved to avoid breaking parent components 
                or SEO metadata flows.
            */}
        </section>
    );
}
