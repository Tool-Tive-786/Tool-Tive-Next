import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ImagesToPdf from "@/components/tools/ImagesToPdf";
import FaqSection from "@/components/FaqSection";

export const metadata: Metadata = {
    title: "Free Online Image to PDF Converter - ToolTive",
    description: "Use our Free Online Image to PDF Converter to merge multiple JPG, PNG, and WebP files into a single PDF document. Fast, secure, and 100% free.",
    keywords: "free online image to pdf converter, image to pdf, merge images to pdf, convert jpg to pdf, free pdf converter",
    openGraph: {
        title: "Free Online Image to PDF Converter - ToolTive",
        description: "Use our Free Online Image to PDF Converter to merge multiple JPG, PNG, and WebP files into a single PDF document. Fast, secure, and 100% free.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Online Image to PDF Converter - ToolTive",
        description: "Use our Free Online Image to PDF Converter to merge multiple JPG, PNG, and WebP files into a single PDF document. Fast, secure, and 100% free.",
    },
    alternates: { canonical: '/all-tools/pdf/free-online-image-to-pdf-converter' },
};

export default function ImagesToPdfPage() {
    const tool = getToolBySlug("free-online-image-to-pdf-converter");

    if (!tool) {
        return <div>Tool not found</div>;
    }

    // Schema.org JSON-LD for SoftwareApplication (FAQ schema is handled by FaqSection)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.title,
        "url": "https://tooltive.com/all-tools/pdf/free-online-image-to-pdf-converter",
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.seoDescription
    };

    const pdfFaqs = [
        {
            question: "Are my images uploaded to a server?",
            answer: <>No. Our Free Online Image to PDF Converter works entirely in your web browser. Your images are <strong>never uploaded</strong> to any servers, ensuring 100% privacy and security.</>,
            schemaAnswer: "No. Our Free Online Image to PDF Converter works entirely in your web browser. Your images are never uploaded to any servers, ensuring 100% privacy and security."
        },
        {
            question: "Which image formats can I convert to PDF?",
            answer: <>We support all standard web image formats including <strong>JPG, JPEG, PNG, WebP, GIF, and SVG</strong>.</>,
            schemaAnswer: "We support all standard web image formats including JPG, JPEG, PNG, WebP, GIF, and SVG."
        },
        {
            question: "Can I split my images into multiple PDFs?",
            answer: <>Yes! You can specify exactly how many PDFs you want to generate. The tool will automatically and evenly distribute your images across the specified number of PDF files and <strong>download them as a ZIP</strong>.</>,
            schemaAnswer: "Yes! You can specify exactly how many PDFs you want to generate. The tool will automatically and evenly distribute your images across the specified number of PDF files and download them as a ZIP."
        }
    ];

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="hero-section" style={{ padding: '120px 0 40px', textAlign: 'center' }}>
                <div className="container">
                    <h1 className="page-heading" style={{ marginBottom: '16px' }}>
                        {tool.h1Base} <span>{tool.h1Accent}</span>
                    </h1>
                    <p className="page-sub" style={{ margin: '0 auto 32px' }}>
                        {tool.cardExcerpt}
                    </p>

                    <div style={{ marginBottom: '40px' }}></div>
                </div>
            </section>

            {/* The Core Tool */}
            <ImagesToPdf />

            <FaqSection
                faqs={pdfFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free image to PDF converter and how it keeps your files secure."
                label="FAQ"
            />

        </main>
    );
}