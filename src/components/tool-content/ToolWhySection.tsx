import React from 'react';

interface WhyPoint {
    title: string;
    description?: string;
}

interface ToolWhySectionProps {
    eyebrow: string;
    heading: string;
    description: string;
    points: WhyPoint[];
}

export default function ToolWhySection({ eyebrow, heading, description, points }: ToolWhySectionProps) {
    return (
        <section className="container">
            <div className="tc-split">
                <div className="tc-split-left">
                    <div className="tc-section-eyebrow">{eyebrow}</div>
                    <h2 className="tc-section-heading">{heading}</h2>
                    <p className="tc-section-desc">{description}</p>
                </div>
                <div className="tc-split-right">
                    <ul className="tc-points">
                        {points.map((point, index) => (
                            <li key={index} className="tc-point">
                                <span className="tc-point-num">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="tc-point-body">
                                    <h4>{point.title}</h4>
                                    {point.description && <p>{point.description}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
