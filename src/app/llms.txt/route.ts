import { getAllTools } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = 'https://tooltive.com';

  const tools = getAllTools();
  const posts = await getAllPosts(); // getAllPosts inherently filters out drafts: `if (post && !post.draft) posts.push(post);`

  // Group tools by category
  const toolsByCategory: Record<string, typeof tools> = {};
  for (const tool of tools) {
    if (!toolsByCategory[tool.category]) {
      toolsByCategory[tool.category] = [];
    }
    toolsByCategory[tool.category].push(tool);
  }

  let markdown = `# ToolTive\n\n> A free online toolkit featuring client-side utilities and professional resources.\n\nCanonical Site: ${baseUrl}\n\n## About ToolTive\n\nToolTive provides a collection of free online utilities, including image compressors, PDF converters, and business tools.\n\n## Tools\n`;

  // Render Tools
  for (const [category, categoryTools] of Object.entries(toolsByCategory)) {
    // Capitalize category name for the heading
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    markdown += `\n### ${formattedCategory}\n\n`;

    for (const tool of categoryTools) {
      const toolUrl = `${baseUrl}/all-tools/${tool.category}/${tool.slug}`;
      const description = tool.cardExcerpt || tool.seoDescription || 'Free online tool.';
      // Sanitize newlines to prevent markdown breakage
      const cleanDesc = description.replace(/\n/g, ' ').replace(/\r/g, '').trim();
      markdown += `- [${tool.title}](${toolUrl}): ${cleanDesc}\n`;
    }
  }

  // Render Blog & Guides
  if (posts && posts.length > 0) {
    markdown += `\n## Blog & Guides\n\n`;
    for (const post of posts) {
      const postUrl = `${baseUrl}/blog/${post.category}/${post.slug}`;
      const description = post.description || post.title || 'Read our latest guide.';
      const cleanDesc = description.replace(/\n/g, ' ').replace(/\r/g, '').trim();
      markdown += `- [${post.title}](${postUrl}): ${cleanDesc}\n`;
    }
  }

  // Core Pages
  markdown += `\n## Core Pages\n\n- [All Tools](${baseUrl}/all-tools)\n- [Blog](${baseUrl}/blog)\n- [Contact](${baseUrl}/contact)\n- [Privacy Policy](${baseUrl}/privacy-policy)\n- [Terms of Service](${baseUrl}/terms-of-service)\n- [Disclaimer](${baseUrl}/disclaimer)\n`;

  return new Response(markdown.trim(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
