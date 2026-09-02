"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  // Agar user Home page (/) par hai tou breadcrumb show na karein
  if (!pathname || pathname === "/") return null;

  // URL ko segments mein todna (e.g. /tools/pdf-to-word -> ['tools', 'pdf-to-word'])
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Breadcrumb items create karna
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    let label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Capitalize specific abbreviations correctly
    if (segment.toLowerCase() === 'dmca') {
      label = 'DMCA';
    }

    return { label, href };
  });

  const baseUrl = "https://tooltive.com"; // Apni actual domain yahan likhein

  // Google/SEO ke liye JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `${baseUrl}${item.href}`,
      })),
    ],
  };

  return (
    <nav
      aria-label="breadcrumb"
      className="container breadcrumb-nav"
    >
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual Breadcrumb UI */}
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link href="/" className="breadcrumb-link">
            <i className="fas fa-home breadcrumb-home-icon" aria-hidden="true"></i>
            <span>Home</span>
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href} className="breadcrumb-item">
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
