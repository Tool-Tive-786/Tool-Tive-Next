import React from "react";
import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ImageCompressorNoSSR from "@/components/tools/ImageCompressorNoSSR";
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
    }
};

export default function ImageCompressorPage() {
    const tool = getToolBySlug("free-image-compressor");

    if (!tool) {
        return <div>Tool not found</div>;
    }

    // Schema.org JSON-LD for Software Application and FAQ
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": tool.title,
                "operatingSystem": "All",
                "applicationCategory": "MultimediaApplication",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "description": tool.seoDescription
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Are my images uploaded to a server?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. Our Image Compressor works entirely in your web browser. Your images are never uploaded to our servers, ensuring 100% privacy and security."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Which image formats are supported?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "We support all major formats including JPG, JPEG, PNG, WebP, GIF, and SVG."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is there a limit to how many images I can compress?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "You can compress as many images as you want! For best performance, we recommend uploading in batches of 20-50 images at a time (Max 50MB per file)."
                        }
                    }
                ]
            }
        ]
    };

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
            <ImageCompressorNoSSR />

        </main>
    );
}