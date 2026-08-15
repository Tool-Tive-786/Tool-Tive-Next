import React from 'react';

interface Step {
    title: string;
    description: string;
}

interface ToolHowToSectionProps {
    eyebrow: string;
    heading: string;
    description: string;
    steps: Step[];
}

export default function ToolHowToSection({ eyebrow, heading, description, steps }: ToolHowToSectionProps) {
    return (
        <section className="container">
            <div className="tc-split">
                <div className="tc-split-left">
                    <div className="tc-section-eyebrow">{eyebrow}</div>
                    <h2 className="tc-section-heading">{heading}</h2>
                    <p className="tc-section-desc">{description}</p>
                </div>
                <div className="tc-split-right">
                    <div className="tc-steps-grid">
                        {steps.map((step, index) => (
                            <div key={index} className="tc-step">
                                <div className="tc-step-num">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <h4>{step.title}</h4>
                                <p>{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
