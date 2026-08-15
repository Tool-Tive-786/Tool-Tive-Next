// Server Component for SEO purposes
import { Metadata } from 'next';
import DocumentStudioNoSSR from '@/components/tools/invoice/DocumentStudioNoSSR';
import FaqSection from '@/components/FaqSection';
import ToolHeroSection from '@/components/tool-content/ToolHeroSection';
import ToolContentLayout from '@/components/tool-content/ToolContentLayout';
import { ToolContentConfig } from '@/components/tool-content/ToolContentTypes';
import { getToolBySlug } from '@/lib/tools';

export const metadata: Metadata = {
    title: 'Free Invoice Generator | Create Professional Invoices Instantly',
    description: 'Use our Free Invoice Generator to create professional invoices, quotes, and credit notes. Choose a template, add your information, and download as a PDF instantly.',
    keywords: 'Free Invoice Generator, Invoice Maker, Create Invoice Online, Free PDF Invoices, Quote Generator, Credit Note Generator, Business Invoice Template, Online Invoice Builder, How to make an invoice for free, Free invoice generator without watermark, Custom invoice templates',
    robots: { index: true, follow: true },
    alternates: { canonical: '/all-tools/business/free-invoice-generator' },
};

// Fact-checked content configuration for the Invoice Generator
const invoiceContentConfig: ToolContentConfig = {
    categoryLabel: 'Business Tools',
    intro: {
        heading: 'Free Online',
        headingAccent: 'Invoice Generator.',
        description: 'Create professional invoices, quotes, and credit notes directly in your browser. Choose a template, add your details, and download your finished document as a PDF — no signup, no watermark.',
        featuredImage: '/tooltive-pictures/tooltive-all-tools-business-free-invoice-generator-online.webp',
        featuredImageAlt: 'ToolTive free invoice generator online with professional invoice preview',
    },
    valueProps: [
        {
            icon: 'fas fa-globe',
            title: 'Browser-Based',
            description: 'Works directly in your browser with no installation needed.'
        },
        {
            icon: 'fas fa-user-slash',
            title: 'No Account Required',
            description: 'Start creating invoices immediately, no signup.'
        },
        {
            icon: 'fas fa-file-pdf',
            title: 'PDF Export',
            description: 'Download your finished document as a clean PDF.'
        },
        {
            icon: 'fas fa-certificate',
            title: 'No Watermark',
            description: 'Every document you create is watermark-free.'
        }
    ],
    whyUse: {
        eyebrow: 'Why Use This Tool',
        heading: 'Why Use Our Free Invoice Generator?',
        description: 'Running a small business means paperwork keeps piling up, and invoices are usually first on that list. Our free invoice generator skips the subscriptions and the messy spreadsheet templates. Open the tool, fill in your details, and your invoice is ready in minutes.',
        points: [
            {
                title: 'No subscriptions or hidden fees',
                description: 'The invoice generator is currently free to use, with no subscription required.'
            },
            {
                title: 'Create invoices in minutes',
                description: 'Fill in your business and client details, add line items, and your document is ready.'
            },
            {
                title: 'No watermark on your documents',
                description: 'Every invoice, quote, and credit note you generate is clean and professional.'
            },
            {
                title: 'No account or signup required',
                description: 'Open the tool and start building immediately. No email confirmation, no waiting.'
            }
        ]
    },
    features: {
        eyebrow: 'Key Features',
        heading: 'Everything You Need in One Invoice Maker',
        description: 'Most free tools hand you a plain form and stop there. This one goes further.',
        items: [
            {
                title: 'Instant PDF Export',
                description: 'Download your invoice as a PDF the moment you are done, ready to email or print.'
            },
            {
                title: '5 Professional Templates',
                description: 'Choose from Minimal, Bold, Gradient, Classic, or Stub layouts depending on how you want your business to look.'
            },
            {
                title: 'Custom Branding',
                description: 'Add your logo and pick an accent colour that matches your brand. It makes the document look like it came from a real company.'
            },
            {
                title: 'Multi-Purpose Documents',
                description: 'The same tool creates invoices, quotes, and credit notes. Switch the document type with one click and keep the details you already typed.'
            },
            {
                title: 'Taxes and Discounts',
                description: 'Add per-item or overall taxes and discounts. The tool calculates subtotals and totals automatically.'
            },
            {
                title: 'Multiple Currencies',
                description: 'Select from supported currencies to match your client\'s location and billing preference.'
            }
        ]
    },
    howTo: {
        eyebrow: 'Step by Step',
        heading: 'How to Make an Invoice for Free',
        description: 'Getting an invoice ready takes four steps.',
        steps: [
            {
                title: 'Enter your business details',
                description: 'Add your business name, address, and upload your logo.'
            },
            {
                title: 'Add client details and line items',
                description: 'Fill in your client\'s information, then list your items along with any taxes or discounts.'
            },
            {
                title: 'Choose your template and brand colour',
                description: 'Pick the template style and accent colour that fits your business identity.'
            },
            {
                title: 'Download your PDF',
                description: 'Click Download PDF and the document saves straight to your device. No account, no catch.'
            }
        ]
    },
    goodToKnow: [
        { label: 'Templates', value: '5 Styles' },
        { label: 'Doc Types', value: 'Invoice · Quote · Credit Note' },
        { label: 'Export', value: 'PDF' },
        { label: 'Processing', value: 'Browser-Based' }
    ],
    privacy: {
        title: 'Browser-based processing',
        description: 'For this tool, processing takes place locally in your browser. Your business details, client information, and financial data are not uploaded to ToolTive\'s servers.'
    },
    relatedTools: [
        {
            href: '/all-tools/compress/free-image-compressor',
            title: 'Image Compressor',
            description: 'Reduce image file sizes without losing quality.',
            icon: 'fas fa-compress'
        },
        {
            href: '/all-tools/pdf/free-online-image-to-pdf-converter',
            title: 'Image to PDF Converter',
            description: 'Combine multiple images into a single PDF document.',
            icon: 'fas fa-file-pdf'
        }
    ]
};

