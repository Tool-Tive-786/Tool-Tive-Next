// Server Component for SEO purposes
import DataPanel from '@/components/tools/invoice/DataPanel';
import StudioPanel from '@/components/tools/invoice/StudioPanel';
import LivePreview from '@/components/tools/invoice/LivePreview';
import ClientPDFDownloadLink from '@/components/tools/invoice/ClientPDFDownloadLink';
import '@/styles/invoice.css';

export default function Home() {
  return (
    <main className="app-layout">
      
      {/* Left Panel: Data Entry */}
      <div className="panel panel-left">
        <DataPanel />
        <div className="download-container">
          <ClientPDFDownloadLink />
        </div>
      </div>

      {/* Center Panel: Live PDF Preview */}
      <LivePreview />

      {/* Right Panel: Design & RGB Studio */}
      <StudioPanel />
      
    </main>
  );
}
