import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');

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
      .use(html, { sanitize: false })
      .process(matterResult.content);
    const contentHtml = processedContent.toString();
    
    return {
      slug,
      category,
      title: matterResult.data.title,
      description: matterResult.data.description,
      pubDate: matterResult.data.pubDate,
      tags: matterResult.data.tags || [],
      draft: matterResult.data.draft || false,
      image: matterResult.data.image || null,
      contentHtml,
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
