import { getAllTools } from '@/lib/tools';
import ToolCard from '@/components/ToolCard';
import '@/styles/tools.css';

export const metadata = {
  title: 'All Tools',
  description: 'Browse all free online tools available on ToolTive.',
};

export default function ToolsIndex() {
  const tools = getAllTools();
  // Group categories
  const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))];

  return (
    <section className="tools-page container">
      <h1 className="page-heading" style={{ textAlign: 'center' }}>All Tools</h1>
      <p className="page-sub" style={{ margin: '8px auto 40px auto', textAlign: 'center' }}>
        Free, no-signup tools to make your work easier.
      </p>

      {/* Basic category display without client-side interactivity, 
          since we want pure SSR for now. We can make a client component later for filtering if needed. */}
      <div className="filters-wrap">
        <div className="tool-filters">
          {categories.map(cat => {
            let href = '/tools';
            if (cat !== 'all') {
              const toolForCat = tools.find(t => t.category === cat);
              if (toolForCat) {
                href = `/${toolForCat.category}/${toolForCat.slug}`;
              }
            }
            return (
              <a key={cat} href={href} className={`filter-btn ${cat === 'all' ? 'active' : ''}`}>
                {cat === 'all' ? 'All Tools' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </a>
            );
          })}
        </div>
      </div>

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
    </section>
  );
}
