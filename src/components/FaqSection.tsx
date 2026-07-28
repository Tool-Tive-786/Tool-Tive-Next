"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import '@/styles/faq.css';

export interface FaqItem {
    question: string;
    answer: React.ReactNode;
    schemaAnswer?: string; // Explicit string for SEO schema, since answer is ReactNode
}

interface FaqSectionProps {
    faqs?: FaqItem[];
    title?: React.ReactNode;
    description?: React.ReactNode;
    label?: string;
    showCta?: boolean;
}

const defaultFaqs: FaqItem[] = [
    {
        question: "Are the tools on ToolTive really free?",
        answer: <>Yes, all tools on ToolTive including the Invoice Generator and Image Refiner are <strong>100% free</strong> to use with no hidden costs, subscriptions, or watermarks. We believe powerful tools should be accessible to everyone.</>
    },
    {
        question: "Do I need to create an account?",
        answer: <>No signup is required. You can use all our tools <strong>instantly</strong> directly in your browser without creating an account or providing an email address. Just open, use, and go.</>
    },
    {
        question: "Is my data secure?",
        answer: <>Absolutely. All processing happens <strong>locally</strong> in your web browser. We do not store your images, financial data, or documents on our servers. Once you close the tab, the data is gone.</>
    },
    {
        question: "Can I use ToolTive tools on my mobile device?",
        answer: <>Yes! All our tools are <strong>fully responsive</strong> and work perfectly on smartphones, tablets, and desktop computers. No app download is needed — just visit our website from any browser.</>
    },
    {
        question: "Are there any usage limits?",
        answer: <>No, there are <strong>no daily or monthly usage limits</strong>. You can use our tools as many times as you need, completely free of charge. Process hundreds of files if you want!</>
    },
    {
        question: "How do I report a bug or suggest a new tool?",
        answer: <>We love feedback! You can reach out to us through our <strong>Contact page</strong> or email us directly. We read every message and constantly add new tools based on user requests.</>
    }
];

export default function FaqSection({
    faqs = defaultFaqs,
    title = <>Frequently Asked <span className="highlight">Questions.</span></>,
    description = "Everything you need to know about ToolTive and how our tools work securely in your browser.",
    label = "Support",
    showCta = true
}: FaqSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const rawSchemaTexts = [
        "Yes, all tools on ToolTive including the Invoice Generator and Image Refiner are 100% free to use with no hidden costs, subscriptions, or watermarks.",
        "No signup is required. You can use all our tools instantly directly in your browser without creating an account or providing an email address.",
        "Absolutely. All processing happens locally in your web browser. We do not store your images, financial data, or documents on our servers. Once you close the tab, the data is gone.",
        "Yes! All our tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers. No app download is needed.",
        "No, there are no daily or monthly usage limits. You can use our tools as many times as you need, completely free of charge.",
        "We love feedback! You can reach out to us through our Contact page or email us directly. We read every message and constantly add new tools based on user requests."
    ];

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq, idx) => {
            // Use explicit schemaAnswer if provided, otherwise fallback to the hardcoded ones if default, or empty
            const answerText = faq.schemaAnswer || (faqs === defaultFaqs ? rawSchemaTexts[idx] : "See details inside.");
            return {
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": answerText
                }
            };
        })
    };

    return (
        <section className="faq-section" id="faq">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div className="faq-container">
                <header className="faq-header">
                    <div className="faq-label">
                        {label}
                    </div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </header>

                <div className="faq-list" role="region" aria-label="Frequently Asked Questions">
                    {faqs.map((faq, index) => {
                        const isActive = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`faq-item ${isActive ? 'active' : ''}`}
                                itemScope
                                itemProp="mainEntity"
                                itemType="https://schema.org/Question"
                            >
                                <button
                                    className="faq-question"
                                    aria-expanded={isActive}
                                    aria-controls={`faq-answer-${index}`}
                                    onClick={() => toggleItem(index)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleItem(index);
                                        }
                                    }}
                                >
                                    <span itemProp="name">{faq.question}</span>
                                    <span className="faq-toggle" aria-hidden="true" style={{ fontSize: '18px', fontWeight: 600 }}>
                                        {isActive ? '-' : '+'}
                                    </span>
                                </button>
                                <div className="faq-divider"></div>
                                <div
                                    className="faq-answer"
                                    id={`faq-answer-${index}`}
                                    itemScope
                                    itemProp="acceptedAnswer"
                                    itemType="https://schema.org/Answer"
                                >
                                    <div className="faq-answer-inner" itemProp="text">
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showCta && (
                    <div className="faq-cta">
                        <h4>Still have questions?</h4>
                        <p>Can't find the answer you're looking for? Our team is happy to help.</p>
                        <Link href="/contact" className="btn-primary">
                            <i className="fas fa-envelope"></i>
                            Contact Support
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}