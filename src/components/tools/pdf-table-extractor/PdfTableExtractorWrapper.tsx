'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PdfTableExtractor = dynamic(
    () => import('./PdfTableExtractor'),
    { 
        ssr: false,
        loading: () => (
            <div className="pdf-processing-state" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Loader2 size={32} className="animate-spin text-accent mx-auto" />
                <h3 className="mt-4">Loading Extraction Engine...</h3>
            </div>
        )
    }
);

export default function PdfTableExtractorWrapper() {
    return <PdfTableExtractor />;
}
