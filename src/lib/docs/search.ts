import type { DocSearchResult, DocSection } from './types';

/**
 * Client-side full-text search across all documentation
 */
export function searchDocs(
  sections: DocSection[],
  query: string
): DocSearchResult[] {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  const results: DocSearchResult[] = [];

  for (const section of sections) {
    for (const article of section.articles) {
      // Search in title, description, content, and tags
      const searchableText = [
        article.title,
        article.description,
        article.content,
        ...article.tags,
      ]
        .join(' ')
        .toLowerCase();

      // Calculate relevance score based on matches
      let relevanceScore = 0;
      let matchedContent = '';

      for (const term of queryTerms) {
        // Title matches are worth more
        if (article.title.toLowerCase().includes(term)) {
          relevanceScore += 10;
        }
        // Tag matches are valuable
        if (article.tags.some((tag) => tag.toLowerCase().includes(term))) {
          relevanceScore += 5;
        }
        // Description matches
        if (article.description.toLowerCase().includes(term)) {
          relevanceScore += 3;
        }
        // Content matches
        if (article.content.toLowerCase().includes(term)) {
          relevanceScore += 1;

          // Extract matched content snippet
          if (!matchedContent) {
            matchedContent = extractSnippet(article.content, term);
          }
        }
      }

      // Only include if there's at least some match
      if (relevanceScore > 0) {
        results.push({
          sectionId: section.id,
          sectionTitle: section.title,
          articleId: article.id,
          articleTitle: article.title,
          matchedContent: matchedContent || article.description,
          relevanceScore,
        });
      }
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Extract a snippet around the first match of a term
 */
function extractSnippet(content: string, term: string): string {
  const lowerContent = content.toLowerCase();
  const index = lowerContent.indexOf(term.toLowerCase());

  if (index === -1) {
    return '';
  }

  // Get surrounding context (50 chars before and after)
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + term.length + 50);

  let snippet = content.slice(start, end);

  // Clean up markdown formatting for display
  snippet = snippet
    .replace(/[#*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Get suggestions for autocomplete based on tags and titles
 */
export function getSuggestions(
  sections: DocSection[],
  query: string
): string[] {
  if (!query || query.length < 1) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions = new Set<string>();

  for (const section of sections) {
    // Add section titles
    if (section.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(section.title);
    }

    for (const article of section.articles) {
      // Add article titles
      if (article.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(article.title);
      }

      // Add matching tags
      for (const tag of article.tags) {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          suggestions.add(tag);
        }
      }
    }
  }

  return Array.from(suggestions).slice(0, 10);
}
