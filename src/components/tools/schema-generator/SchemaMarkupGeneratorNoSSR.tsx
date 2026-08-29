'use client';

import dynamic from 'next/dynamic';

const SchemaMarkupGenerator = dynamic(
  () => import('./SchemaMarkupGenerator').then((mod) => mod.default),
  { ssr: false }
);

export default function SchemaMarkupGeneratorNoSSR() {
  return <SchemaMarkupGenerator />;
}
