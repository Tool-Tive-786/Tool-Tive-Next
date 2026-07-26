'use client';
import dynamic from 'next/dynamic';

const PDFGenerator = dynamic(() => import('./PDFGenerator'), {
  ssr: false,
  loading: () => <button className="btn btn-primary" disabled>Loading PDF Engine...</button>,
});

export default function ClientPDFDownloadLink() {
  return <PDFGenerator />;
}
