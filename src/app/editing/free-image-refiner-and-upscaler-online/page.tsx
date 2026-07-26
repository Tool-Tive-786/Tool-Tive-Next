import { getToolBySlug } from '@/lib/tools';
import ImageRefinerClient from '@/components/tools/ImageRefinerClient';
import { notFound } from 'next/navigation';
import '@/styles/image-refiner.css';

export async function generateMetadata() {
  const tool = getToolBySlug('free-image-refiner-and-upscaler-online');
  if (!tool) return { title: 'Not Found' };
  
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
  };
}

export default function ImageRefinerPage() {
  const tool = getToolBySlug('free-image-refiner-and-upscaler-online');
  if (!tool) notFound();

  return (
    <div style={{ backgroundColor: 'var(--bg-input)' }}>
      {/* SSR SEO Content - Hero */}
      <section style={{ padding: '64px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          {tool.h1Base} <span style={{ color: 'var(--accent)' }}>{tool.h1Accent}</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          {tool.seoDescription}
        </p>
      </section>

      {/* Interactive Tool Client Component */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <ImageRefinerClient />
      </section>

      {/* SSR SEO Content - Additional Text */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>What Is an Online Image Refiner?</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
          An image refiner and upscaler uses advanced algorithms to enhance the quality of your images. Whether you have a low-resolution photo or an image with compression artifacts, our tool intelligently fills in missing pixels and sharpens details.
        </p>

        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)', marginTop: '48px' }}>Key Features</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li><strong>100% Free, Forever</strong> — no hidden fees or subscriptions.</li>
          <li><strong>Local Processing</strong> — your images never leave your browser, ensuring complete privacy.</li>
          <li><strong>Multiple Upscale Options</strong> — choose between 2x and 3x upscaling to fit your needs.</li>
          <li><strong>Noise Reduction</strong> — automatically removes JPEG artifacts and smooths out grain.</li>
          <li><strong>Instant Preview</strong> — see the results side-by-side before downloading.</li>
        </ul>
      </section>
    </div>
  );
}
