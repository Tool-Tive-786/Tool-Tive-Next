import type { Metadata } from 'next';
import AboutContent from '@/components/AboutContent';

export const metadata: Metadata = {
  title: {
    absolute: 'About ToolTive | Free Online Tools for Everyday Tasks',
  },
  description:
    'Learn about ToolTive, a browser-based platform offering practical online tools for everyday digital tasks, including invoices, image compression, and file conversion.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About ToolTive | Free Online Tools for Everyday Tasks',
    description:
      'Learn about ToolTive, a browser-based platform offering practical online tools for everyday digital tasks, including invoices, image compression, and file conversion.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
