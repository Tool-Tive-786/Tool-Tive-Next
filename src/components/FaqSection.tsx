"use client";

import React, { useId, useState } from 'react';
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

function getSchemaText(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(getSchemaText).filter(Boolean).join(' ');
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return getSchemaText(node.props.children);
    }

    return '';
}

export default function FaqSection({
    faqs = defaultFaqs,
    title = <>Frequently <span className="faq-title-highlight"><em>Asked</em></span> Questions</>,
    description = "Everything you need to know about ToolTive and how our tools work securely in your browser.",
    label = "Support",
    showCta = true
}: FaqSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const sectionId = useId().replace(/:/g, '');

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => {
            const answerText = faq.schemaAnswer?.trim() || getSchemaText(faq.answer).replace(/\s+/g, ' ').trim();
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
        <section className="faq-section" id="faq" aria-labelledby={`${sectionId}-heading`}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div className="container faq-container">
                <header className="faq-header">
                    <p className="faq-label caps">
                        <span aria-hidden="true"></span>
                        {label}
                    </p>
                    <h2 id={`${sectionId}-heading`}>{title}</h2>
                    {description && <p className="faq-description">{description}</p>}
                </header>

                <div
                    className="faq-list"
                    itemScope
                    itemType="https://schema.org/FAQPage"
                    aria-label="Frequently Asked Questions"
                >
                    {faqs.map((faq, index) => {
                        const isActive = openIndex === index;
                        const questionId = `${sectionId}-question-${index}`;
                        const answerId = `${sectionId}-answer-${index}`;
                        return (
                            <article
                                key={index}
                                className={`faq-item ${isActive ? 'active' : ''}`}
                                itemScope
                                itemProp="mainEntity"
                                itemType="https://schema.org/Question"
                            >
                                <h3 className="faq-question-heading">
                                    <button
                                        id={questionId}
                                        className="faq-question"
                                        type="button"
                                        aria-expanded={isActive}
                                        aria-controls={answerId}
                                        onClick={() => toggleItem(index)}
                                    >
                                        <span className="faq-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                        <span itemProp="name" className="faq-title">{faq.question}</span>
                                        <span className="faq-toggle" aria-hidden="true">+</span>
                                    </button>
                                </h3>
                                <div
                                    className="faq-answer"
                                    id={answerId}
                                    role="region"
                                    aria-labelledby={questionId}
                                    aria-hidden={!isActive}
                                    itemScope
                                    itemProp="acceptedAnswer"
                                    itemType="https://schema.org/Answer"
                                >
                                    <div className="faq-answer-inner" itemProp="text">
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            </article>
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
