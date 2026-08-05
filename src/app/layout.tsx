import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: '--font-space' });

export const metadata: Metadata = {
  metadataBase: new URL('https://tooltive.com'),
  title: {
    template: "%s · ToolTive",
    default: "ToolTive — Free utilities for professionals and creatives.",
  },
  description: "ToolTive — Free utilities for professionals and creatives. No signups, no hassle.",
  openGraph: {
    title: "ToolTive",
    description: "ToolTive — Free utilities for professionals and creatives.",
    images: [{ url: "/hero-section.webp" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolTive",
    description: "ToolTive — Free utilities for professionals and creatives.",
    images: ["/hero-section.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable}`} suppressHydrationWarning>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <Header />
        <Breadcrumb />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}