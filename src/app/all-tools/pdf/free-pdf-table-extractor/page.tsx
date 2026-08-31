import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import PdfTableExtractorWrapper from "@/components/tools/pdf-table-extractor/PdfTableExtractorWrapper";
import FaqSection from "@/components/FaqSection";
import ToolHeroSection from "@/components/tool-content/ToolHeroSection";
import ToolContentLayout from "@/components/tool-content/ToolContentLayout";
import { ToolContentConfig } from "@/components/tool-content/ToolContentTypes";

export const metadata: Metadata = {
    title: "Free PDF Table Extractor & Editor | ToolTive",
    description: "Extract tables from PDF, review and edit the data in a spreadsheet-style editor, then export clean tables to Excel or CSV for free.",
    keywords: "pdf table extractor, extract table from PDF, PDF table extraction, PDF table to Excel, PDF table to CSV, free PDF table extractor",
    openGraph: {
        title: "Free PDF Table Extractor & Editor | ToolTive",
        description: "Extract tables from PDF, review and edit the data in a spreadsheet-style editor, then export clean tables to Excel or CSV for free.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free PDF Table Extractor & Editor | ToolTive",
        description: "Extract tables from PDF, review and edit the data in a spreadsheet-style editor, then export clean tables to Excel or CSV for free.",
    },
    alternates: { canonical: '/all-tools/pdf/free-pdf-table-extractor' },
};

