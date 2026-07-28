import { getToolsByCategory, getCategories, tools } from '@/lib/tools';
import ToolsPageClient from '@/components/ToolsPageClient';
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
  const categories = getCategories();
  return categories.map(category => ({ category }));
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.category;

  const categoryTools = getToolsByCategory(category);

  if (categoryTools.length === 0) {
    notFound();
  }

  return (
    <main className="tools-page container">
      <div style={{ textAlign: 'center' }}>
        <h1 className="page-heading">
          {category.charAt(0).toUpperCase() + category.slice(1)} Tools
        </h1>
        <p className="page-sub" style={{ margin: '8px auto 40px auto' }}>
          Free, no-signup {category} tools to make your work easier.
        </p>
      </div>

      <ToolsPageClient activeCategory={category} tools={categoryTools} />
    </main>
  );
}