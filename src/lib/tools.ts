export interface Tool {
  id: string;
  slug: string;
  category: string;
  title: string;
  h1Base: string;
  h1Accent: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  icon: string;
  pubDate: string;
}

export const tools: Tool[] = [
  {
    id: "business-invoice-generator",
    category: "business",
    slug: "invoice-generator",
    title: "Online Free Invoice Generator by ToolTive",
    h1Base: "Online Free Invoice Generator",
    h1Accent: "by ToolTive",
    seoTitle: "Free Invoice Generator – Create Invoices Online | ToolTive",
    seoDescription:
      "Generate free invoices online instantly. Professional templates, discount calculations, and export to PDF or Word. No signup required.",
    tags: ["PDF Export", "Word Export"],
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    pubDate: "2024-01-01",
  },
  {
    id: "editing-image-refiner",
    category: "editing",
    slug: "free-image-refiner-and-upscaler-online",
    title: "Free Image Refiner & Upscaler Online | ToolTive",
    h1Base: "Free Image Refiner & Upscaler Online",
    h1Accent: "",
    seoTitle: "Free Image Refiner & Upscaler Online | ToolTive",
    seoDescription:
      "Looking for a Free Image Refiner & Upscaler Online? Enhance, sharpen, and upscale your images up to 3x directly in your browser. Fast and 100% free.",
    tags: ["Image Enhancement", "Upscaler", "Refiner"],
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    pubDate: "2024-02-01",
  },
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
