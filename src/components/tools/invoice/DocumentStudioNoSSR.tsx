"use client";
import dynamic from 'next/dynamic';

const DocumentStudio = dynamic(() => import('./DocumentStudio'), { ssr: false });

export default function DocumentStudioNoSSR() {
  return <DocumentStudio />;
}
