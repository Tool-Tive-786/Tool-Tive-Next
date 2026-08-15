import React from 'react';

interface ValueProp {
    icon: string;
    title: string;
    description: string;
}

interface ToolValueStripProps {
    items: ValueProp[];
}

export default function ToolValueStrip({ items }: ToolValueStripProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="container">
            <div className="tc-value-strip">
                {items.map((item, index) => (
                    <div key={index} className="tc-value-item">
                        <div className="tc-value-icon">
                            <i className={item.icon} aria-hidden="true"></i>
                        </div>
                        <div className="tc-value-text">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
