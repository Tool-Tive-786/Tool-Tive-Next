'use client';

import dynamic from 'next/dynamic';

const AISearchOptimizerTool = dynamic(
  () => import('./AISearchOptimizerTool'),
  { ssr: false }
);

export default AISearchOptimizerTool;
