import { getAllTools, Tool } from './tools';

export function searchTools(query: string): Tool[] {
  const tools = getAllTools();
  if (!query) return tools;

  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');

  if (!normalizedQuery) return tools;

  const results = tools.map((tool) => {
    let score = 0;
    const title = tool.title.toLowerCase();
    const h1Base = tool.h1Base.toLowerCase();
    const h1Accent = tool.h1Accent.toLowerCase();
    const seoDesc = tool.seoDescription.toLowerCase();
    const cat = tool.category.toLowerCase();
    const tags = tool.tags.map(t => t.toLowerCase());

    const isExactName = title === normalizedQuery || `${h1Base} ${h1Accent}`.trim() === normalizedQuery;
    const startsWithName = title.startsWith(normalizedQuery) || `${h1Base} ${h1Accent}`.trim().startsWith(normalizedQuery);
    const containsName = title.includes(normalizedQuery) || `${h1Base} ${h1Accent}`.trim().includes(normalizedQuery);
    
    const exactKeywordMatch = tags.some(tag => tag === normalizedQuery);
    const containsKeyword = tags.some(tag => tag.includes(normalizedQuery));
    
    const categoryMatch = cat.includes(normalizedQuery);
    const descriptionMatch = seoDesc.includes(normalizedQuery);

    if (isExactName) score = 7;
    else if (startsWithName) score = 6;
    else if (containsName) score = 5;
    else if (exactKeywordMatch) score = 4;
    else if (containsKeyword) score = 3;
    else if (categoryMatch) score = 2;
    else if (descriptionMatch) score = 1;

    return { tool, score };
  });

  // Filter out zero scores and sort by score descending
  return results
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.tool);
}
