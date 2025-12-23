/**
 * Living Documentation System - Type Definitions
 *
 * This documentation system is code-based and version-controlled.
 * Updates should be made alongside feature code changes.
 */

export type DocSectionId =
  | 'overview'
  | 'user-management'
  | 'project-management'
  | 'content-management'
  | 'bug-tracking'
  | 'impersonation'
  | 'system-settings'
  | 'coach-system'
  | 'payments';

export interface DocArticle {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown content
  tags: string[];
  lastUpdated: string; // ISO date string
  relatedArticles?: string[]; // Article IDs
}

export interface DocSection {
  id: DocSectionId;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  articles: DocArticle[];
  order: number;
}

export interface DocSearchResult {
  sectionId: DocSectionId;
  sectionTitle: string;
  articleId: string;
  articleTitle: string;
  matchedContent: string;
  relevanceScore: number;
}

export interface DocsState {
  activeSection: DocSectionId | null;
  activeArticle: string | null;
  searchQuery: string;
  searchResults: DocSearchResult[];
}

// Helper type for navigation
export interface DocNavItem {
  sectionId: DocSectionId;
  articleId: string;
  title: string;
  breadcrumb: string[];
}
