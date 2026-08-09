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
      className="container"
      style={{
        display: 'block',
        position: 'absolute',
        top: '105px',
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual Breadcrumb UI */}
      <ol
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: "14px",
          color: "var(--text-secondary)",
          flexWrap: "wrap",
        }}
      >
        <li>
          <Link
            href="/"
            style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Home
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li
              key={item.href}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>/</span>
              {isLast ? (
                <span
                  style={{ color: "var(--accent)", fontWeight: "600" }}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
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
