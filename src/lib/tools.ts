export interface Tool {
  id: string;
  slug: string;
  category: string;
  title: string;
  h1Base: string;
  h1Accent: string;
  seoTitle: string;
  seoDescription: string;
  cardTitle?: string;
  cardExcerpt?: string;
  tags: string[];
  icon: string;
  pubDate: string;
}

export const tools: Tool[] = [
  {
    id: "image-compressor",
    category: "compress",
    slug: "free-image-compressor",
    title: "Free Image Compressor & Resizer - Reduce Image Size Online",
    h1Base: "Online Free",
    h1Accent: "Image Compressor.",
    seoTitle: "Compress Images Online for Free | ToolTive",
    seoDescription:
      "Compress your JPG, PNG, and WebP images by up to 90% without losing quality. Bulk upload, drag & drop, and instantly download optimized images for SEO.",
    cardTitle: "Image Compressor",
    cardExcerpt: "Reduce image file sizes instantly right inside your browser without losing quality. Perfect for SEO and faster website loading.",
    tags: ["No Quality Loss", "Batch Compress", "100% Free"],
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    pubDate: "2026-08-03",
  },
  {
    id: "images-to-pdf",
    category: "pdf",
    slug: "free-online-image-to-pdf-converter",
    title: "Free Online Image to PDF Converter",
    h1Base: "Free Online",
    h1Accent: "Image to PDF Converter.",
    seoTitle: "Free Online Image to PDF Converter | ToolTive",
    seoDescription:
      "Free Online Image to PDF Converter for multiple files. Fast, secure, and entirely on your device.",
    cardTitle: "Image to PDF Converter",
    cardExcerpt: "Convert multiple images into PDF documents.",
    tags: ["Merge Multiple Files", "100% Free"],
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"></path></svg>`,
    pubDate: "2026-08-07",
  },
  {
    id: "business-invoice-generator",
    category: "business",
    slug: "free-invoice-generator",
    title: "Online Free Invoice Generator by ToolTive",
    h1Base: "Online Free Invoice Generator",
    h1Accent: "by ToolTive",
    seoTitle: "Free Invoice Generator – Create Invoices Online | ToolTive",
    seoDescription:
      "Generate free invoices online instantly. Professional templates, discount calculations, and export to PDF or Word. No signup required.",
    cardTitle: "Free Invoice Generator",
    cardExcerpt: "Our free invoice generator creates professional invoices, quotes, and credit notes in seconds, no sign-up, no watermark.",
    tags: ["PDF Export", "No Watermark", "No Signup"],
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    pubDate: "2026-07-28",
  }
];

export function getAllTools(): Tool[] {
  return tools;
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getCategories(): string[] {
  return Array.from(new Set(tools.map(t => t.category)));
}