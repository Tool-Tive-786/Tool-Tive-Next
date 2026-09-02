import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  contentHtml: string;
  draft?: boolean;
  image?: string;
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;
  imageDescription?: string;
  toc?: { id: string; text: string; level: number }[];
  faqs?: FAQItem[];
}

export function extractFaqsFromMarkdown(markdown: string): FAQItem[] {
  if (!markdown) return [];

  // Locate the FAQ section heading: ## Frequently Asked Questions, ## FAQs, ## FAQ
  const faqHeadingRegex = /^##\s+(?:Frequently Asked Questions|FAQs?)(.*)$/im;
  const match = faqHeadingRegex.exec(markdown);
  if (!match) return [];

  const startIndex = match.index + match[0].length;
  const remainingText = markdown.slice(startIndex);
  // Ends at the next H2 section (## ...) or EOF
  const nextH2Match = /^##\s+/m.exec(remainingText);
  const faqContent = nextH2Match ? remainingText.slice(0, nextH2Match.index) : remainingText;

  const faqs: FAQItem[] = [];

  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert [text](url) -> text
      .replace(/[*_`]/g, '') // Strip markdown formatting symbols
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  };

  const lines = faqContent.split('\n');
  let currentQuestion = '';
  let currentAnswerParts: string[] = [];

  const flushFaq = () => {
    if (currentQuestion && currentAnswerParts.length > 0) {
      const rawAnswer = currentAnswerParts.join(' ').trim();
      const cleanAns = cleanMarkdown(rawAnswer);
      const cleanQues = cleanMarkdown(currentQuestion);
      if (cleanAns.length > 0 && cleanQues.length > 0) {
        faqs.push({
          question: cleanQues,
          answer: cleanAns,
        });
      }
    }
    currentQuestion = '';
    currentAnswerParts = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Matches ### Question?
    const h3Match = trimmed.match(/^###\s+(.+)$/);
    // Matches **Question?** with optional inline answer
    const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*(.*)$/);

    if (h3Match) {
      flushFaq();
      currentQuestion = h3Match[1].trim();
    } else if (boldMatch) {
      flushFaq();
      currentQuestion = boldMatch[1].trim();
      const inlineAnswer = boldMatch[2].trim();
      if (inlineAnswer) {
        currentAnswerParts.push(inlineAnswer);
      }
    } else {
      if (currentQuestion) {
        currentAnswerParts.push(trimmed);
      }
    }
  }

  flushFaq();
  return faqs;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // We need to find the correct folder/file
  try {
    if (!fs.existsSync(contentDir)) {
      return null;
    }
    
    // In Astro, files are like `content/blog/category/slug.md` or just in the blog dir.
    // Let's traverse to find the file
    let fullPath = '';
    let category = 'general';
    
    const entries = fs.readdirSync(contentDir, { withFileTypes: true });
    
    // Check if it's directly in blog
    const directFile = path.join(contentDir, `${slug}.md`);
    if (fs.existsSync(directFile)) {
      fullPath = directFile;
    } else {
      // Check subdirectories
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subFile = path.join(contentDir, entry.name, `${slug}.md`);
          if (fs.existsSync(subFile)) {
            fullPath = subFile;
            category = entry.name;
            break;
          }
        }
      }
    }
    
    if (!fullPath) return null;
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    
    const processedContent = await remark()
      .use(gfm)
      .use(html, { sanitize: false })
      .process(matterResult.content);
      
    let contentHtml = processedContent.toString();
    const toc: { id: string; text: string; level: number }[] = [];
    
    contentHtml = contentHtml.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, innerHtml) => {
      const cleanText = innerHtml.replace(/<[^>]*>/g, '').trim();
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const level = parseInt(tag[1], 10);
      toc.push({ id, text: cleanText, level });
      return `<${tag} id="${id}">${innerHtml}</${tag}>`;
    });
    
    const faqs = extractFaqsFromMarkdown(matterResult.content);

    return {
      slug,
      category,
      title: matterResult.data.title,
      description: matterResult.data.description,
      pubDate: matterResult.data.pubDate,
      tags: matterResult.data.tags || [],
      draft: matterResult.data.draft || false,
      image: matterResult.data.image || null,
      imageAlt: matterResult.data.imageAlt || null,
      imageTitle: matterResult.data.imageTitle || null,
      imageCaption: matterResult.data.imageCaption || null,
      imageDescription: matterResult.data.imageDescription || null,
      contentHtml,
      toc,
      faqs,
    };
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  
  if (!fs.existsSync(contentDir)) return posts;
  
  const entries = fs.readdirSync(contentDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subEntries = fs.readdirSync(path.join(contentDir, entry.name));
      for (const subEntry of subEntries) {
        if (subEntry.endsWith('.md')) {
          const slug = subEntry.replace(/\.md$/, '');
          const post = await getPostBySlug(slug);
          if (post && !post.draft) posts.push(post);
        }
      }
    } else if (entry.name.endsWith('.md')) {
      const slug = entry.name.replace(/\.md$/, '');
      const post = await getPostBySlug(slug);
      if (post && !post.draft) posts.push(post);
    }
  }
  
  return posts.sort((a, b) => (new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf()));
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  const categories = new Set(posts.map(p => p.category));
  return Array.from(categories);
}
