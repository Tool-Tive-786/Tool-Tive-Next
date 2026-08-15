import React from 'react';

interface InfoItem {
    label: string;
    value: string;
}

interface ToolInfoSectionProps {
    items: InfoItem[];
    privacy?: {
        title: string;
        description: string;
    };
}

export default function ToolInfoSection({ items, privacy }: ToolInfoSectionProps) {
    if ((!items || items.length === 0) && !privacy) return null;

    return (
        <div className="container">
            <div className="tc-info">
                {items && items.length > 0 && (
                    <>
                        <div className="tc-section-eyebrow">Good to Know</div>
                        <div className="tc-info-grid">
                            {items.map((item, index) => (
                                <div key={index} className="tc-info-item">
                                    <div className="tc-info-label">{item.label}</div>
                                    <div className="tc-info-value">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {privacy && (
                    <div className="tc-privacy">
                        <div className="tc-privacy-icon">
                            <i className="fas fa-shield-halved" aria-hidden="true"></i>
                        </div>
                        <div>
                            <h4>{privacy.title}</h4>
                            <p>{privacy.description}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
