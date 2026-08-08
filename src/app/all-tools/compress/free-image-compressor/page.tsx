import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ImageCompressorNoSSR from "@/components/tools/ImageCompressorNoSSR";
import FaqSection from "@/components/FaqSection";
import "@/components/tools/compressor.css";

export const metadata: Metadata = {
    title: "Free Image Compressor & Resizer - Reduce Image Size Online",
    description: "Compress your JPG, PNG, and WebP images by up to 90% without losing quality. Bulk upload, drag & drop, and instantly download optimized images for SEO.",
    keywords: "image compressor, compress image online, optimize images for web, reduce image size, bulk image compressor, free image resizer, webp compressor",
    openGraph: {
        title: "Free Image Compressor & Resizer - Reduce Image Size Online",
        description: "Compress your JPG, PNG, and WebP images by up to 90% without losing quality. Bulk upload, drag & drop, and instantly download optimized images for SEO.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Image Compressor & Resizer - Reduce Image Size Online",
        description: "Compress your JPG, PNG, and WebP images by up to 90% without losing quality. Bulk upload, drag & drop, and instantly download optimized images for SEO.",
    },
    alternates: { canonical: '/all-tools/compress/free-image-compressor' },
};

export default function ImageCompressorPage() {
    const tool = getToolBySlug("free-image-compressor");

    if (!tool) {
        return <div>Tool not found</div>;
    }

    // Schema.org JSON-LD for SoftwareApplication (FAQ schema is handled by FaqSection)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.title,
        "url": "https://tooltive.com/all-tools/compress/free-image-compressor",
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.seoDescription
    };

    const compressorFaqs = [
        {
            question: "Are my images uploaded to a server?",
            answer: <>No. Our Image Compressor works entirely in your web browser. Your images are <strong>never uploaded</strong> to our servers, ensuring 100% privacy and security.</>,
            schemaAnswer: "No. Our Image Compressor works entirely in your web browser. Your images are never uploaded to our servers, ensuring 100% privacy and security."
        },
        {
            question: "Which image formats are supported?",
            answer: <>We support all major formats including <strong>JPG, JPEG, PNG, WebP, GIF, and SVG</strong>.</>,
            schemaAnswer: "We support all major formats including JPG, JPEG, PNG, WebP, GIF, and SVG."
        },
        {
            question: "Is there a limit to how many images I can compress?",
            answer: <>You can compress as many images as you want! For best performance, we recommend uploading in batches of <strong>20-50 images</strong> at a time (Max 50MB per file).</>,
            schemaAnswer: "You can compress as many images as you want! For best performance, we recommend uploading in batches of 20-50 images at a time (Max 50MB per file)."
        }
    ];

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="hero-section" style={{ padding: '0 0 40px', textAlign: 'center' }}>
                <div className="container">
                    <h1 className="page-heading" style={{ marginBottom: '16px' }}>
                        {tool.h1Base} <span>{tool.h1Accent}</span>
                    </h1>
                    <p className="tool-intro">
                        Large image files can slow down your website and eat up storage space. Our free image compressor is built to solve exactly that. Effortlessly reduce the file size of your JPG, PNG, SVG, and WebP images by up to 90% without any visible loss in quality. It's the perfect online tool for web developers, designers, and bloggers who want to optimize their images for faster loading speeds and better SEO performance.
                    </p>

                    <div style={{ marginBottom: '40px' }}></div>
                </div>
            </section>

            {/* The Core Tool */}
            <ImageCompressorNoSSR />

            <FaqSection
                faqs={compressorFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free image compressor and how it keeps your files secure."
                label="FAQ"
            />

        </main>
    );
}