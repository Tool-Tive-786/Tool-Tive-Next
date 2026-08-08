// Server Component for SEO purposes
import { Metadata } from 'next';
import DocumentStudioNoSSR from '@/components/tools/invoice/DocumentStudioNoSSR';
import FaqSection from '@/components/FaqSection';

export const metadata: Metadata = {
    title: 'Free Invoice Generator | Create Professional Invoices Instantly',
    description: 'Use our Free Invoice Generator to create professional invoices, quotes, and credit notes. Choose a template, add your information, and download as a PDF instantly.',
    keywords: 'Free Invoice Generator, Invoice Maker, Create Invoice Online, Free PDF Invoices, Quote Generator, Credit Note Generator, Business Invoice Template, Online Invoice Builder, How to make an invoice for free, Free invoice generator without watermark, Custom invoice templates',
    alternates: { canonical: '/all-tools/business/free-invoice-generator' },
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
        "description": "Generate free invoices online instantly. Professional templates, discount calculations, and export to PDF or Word. No signup required."
    };

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(invoiceJsonLd) }}
            />

            <div style={{ width: '90%', maxWidth: '1280px', margin: '0 auto', padding: '110px 16px 0', textAlign: 'center', marginBottom: '-60px' }}>
                <h1 className="page-heading">
                    Free Invoice Generator
                </h1>
            </div>

            <DocumentStudioNoSSR />

            <div className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
                <div className="article-content" style={{ width: '100%', margin: '0 0' }}>
                    <h2>Why Use Our Free Invoice Generator?</h2>
                    <p>
                        Running a small business means paperwork keeps piling up, and invoices are usually first on that list. Our <strong style={{ color: 'var(--accent)' }}>free invoice generator</strong> skips the subscriptions and the messy spreadsheet templates. Open the tool, fill in your details, and your invoice is ready in minutes. Think of it as an online invoice builder built for speed, not spreadsheets.
                    </p>
                    <p>
                        There's no sign-up screen in your way. No watermark stamped across your document either. <strong style={{ color: 'var(--accent)' }}>Create invoice online</strong> as many times as you need, and it stays free every single time.
                    </p>

                    <h2>Everything You Need in One Invoice Maker</h2>
                    <p>Most free tools hand you a plain form and stop there. This one goes further.</p>
                    <ul>
                        <li><strong style={{ color: 'var(--accent)' }}>Instant PDF Export:</strong> Download free PDF invoices the moment you're done, ready to email or print.</li>
                        <li><strong style={{ color: 'var(--accent)' }}>Multiple Templates:</strong> Choose from Minimal, Bold, Classic, or Creative layouts depending on how you want your business to look.</li>
                        <li><strong style={{ color: 'var(--accent)' }}>Custom Branding:</strong> Add your logo and pick an accent colour that matches your brand. Small detail, but it makes a document look like it came from a real company.</li>
                        <li><strong style={{ color: 'var(--accent)' }}>Multi-Purpose:</strong> The same tool doubles as a quote generator and a credit note generator. Switch the document type with one click and keep the details you already typed.</li>
                    </ul>

                    <h3>How to Make an Invoice for Free</h3>
                    <p>Getting an invoice ready takes four steps.</p>
                    <ol>
                        <li>Enter your business name, address, and upload your logo.</li>
                        <li>Add your client's details, then list your items along with any taxes or discounts.</li>
                        <li>Pick the template and colour that fits your brand.</li>
                        <li>Click <strong style={{ color: 'var(--accent)' }}>Download PDF</strong>, and it saves straight to your device.</li>
                    </ol>
                    <p>That's the entire process. No account, no waiting on email confirmations, no catch.</p>
                </div>
            </div>

            <FaqSection
                faqs={invoiceFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Everything you need to know about our free invoice maker and how it keeps your data secure."
                label="FAQ"
            />
        </main>
    );
}