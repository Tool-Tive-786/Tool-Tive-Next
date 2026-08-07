"use client";
import dynamic from 'next/dynamic';

const ImageCompressor = dynamic(() => import('./ImageCompressor'), { ssr: false });

export default function ImageCompressorNoSSR() {
  return <ImageCompressor />;
}
