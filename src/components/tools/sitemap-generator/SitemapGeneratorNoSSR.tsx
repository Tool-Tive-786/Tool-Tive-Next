'use client';

import dynamic from 'next/dynamic';

const SitemapToolClient = dynamic(
  () => import('./SitemapToolClient').then((mod) => mod.default),
  { ssr: false }
);

export default function SitemapGeneratorNoSSR() {
  return <SitemapToolClient />;
}