const invoiceFaqs = [
    {
        question: "Is this invoice maker completely free?",
        answer: <>Yes. No hidden fees, and no watermark on your finished document, ever.</>,
        schemaAnswer: "Yes. No hidden fees, and no watermark on your finished document, ever."
    },
    {
        question: "Can I use it as a quote generator?",
        answer: <>Yes. Switch between Invoice, Quote, and Credit Note anytime, without losing what you've already entered.</>,
        schemaAnswer: "Yes. Switch between Invoice, Quote, and Credit Note anytime, without losing what you've already entered."
    },
    {
        question: "Is my data secure?",
        answer: <>Yes. Everything runs locally in your browser. Nothing gets uploaded or stored on our servers, so your client details stay private.</>,
        schemaAnswer: "Yes. Everything runs locally in your browser. Nothing gets uploaded or stored on our servers, so your client details stay private."
    },
    {
        question: "Is there a free invoice generator without a watermark?",
        answer: <>This is it. Every invoice, quote, and credit note you create here is watermark-free by default.</>,
        schemaAnswer: "This is it. Every invoice, quote, and credit note you create here is watermark-free by default."
    },
    {
        question: "Can I set up a custom invoice template for my business?",
        answer: <>You can. Pick a template style, apply your colours and logo, and reuse the same business invoice template for every client from then on.</>,
        schemaAnswer: "You can. Pick a template style, apply your colours and logo, and reuse the same business invoice template for every client from then on."
    }
];

export default function InvoiceGeneratorPage() {
    const tool = getToolBySlug('free-invoice-generator')!;

    const invoiceJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Free Invoice Generator",
        "url": "https://tooltive.com/all-tools/business/free-invoice-generator",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Generate free invoices online instantly. Professional templates, discount calculations, and export to PDF. No signup required."
    };

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(invoiceJsonLd) }}
            />

            {/* Hero Section — Left-aligned H1 + optional right featured image */}
            <ToolHeroSection
                categoryLabel={invoiceContentConfig.categoryLabel}
                heading={invoiceContentConfig.intro.heading}
                headingAccent={invoiceContentConfig.intro.headingAccent}
                description={invoiceContentConfig.intro.description}
                featuredImage={invoiceContentConfig.intro.featuredImage}
                featuredImageAlt={invoiceContentConfig.intro.featuredImageAlt}
            />

            {/* The actual tool interface — completely unchanged */}
            <DocumentStudioNoSSR />

            {/* Premium SEO Content Sections */}
            <ToolContentLayout config={invoiceContentConfig} />

            {/* Existing FAQ — unchanged component, unchanged content */}
            <FaqSection
                faqs={invoiceFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free invoice maker and how it keeps your data secure."
                label="FAQ"
            />
        </main>
    );
}