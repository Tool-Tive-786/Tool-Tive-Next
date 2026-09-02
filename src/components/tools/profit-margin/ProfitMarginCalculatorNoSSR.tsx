"use client";

import dynamic from 'next/dynamic';

const ProfitMarginCalculator = dynamic(
  () => import('./ProfitMarginCalculator'),
  { ssr: false }
);

export default function ProfitMarginCalculatorNoSSR() {
  return <ProfitMarginCalculator />;
}
