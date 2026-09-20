import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/cards.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal"],
  variable: "--font-instrument-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tooltive.com'),
  title: {
    template: "%s · ToolTive",
    default: "ToolTive",
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
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9227549190577691" />
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){function loadAnalytics(){setTimeout(function(){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-877CM9ZVF7';s.onload=function(){gtag('js',new Date());gtag('config','G-877CM9ZVF7',{transport_type:'beacon'})};document.head.appendChild(s)},8000)}if(document.readyState==='complete'){loadAnalytics()}else{window.addEventListener('load',loadAnalytics,{once:true})}})();`,
            }}
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <Header />
        <Breadcrumb />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
