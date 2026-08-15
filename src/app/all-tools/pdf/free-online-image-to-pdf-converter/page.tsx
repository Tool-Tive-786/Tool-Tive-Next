import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ImagesToPdf from "@/components/tools/ImagesToPdf";
import FaqSection from "@/components/FaqSection";
import ToolHeroSection from "@/components/tool-content/ToolHeroSection";
import ToolContentLayout from "@/components/tool-content/ToolContentLayout";
import { ToolContentConfig } from "@/components/tool-content/ToolContentTypes";

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
            question: "Is this image to PDF converter free?",
            answer: <>Yes. There's no cost, no signup, and no watermark added to your PDF.</>,
            schemaAnswer: "Yes. There's no cost, no signup, and no watermark added to your PDF."
        },
        {
            question: "Where are my images processed?",
            answer: <>Everything happens locally in your browser using your device's memory. Your images are not uploaded to a server.</>,
            schemaAnswer: "Everything happens locally in your browser using your device's memory. Your images are not uploaded to a server."
        },
        {
            question: "What image formats are supported?",
            answer: <>You can upload JPEG, PNG, SVG, GIF, and WebP files.</>,
            schemaAnswer: "You can upload JPEG, PNG, SVG, GIF, and WebP files."
        },
        {
            question: "Is there a limit on how many images I can convert?",
            answer: <>Yes, up to 100 images per batch. This limit exists to keep the browser from running out of memory during conversion.</>,
            schemaAnswer: "Yes, up to 100 images per batch. This limit exists to keep the browser from running out of memory during conversion."
        },
        {
            question: "Can I reorder my images before converting?",
            answer: <>You can remove any image from the preview grid before starting the conversion, but there's currently no drag-and-drop reordering — images convert in the order they were uploaded.</>,
            schemaAnswer: "You can remove any image from the preview grid before starting the conversion, but there's currently no drag-and-drop reordering — images convert in the order they were uploaded."
        },
        {
            question: "Can I convert images to a landscape or custom-size PDF?",
            answer: <>Not currently. Output PDFs are generated in A4 portrait format only.</>,
            schemaAnswer: "Not currently. Output PDFs are generated in A4 portrait format only."
        }
    ];

    const pdfContentConfig: ToolContentConfig = {
        categoryLabel: 'PDF Tools',
        intro: {
            heading: tool.h1Base,
            headingAccent: tool.h1Accent,
            description: "Are you looking for a fast, secure, and hassle-free way to turn your images into a PDF document? Our free online image to PDF converter allows you to instantly combine JPG, PNG, WebP, and other image formats into a single, high-quality PDF. Whether you are compiling receipts, sharing a design portfolio, or submitting homework, your images are processed directly in your browser and are not uploaded to a server."
        },
        valueProps: [
            { icon: 'fas fa-shield-alt', title: '100% Secure', description: 'Processed locally in your browser.' },
            { icon: 'fas fa-images', title: 'Up to 100 Images', description: 'Batch convert effortlessly.' },
            { icon: 'fas fa-file-archive', title: 'Auto-ZIP Packaging', description: 'Downloads split PDFs as a ZIP.' },
            { icon: 'fas fa-bolt', title: 'Fast Processing', description: 'Instant conversion with no wait times.' }
        ],
        whyUse: {
            eyebrow: 'Why Use',
            heading: 'Why Use Our Free Online Image to PDF Converter?',
            description: "If you need to turn a batch of photos or scanned pages into a proper document, this free online image to pdf converter does exactly that. Upload your JPEGs, PNGs, or other image files, and the tool arranges them into a clean, ready-to-share PDF.",
            points: [
                { title: 'No Account Required', description: "There's no account to create and no watermark added to your finished file. The whole process runs directly in your browser." },
                { title: 'Built for Everyone', description: "Students submitting assignments, businesses compiling documents, or designers putting together a quick set of visuals." },
                { title: 'Smart Splitting', description: "If you're converting a large batch, you can split your images evenly across several PDFs instead of one long document." }
            ]
        },
        features: {
            eyebrow: 'Features',
            heading: 'Key Features of the Image to PDF Converter',
            description: "Everything you need to compile images into a professional document.",
            items: [
                { title: 'Merge Up to 100 Images', description: 'Combine as many as 100 image files into a single PDF in one pass.' },
                { title: 'Intelligent Splitting', description: 'Divide your batch and the tool works out how many images go into each file.' },
                { title: 'Automatic ZIP Packaging', description: 'When split into multiple PDFs, they are bundled into a single ZIP file.' },
                { title: 'Clean Page Fitting', description: 'Every image is automatically scaled and centred on an A4 portrait page.' },
                { title: 'Custom File Naming', description: 'Set your own output file name before downloading.' },
                { title: 'Live Progress and Preview', description: 'A preview grid shows uploaded images before conversion, allowing you to remove any.' }
            ]
        },
        howTo: {
            eyebrow: 'Step by Step',
            heading: 'How to Use the Image to PDF Converter',
            description: "Convert multiple images to PDF without installing any software, entirely offline in your browser.",
            steps: [
                { title: 'Add Images', description: 'Drag and drop your images into the upload area or select them from your device.' },
                { title: 'Review and Adjust', description: 'Review the preview grid and remove any image you don’t want to include.' },
                { title: 'Choose Split Options', description: 'Leave it at one to merge everything, or enter a number to split your images evenly.' },
                { title: 'Name Your File', description: 'Enter a custom file name for your output.' },
                { title: 'Convert and Download', description: 'Start the conversion and download your PDF or ZIP file.' }
            ]
        },
        goodToKnow: [
            { label: 'Supported Formats', value: 'JPG, PNG, WebP, GIF, SVG' },
            { label: 'Max Batch Size', value: '100 Images' },
            { label: 'Export', value: 'PDF / ZIP' },
            { label: 'Processing', value: 'Browser-Based' }
        ],
        privacy: {
            title: 'Browser-based processing',
            description: "For this tool, processing takes place locally in your browser. Your private images and files are not uploaded to ToolTive's servers."
        },
        relatedTools: [
            {
                href: '/all-tools/compress/free-image-compressor',
                title: 'Image Compressor',
                description: 'Reduce image file sizes without losing quality.',
                icon: 'fas fa-compress-arrows-alt'
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
                categoryLabel={pdfContentConfig.categoryLabel}
                heading={pdfContentConfig.intro.heading}
                headingAccent={pdfContentConfig.intro.headingAccent}
                description={pdfContentConfig.intro.description}
                featuredImage="/tooltive-pictures/tooltive-all-tools-pdf-free-online-image-to-pdf-converter.webp"
                featuredImageAlt="ToolTive free online image to PDF converter with image upload and PDF preview"
            />

            <div className="container">
                <ImagesToPdf />
            </div>

            <ToolContentLayout config={pdfContentConfig} />

            <FaqSection
                faqs={pdfFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free image to PDF converter and how it keeps your files secure."
                label="FAQ"
            />
        </main>
    );
}