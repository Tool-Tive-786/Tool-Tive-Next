import { getToolsByCategory } from '@/lib/tools';
import ToolCard from '@/components/ToolCard';
import { notFound } from 'next/navigation';
import '@/styles/tools.css';

interface Props {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.category.charAt(0).toUpperCase() + resolvedParams.category.slice(1)} Tools`,
    description: `Free online ${resolvedParams.category} tools.`,
  };
}

export async function generateStaticParams() {
  return [
    { category: 'business' },
    { category: 'editing' },
  ];
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.category;
  
  if (category !== 'business' && category !== 'editing') {
    notFound();
  }

  const tools = getToolsByCategory(category);

  return (
    <section className="tools-page container">
      <h1 className="page-heading" style={{ textAlign: 'center' }}>
        {category.charAt(0).toUpperCase() + category.slice(1)} Tools
      </h1>
      <p className="page-sub" style={{ margin: '8px auto 40px auto', textAlign: 'center' }}>
        Free, no-signup {category} tools to make your work easier.
      </p>

      <ul className="tools-grid">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.seoDescription}
            icon={tool.icon}
            tags={tool.tags}
            category={tool.category}
            href={`/${tool.category}/${tool.slug}`}
          />
        ))}
      </ul>
      {tools.length === 0 && (
        <div className="tools-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
          </svg>
          <p>No tools found in this category yet.</p>
        </div>
      )}
    </section>
  );
}
