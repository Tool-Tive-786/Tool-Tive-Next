import React from 'react';
import SiteIcon from '@/components/SiteIcon';

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
                            <SiteIcon name={item.icon} />
                        </div>
                        <div className="tc-value-text">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
