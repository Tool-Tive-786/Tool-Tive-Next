'use client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { useInvoiceStore } from '@/lib/store';

export default function PDFGenerator() {
  const brandName = useInvoiceStore((state) => state.brandName);
  
  return (
    <PDFDownloadLink 
      document={<InvoicePDF />} 
      fileName={`${brandName.replace(/\s/g, '_')}_Invoice.pdf`}
    >
      {({ loading }: any) => (
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating PDF...' : 'Download Invoice PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
