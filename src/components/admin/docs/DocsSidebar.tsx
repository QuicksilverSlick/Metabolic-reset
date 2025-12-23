import React from 'react';
import {
  BookOpen,
  Users,
  Bug,
  UserCog,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import type { DocSection, DocSectionId } from '@/lib/docs/types';

interface DocsSidebarProps {
  sections: DocSection[];
  activeSection: DocSectionId | null;
  activeArticle: string | null;
  expandedSections: Set<DocSectionId>;
  onToggleSection: (sectionId: DocSectionId) => void;
  onSelectArticle: (sectionId: DocSectionId, articleId: string) => void;
}

// Map section icons to Lucide components
const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  Bug,
  UserCog,
  FileText,
};

export function DocsSidebar({
  sections,
  activeSection,
  activeArticle,
  expandedSections,
  onToggleSection,
  onSelectArticle,
}: DocsSidebarProps) {
  return (
    <nav className="space-y-1">
      {sections.map((section) => {
        const IconComponent = iconMap[section.icon] || FileText;
        const isExpanded = expandedSections.has(section.id);
        const isActive = activeSection === section.id;

        return (
          <div key={section.id} className="mb-2">
            {/* Section Header */}
            <button
              onClick={() => onToggleSection(section.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span>{section.title}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {/* Articles List */}
            {isExpanded && (
              <div className="mt-1 ml-4 pl-2 border-l-2 border-slate-200 dark:border-navy-700 space-y-1">
                {section.articles.map((article) => {
                  const isArticleActive =
                    activeSection === section.id && activeArticle === article.id;

                  return (
                    <button
                      key={article.id}
                      onClick={() => onSelectArticle(section.id, article.id)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                        isArticleActive
                          ? 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-navy-700/50'
                      }`}
                    >
                      {article.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
