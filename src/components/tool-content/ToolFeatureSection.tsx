import React from 'react';

interface FeatureItem {
    title: string;
    description: string;
}

interface ToolFeatureSectionProps {
    eyebrow: string;
    heading: string;
    description: string;
    items: FeatureItem[];
}

export default function ToolFeatureSection({ eyebrow, heading, description, items }: ToolFeatureSectionProps) {
    return (
        <section className="container">
            <div className="tc-split">
                <div className="tc-split-left">
                    <div className="tc-section-eyebrow">{eyebrow}</div>
                    <h2 className="tc-section-heading">{heading}</h2>
                    <p className="tc-section-desc">{description}</p>
                </div>
                <div className="tc-split-right">
                    <div className="tc-features-grid">
                        {items.map((item, index) => (
                            <div key={index} className="tc-feature">
                                <h4>{item.title}</h4>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
