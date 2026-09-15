import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Tools',
  description: 'Search through ToolTive online tools and utilities.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
