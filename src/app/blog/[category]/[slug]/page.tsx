import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import '@/styles/blog.css';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) {
    return { title: 'Not Found' };
  }
  return {
    title: post.title,
    description: post.description,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.pubDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="blog-article">
      <div className="category-label">{post.category.replace(/-/g, ' ')}</div>
      <h1 className="article-title">{post.title}</h1>
      <div className="article-meta">
        {formattedDate} • ToolTive Team
      </div>

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
