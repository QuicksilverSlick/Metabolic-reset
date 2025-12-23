/**
 * Living Documentation System
 *
 * This module exports all documentation sections for the admin panel.
 * When adding new features or making changes, update the relevant section file.
 */

export * from './types';
export * from './search';

// Import all sections
import { overviewSection } from './sections/overview';
import { userManagementSection } from './sections/user-management';
import { bugTrackingSection } from './sections/bug-tracking';
import { impersonationSection } from './sections/impersonation';

// Export all sections as an array, sorted by order
export const allSections = [
  overviewSection,
  userManagementSection,
  bugTrackingSection,
  impersonationSection,
].sort((a, b) => a.order - b.order);

// Export individual sections for direct access
export {
  overviewSection,
  userManagementSection,
  bugTrackingSection,
  impersonationSection,
};

// Helper to get a section by ID
export function getSectionById(id: string) {
  return allSections.find((section) => section.id === id);
}

// Helper to get an article by section and article ID
export function getArticle(sectionId: string, articleId: string) {
  const section = getSectionById(sectionId);
  if (!section) return null;
  return section.articles.find((article) => article.id === articleId);
}

// Helper to get all tags across all documentation
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const section of allSections) {
    for (const article of section.articles) {
      for (const tag of article.tags) {
        tags.add(tag);
      }
    }
  }
  return Array.from(tags).sort();
}