export default function FreePdfTableExtractorPage() {
    const tool = getToolBySlug("free-pdf-table-extractor");

    if (!tool) {
        return <div>Tool not found</div>;
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": tool.title,
        "url": "https://tooltive.com/all-tools/pdf/free-pdf-table-extractor",
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
            question: "Is this PDF table extractor free?",
            answer: <>Yes. There's no cost and no signup required.</>,
            schemaAnswer: "Yes. There's no cost and no signup required."
        },
        {
            question: "Can I extract tables from PDF to Excel?",
            answer: <>Yes. The tool lets you export the extracted data directly to a clean XLSX file using the ExcelJS engine.</>,
            schemaAnswer: "Yes. The tool lets you export the extracted data directly to a clean XLSX file using the ExcelJS engine."
        },
        {
            question: "Can I extract tables from PDF to CSV?",
            answer: <>Yes. The tool supports exporting to standard comma-separated values format (CSV), with proper formatting and formula-injection protection.</>,
            schemaAnswer: "Yes. The tool supports exporting to standard comma-separated values format (CSV), with proper formatting and formula-injection protection."
        },
        {
            question: "Can I edit the extracted table before downloading it?",
            answer: <>Absolutely. You can review the extracted cells, edit their text, add or remove rows, and merge/split cells right in your browser.</>,
            schemaAnswer: "Absolutely. You can review the extracted cells, edit their text, add or remove rows, and merge/split cells right in your browser."
        },
        {
            question: "Can this tool extract multiple tables from one PDF?",
            answer: <>Yes. Our engine is designed to detect and separate multiple tables on the same page.</>,
            schemaAnswer: "Yes. Our engine is designed to detect and separate multiple tables on the same page."
        },
        {
            question: "Can it extract borderless PDF tables?",
            answer: <>Yes. We use advanced text alignment and baseline layout analysis to extract clean tables even if they don't have visible borders.</>,
            schemaAnswer: "Yes. We use advanced text alignment and baseline layout analysis to extract clean tables even if they don't have visible borders."
        },
        {
            question: "Are my PDFs uploaded to a server?",
            answer: <>No, your PDF is processed locally in your browser. Standard table extraction does not upload your PDF to our servers.</>,
            schemaAnswer: "No, your PDF is processed locally in your browser. Standard table extraction does not upload your PDF to our servers."
        },
        {
            question: "Can it extract scanned PDFs?",
            answer: <>No. Scanned PDF processing and Optical Character Recognition (OCR) is not currently supported in this version.</>,
            schemaAnswer: "No. Scanned PDF processing and Optical Character Recognition (OCR) is not currently supported in this version."
        }
    ];

    const contentConfig: ToolContentConfig = {
        categoryLabel: 'PDF Tools',
        intro: {
            heading: tool.h1Base,
            headingAccent: tool.h1Accent,
            description: "Extract tables from PDF, review the detected data, correct extraction issues, and export clean Excel or CSV files for free. Processed entirely within your browser for complete privacy."
        },
        valueProps: [
            { icon: 'fas fa-shield-alt', title: 'Private & Secure', description: 'Processed locally in your browser.' },
            { icon: 'fas fa-table', title: 'Edit Before Export', description: 'Review and correct cells instantly.' },
            { icon: 'fas fa-file-excel', title: 'Export Excel/CSV', description: 'Download clean spreadsheet files.' },
            { icon: 'fas fa-crop', title: 'Manual Region Select', description: 'Select complex tables manually.' }
        ],
        whyUse: {
            eyebrow: 'Why Use',
            heading: 'Why Use Our Free PDF Table Extractor & Editor?',
            description: "Automatic PDF extraction is rarely perfect. We provide you with the power to detect tables automatically, and a spreadsheet-like editor to review and polish the extraction before downloading it.",
            points: [
                { title: 'Detect & Correct', description: "Don't settle for corrupted extractions. Edit right in the browser." },
                { title: 'Privacy First', description: "No server uploads. Data never leaves your device." },
                { title: 'Multiple tables', description: "Detect multiple tables and borderless layouts." }
            ]
        },
        features: {
            eyebrow: 'Features',
            heading: 'What Is a PDF Table Extractor?',
            description: "A comprehensive tool to pull data out of your PDFs reliably.",
            items: [
                { title: 'Bordered vs Borderless PDF Tables', description: 'Handles explicit borders or whitespace-separated columns.' },
                { title: 'Manual Merging', description: 'Correct structural ambiguities before export.' },
                { title: 'Smart Error Warnings', description: 'Flags low confidence and potential mismatches.' },
                { title: 'Safe CSV Export', description: 'Protects against dangerous spreadsheet formulas.' }
            ]
        },
        howTo: {
            eyebrow: 'Step by Step',
            heading: 'How to Extract Tables from PDF',
            description: "Extract your data in just a few clicks.",
            steps: [
                { title: 'Upload', description: 'Select your PDF document.' },
                { title: 'Detect', description: 'Wait for our local engine to analyze the pages.' },
                { title: 'Review', description: 'Select a detected table and verify the data.' },
                { title: 'Edit', description: 'Fix headers, cells, and rows directly in the editor.' },
                { title: 'Export', description: 'Download as Excel, CSV, or copy to clipboard.' }
            ]
        },
        goodToKnow: [
            { label: 'Supported Formats', value: 'PDF (Digital/Text)' },
            { label: 'File Security', value: 'Local Processing' },
            { label: 'Exports', value: 'XLSX, CSV' }
        ],
        privacy: {
            title: 'Local Browser Processing',
            description: "Your PDF is processed locally in your browser. No files are uploaded to our servers, keeping your financial and personal data safe."
        },
        relatedTools: [
            {
                href: '/all-tools/pdf/free-online-image-to-pdf-converter',
                title: 'Image to PDF Converter',
                description: 'Merge images into PDF documents securely.',
                icon: 'fas fa-images'
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
                categoryLabel={contentConfig.categoryLabel}
                heading={contentConfig.intro.heading}
                headingAccent={contentConfig.intro.headingAccent}
                description={contentConfig.intro.description}
            />

            <div className="container">
                <PdfTableExtractorWrapper />
            </div>

            <ToolContentLayout config={contentConfig} />

            <FaqSection
                faqs={pdfFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Learn more about how our local PDF table extraction works."
                label="FAQ"
            />
        </main>
    );
}
