import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ImageCompressorNoSSR from "@/components/tools/ImageCompressorNoSSR";
import FaqSection from "@/components/FaqSection";
import ToolHeroSection from "@/components/tool-content/ToolHeroSection";
import ToolContentLayout from "@/components/tool-content/ToolContentLayout";
import { ToolContentConfig } from "@/components/tool-content/ToolContentTypes";
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

    const compressContentConfig: ToolContentConfig = {
        categoryLabel: 'Optimization Tools',
        intro: {
            heading: tool.h1Base,
            headingAccent: tool.h1Accent,
            description: "Large image files can slow down your website and eat up storage space. Our free image compressor is built to solve exactly that. Effortlessly reduce the file size of your JPG, PNG, SVG, and WebP images by up to 90% without any visible loss in quality. It's the perfect online tool for web developers, designers, and bloggers who want to optimize their images for faster loading speeds and better SEO performance."
        },
        valueProps: [
            { icon: 'fas fa-rocket', title: 'Faster Page Loads', description: 'Optimize images for better web performance.' },
            { icon: 'fas fa-shield-alt', title: '100% Private', description: 'No images are uploaded to any server.' },
            { icon: 'fas fa-layer-group', title: 'Bulk Compression', description: 'Compress up to 50 images at a time.' },
            { icon: 'fas fa-image', title: 'Multi-Format', description: 'Supports JPG, PNG, WebP, and SVG.' }
        ],
        whyUse: {
            eyebrow: 'Why Use',
            heading: 'Why Optimize Images with Our Free Compressor?',
            description: "If you want to speed up your website, improve SEO rankings, or save storage space, compressing images is the most effective step you can take. Our free image compressor makes it effortless.",
            points: [
                { title: 'Zero Loss in Quality', description: "Our advanced compression algorithms significantly reduce file size while maintaining the original visual quality of your images." },
                { title: 'Locally Processed', description: "Unlike other tools, everything happens right in your browser. Your private photos never leave your device." },
                { title: 'Completely Free', description: "There are no hidden fees, no strict file limits, and absolutely no watermarks added to your compressed images." }
            ]
        },
        features: {
            eyebrow: 'Features',
            heading: 'Key Features of the Image Compressor',
            description: "Everything you need to optimize your images effectively in one simple interface.",
            items: [
                { title: 'Up to 90% Reduction', description: 'Dramatically decrease file sizes while preserving visual fidelity.' },
                { title: 'Broad Format Support', description: 'Easily compress JPEG, PNG, GIF, SVG, and modern WebP formats.' },
                { title: 'Adjustable Quality', description: 'Fine-tune the compression level with a simple slider to find the perfect balance.' },
                { title: 'Instant Preview', description: 'See the exact file size savings before downloading your optimized image.' },
                { title: 'Batch Processing', description: 'Upload and compress multiple images simultaneously to save time.' },
                { title: 'Download all as ZIP', description: 'Grab all your compressed images at once in a convenient ZIP archive.' }
            ]
        },
        howTo: {
            eyebrow: 'Step by Step',
            heading: 'How to Compress Images Online',
            description: "Follow these simple steps to reduce your image file sizes in seconds.",
            steps: [
                { title: 'Upload Images', description: 'Drag and drop your images into the upload box or click to browse your files.' },
                { title: 'Adjust Quality', description: 'Use the slider to adjust the compression level if needed. Lower quality means smaller files.' },
                { title: 'Review Savings', description: 'Check the real-time preview to see exactly how much space you’ve saved.' },
                { title: 'Download', description: 'Download the compressed images individually or grab them all at once in a ZIP file.' }
            ]
        },
        goodToKnow: [
            { label: 'Supported Formats', value: 'JPG, PNG, WebP, GIF, SVG' },
            { label: 'Recommended Batch', value: '20 - 50 Images' },
            { label: 'Max File Size', value: '50MB per file' },
            { label: 'Processing', value: 'Browser-Based' }
        ],
        privacy: {
            title: 'Browser-based processing',
            description: "For this tool, processing takes place locally in your browser. Your private images and photos are never uploaded to ToolTive's servers."
        },
        relatedTools: [
            {
                href: '/all-tools/pdf/free-online-image-to-pdf-converter',
                title: 'Image to PDF Converter',
                description: 'Combine multiple images into a single PDF document.',
                icon: 'fas fa-file-pdf'
            },
            {
                href: '/all-tools/business/free-invoice-generator',
                title: 'Free Invoice Generator',
                description: 'Create professional invoices, quotes, and credit notes directly in your browser.',
                icon: 'fas fa-file-invoice-dollar'
            }
        ]
    };

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ToolHeroSection
                categoryLabel={compressContentConfig.categoryLabel}
                heading={compressContentConfig.intro.heading}
                headingAccent={compressContentConfig.intro.headingAccent}
                description={compressContentConfig.intro.description}
                featuredImage='/tooltive-pictures/tooltive-all-tools-compress-free-online-image-compressor.webp'
                featuredImageAlt='ToolTive free online image compressor with compression settings and image preview'
            />

            <ImageCompressorNoSSR />

            <ToolContentLayout config={compressContentConfig} />

            <FaqSection
                faqs={compressorFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free image compressor and how it keeps your files secure."
                label="FAQ"
            />
        </main>
    );
}