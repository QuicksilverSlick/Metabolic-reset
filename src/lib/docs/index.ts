/**
 * Living Documentation System
 *
 * This module exports all documentation sections for the admin panel.
 *
 * IMPORTANT: The primary source of truth is now ./unified-source.ts
 * Legacy sections in ./sections/ are maintained for backwards compatibility
 * but should not be edited directly.
 *
 * For AI bug analysis, the worker uses ./docs-context-enhanced.ts
 */

export * from './types';
export * from './search';
export * from './ai-types';

// Import from unified source (primary)
import {
  getAllSections,
  getSectionById as getUnifiedSectionById,
  getArticle as getUnifiedArticle,
  getAPIEndpoints,
  getEntities,
  getComponents,
  getErrorCodes,
  getPlatformContext,
} from './unified-source';

// Legacy imports for backwards compatibility
import { overviewSection } from './sections/overview';
import { userManagementSection } from './sections/user-management';
import { bugTrackingSection } from './sections/bug-tracking';
import { impersonationSection } from './sections/impersonation';

// Use unified source sections (cast to maintain backwards compatibility)
import type { DocSection } from './types';
export const allSections = getAllSections() as unknown as DocSection[];

// Export individual sections for direct access (legacy support)
export {
  overviewSection,
  userManagementSection,
  bugTrackingSection,
  impersonationSection,
};

// Export unified source utilities
export {
  getAPIEndpoints,
  getEntities,
  getComponents,
  getErrorCodes,
  getPlatformContext,
};

// Helper to get a section by ID
export function getSectionById(id: string) {
  return getUnifiedSectionById(id) as unknown as DocSection | undefined;
}

// Helper to get an article by section and article ID
export function getArticle(sectionId: string, articleId: string) {
  return getUnifiedArticle(sectionId, articleId);
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
