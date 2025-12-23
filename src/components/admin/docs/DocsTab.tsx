import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allSections, getArticle, getSectionById } from '@/lib/docs';
import type { DocSectionId } from '@/lib/docs/types';
import { DocsSidebar } from './DocsSidebar';
import { DocsSearch } from './DocsSearch';
import { DocsArticle } from './DocsArticle';

interface DocsTabProps {
  targetSection?: string | null;
  targetArticle?: string | null;
  onClearTarget?: () => void;
}

export function DocsTab({ targetSection, targetArticle, onClearTarget }: DocsTabProps = {}) {
  const [activeSection, setActiveSection] = useState<DocSectionId | null>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<DocSectionId>>(
    new Set()
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Navigate to target section/article when props change (from bug analysis links)
  useEffect(() => {
    if (targetSection && targetArticle) {
      console.log('[DocsTab] Navigating to target doc:', targetSection, targetArticle);
      setActiveSection(targetSection as DocSectionId);
      setActiveArticle(targetArticle);
      setExpandedSections((prev) => new Set([...prev, targetSection as DocSectionId]));
      // Clear the target after navigating
      onClearTarget?.();
    }
  }, [targetSection, targetArticle, onClearTarget]);

  // Set initial state to first section and article
  useEffect(() => {
    if (!activeSection && allSections.length > 0) {
      const firstSection = allSections[0];
      setActiveSection(firstSection.id);
      setExpandedSections(new Set([firstSection.id]));
      if (firstSection.articles.length > 0) {
        setActiveArticle(firstSection.articles[0].id);
      }
    }
  }, [activeSection]);

  const handleToggleSection = (sectionId: DocSectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleSelectArticle = (sectionId: DocSectionId, articleId: string) => {
    setActiveSection(sectionId);
    setActiveArticle(articleId);
    // Ensure section is expanded
    setExpandedSections((prev) => new Set([...prev, sectionId]));
    // Close mobile sidebar
    setMobileSidebarOpen(false);
  };

  const handleSearchSelect = (sectionId: string, articleId: string) => {
    handleSelectArticle(sectionId as DocSectionId, articleId);
  };

  // Get current article and section
  const currentSection = activeSection ? getSectionById(activeSection) : null;
  const currentArticle =
    activeSection && activeArticle
      ? getArticle(activeSection, activeArticle)
      : null;

  return (
    <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
      <CardHeader className="border-b border-slate-200 dark:border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gold-500" />
            <CardTitle>Documentation</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            {/* Search */}
            <div className="w-full sm:w-64">
              <DocsSearch
                sections={allSections}
                onSelectResult={handleSearchSelect}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex min-h-[600px]">
          {/* Sidebar */}
          <aside
            className={`${
              mobileSidebarOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0 border-r border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 p-4 overflow-y-auto`}
          >
            <DocsSidebar
              sections={allSections}
              activeSection={activeSection}
              activeArticle={activeArticle}
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
              onSelectArticle={handleSelectArticle}
            />
          </aside>

          {/* Content Area */}
          <main
            className={`${
              mobileSidebarOpen ? 'hidden' : 'block'
            } lg:block flex-1 p-6 overflow-y-auto`}
          >
            {currentSection && currentArticle ? (
              <DocsArticle
                article={currentArticle}
                section={currentSection}
                allSections={allSections}
                onNavigate={handleSelectArticle}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an article from the sidebar</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </CardContent>
    </Card>
  );
}
