import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ToolTive | Invoice Studio",
  description: "The ultimate frontend-only invoice generator with complete RGB control and global localization.",
};

export default function InvoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We return children directly because the root layout handles <html>, <body>, Header, and Footer
  return <>{children}</>;
}
