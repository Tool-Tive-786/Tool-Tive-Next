import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ImagesToPdf from "@/components/tools/ImagesToPdf";
import FaqSection from "@/components/FaqSection";
import "@/styles/toolscontent.css";

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
                        Are you looking for a fast, secure, and hassle-free way to turn your images into a PDF document? Our free online image to PDF converter allows you to instantly combine JPG, PNG, WebP, and other image formats into a single, high-quality PDF. Whether you are compiling receipts, sharing a design portfolio, or submitting homework, your images are processed directly in your browser and are not uploaded to a server.
                    </p>

                    <div style={{ marginBottom: '40px' }}></div>
                </div>
            </section>

            {/* The Core Tool */}
            <div className="container">
                <ImagesToPdf />
            </div>

            <div className="container tool-seo-section">
                <div className="tool-seo-content">
                    <h2>Why Use Our Free Online <span>Image to PDF Converter?</span></h2>
                    <p>
                        If you need to turn a batch of photos or scanned pages into a proper document, this <strong>free online image to pdf converter</strong> does exactly that. Upload your JPEGs, PNGs, or other image files, and the tool arranges them into a clean, ready-to-share PDF.
                    </p>
                    <p>
                        There's no account to create and no watermark added to your finished file. The whole process runs directly in your browser, and your images are not uploaded to a server.
                    </p>
                    <p>
                        It's built for anyone who needs a PDF from a stack of images — students submitting assignments, businesses compiling documents, or designers putting together a quick set of visuals.
                    </p>
                    
                    <blockquote>
                        <strong>Pro Tip for Smaller PDFs:</strong> If you are converting high-resolution photos, your final PDF document might become too large to send via email. To prevent this, we recommend using our <a href="/all-tools/compress/free-image-compressor">free image compressor</a> to reduce the file size of your pictures without losing quality <em>before</em> converting them into a PDF.
                    </blockquote>

                    <h2>Key Features of the <span>Image to PDF Converter</span></h2>
                    <ul>
                        <li><strong>Merge Up to 100 Images:</strong> Combine as many as 100 image files into a single PDF in one pass, without switching between separate tools.</li>
                        <li><strong>Intelligent Splitting:</strong> Instead of one large PDF, you can split your images evenly across several PDFs. Enter a number, and the tool divides your batch and works out how many images go into each file.</li>
                        <li><strong>Automatic ZIP Packaging:</strong> When you split into multiple PDFs, they're bundled into a single ZIP file, so you download everything in one click instead of one file at a time.</li>
                        <li><strong>Clean Page Fitting:</strong> Every image is automatically scaled and centred on an A4 portrait page, with a small margin so nothing touches the edge or looks stretched out of shape.</li>
                        <li><strong>Custom File Naming:</strong> Set your own output file name before downloading, instead of getting a generic, auto-generated one.</li>
                        <li><strong>Live Progress and Preview:</strong> A preview grid shows your uploaded images before conversion, and you can remove any image you don't want included. A progress indicator shows how the conversion is coming along.</li>
                    </ul>

                    <h2>How to Use the <span>Image to PDF Converter</span></h2>
                    <ol>
                        <li>Add your images by dragging and dropping them into the upload area, or selecting them from your device.</li>
                        <li>Review the preview grid and remove any image you don't want to include.</li>
                        <li>Choose how many PDFs to create. Leave it at one to merge everything, or enter a number to split your images evenly across several files.</li>
                        <li>Enter a file name for your output.</li>
                        <li>Start the conversion and download your PDF, or your ZIP file if you chose to split into multiple PDFs.</li>
                    </ol>
                    <p>
                        This makes it possible to <strong>convert multiple images to PDF</strong> without installing any software, and the whole thing happens offline in your browser rather than on a remote server.
                    </p>

                    <h2>Who Can Use This <span>Image to PDF Converter?</span></h2>
                    <p>
                        Students can turn scanned or photographed homework pages into a single PDF for submission. Businesses and office workers can compile receipts, forms, or product photos into shareable documents.
                    </p>
                    <p>
                        Designers can assemble image-based mockups or references into one file, and general users can turn any set of photos — screenshots, documents, ID scans — into a PDF without extra software.
                    </p>

                    <h3>Splitting a Large Batch Into <span>Multiple PDFs</span></h3>
                    <p>
                        If you're converting a large number of images, one long PDF isn't always practical. Say you upload 50 images and set the split value to 5 — the tool divides them evenly, 10 images per PDF, and generates five separate files.
                    </p>
                    <p>
                        Once all five PDFs are created, they're packaged together into one ZIP archive, so you only need a single download instead of saving each file one at a time. This is useful when you're organising images by group, chapter, or category and want each set kept in its own document.
                    </p>
                </div>
            </div>

            <FaqSection
                faqs={pdfFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free image to PDF converter and how it keeps your files secure."
                label="FAQ"
            />

        </main>
    );
}