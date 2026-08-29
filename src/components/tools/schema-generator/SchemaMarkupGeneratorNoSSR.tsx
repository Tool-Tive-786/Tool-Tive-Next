'use client';

import dynamic from 'next/dynamic';

const SchemaMarkupGenerator = dynamic(
  () => import('@/components/tools/schema-generator/SchemaMarkupGenerator'),
  { ssr: false }
);

export default function SchemaMarkupGeneratorNoSSR() {
  return <SchemaMarkupGenerator />;
}
