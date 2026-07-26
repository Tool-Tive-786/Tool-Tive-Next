"use client";

import Link from 'next/link';

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  tags: string[];
  category: string;
  href: string;
}

export default function ToolCard({ title, description, icon, tags, category, href }: ToolCardProps) {
  return (
    <li style={{ listStyle: 'none', display: 'flex' }}>
      <Link href={href} className="tool-card" data-category={category} itemProp="itemListElement" itemScope itemType="https://schema.org/SoftwareApplication" style={{ width: '100%' }}>
        <div className="tool-card-body">
            <div className="tool-card-header">
                <div className="tool-icon-wrap" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }}>
                </div>
                <div className="tool-arrow" aria-hidden="true">
                    <i className="fas fa-arrow-right"></i>
                </div>
            </div>
            <h3 itemProp="name">{title}</h3>
            <p itemProp="description">{description}</p>
            <div className="tool-tags">
                {tags.map((tag, idx) => (
                    <span key={idx} className="tool-tag">{tag}</span>
                ))}
            </div>
        </div>
        <footer className="tool-card-footer">
            <div className="tool-status">
                <span className="status-dot"></span>
                Free &bull; No Signup
            </div>
            <div className="tool-cta">
                Open Tool <i className="fas fa-arrow-right"></i>
            </div>
        </footer>
      </Link>
    </li>
  );
}
