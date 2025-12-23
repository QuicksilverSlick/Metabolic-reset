import React from 'react';
import { Clock, Tag, ArrowRight } from 'lucide-react';
import type { DocArticle, DocSection } from '@/lib/docs/types';

interface DocsArticleProps {
  article: DocArticle;
  section: DocSection;
  allSections: DocSection[];
  onNavigate: (sectionId: string, articleId: string) => void;
}

export function DocsArticle({
  article,
  section,
  allSections,
  onNavigate,
}: DocsArticleProps) {
  // Simple markdown renderer for basic formatting
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';
    let inTable = false;
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block handling
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = line.slice(3);
          codeBlockContent = [];
        } else {
          elements.push(
            <pre
              key={i}
              className="bg-slate-900 dark:bg-navy-950 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          inCodeBlock = false;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Table handling
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        // Skip separator row
        if (!line.includes('---')) {
          const cells = line
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        // Render table
        elements.push(
          <div key={i} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-800">
                  {tableRows[0]?.map((cell, j) => (
                    <th
                      key={j}
                      className="px-4 py-2 text-left font-semibold border border-slate-200 dark:border-navy-700"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, j) => (
                  <tr
                    key={j}
                    className="odd:bg-white dark:odd:bg-navy-900 even:bg-slate-50 dark:even:bg-navy-800/50"
                  >
                    {row.map((cell, k) => (
                      <td
                        key={k}
                        className="px-4 py-2 border border-slate-200 dark:border-navy-700"
                      >
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
      }

      // Skip empty lines (but preserve spacing)
      if (!line.trim()) {
        elements.push(<div key={i} className="h-4" />);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 first:mt-0">
            {line.slice(2)}
          </h1>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={i}
            className="border-l-4 border-gold-500 pl-4 py-2 my-4 bg-gold-50 dark:bg-gold-900/20 text-slate-700 dark:text-slate-300 rounded-r"
          >
            {renderInlineFormatting(line.slice(2))}
          </blockquote>
        );
        continue;
      }

      // Unordered lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-6 list-disc text-slate-700 dark:text-slate-300">
            {renderInlineFormatting(line.slice(2))}
          </li>
        );
        continue;
      }

      // Numbered lists
      const numberedMatch = line.match(/^(\d+)\. (.+)/);
      if (numberedMatch) {
        elements.push(
          <li key={i} className="ml-6 list-decimal text-slate-700 dark:text-slate-300">
            {renderInlineFormatting(numberedMatch[2])}
          </li>
        );
        continue;
      }

      // Horizontal rule
      if (line === '---') {
        elements.push(
          <hr key={i} className="my-6 border-slate-200 dark:border-navy-700" />
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-slate-700 dark:text-slate-300 my-2">
          {renderInlineFormatting(line)}
        </p>
      );
    }

    // Handle unclosed table
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key="table-final" className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-navy-800">
                {tableRows[0]?.map((cell, j) => (
                  <th
                    key={j}
                    className="px-4 py-2 text-left font-semibold border border-slate-200 dark:border-navy-700"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, j) => (
                <tr
                  key={j}
                  className="odd:bg-white dark:odd:bg-navy-900 even:bg-slate-50 dark:even:bg-navy-800/50"
                >
                  {row.map((cell, k) => (
                    <td
                      key={k}
                      className="px-4 py-2 border border-slate-200 dark:border-navy-700"
                    >
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  // Render inline formatting (bold, italic, code, links)
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Split by inline code first
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, i) => {
      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-slate-100 dark:bg-navy-800 text-pink-600 dark:text-pink-400 rounded text-sm font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Process bold and italic in remaining text
      let processed = part;

      // Bold
      processed = processed.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>'
      );

      // Italic
      processed = processed.replace(
        /\*([^*]+)\*/g,
        '<em class="italic">$1</em>'
      );

      // Checkmarks
      processed = processed.replace(/✅/g, '<span class="text-green-500">✅</span>');
      processed = processed.replace(/❌/g, '<span class="text-red-500">❌</span>');
      processed = processed.replace(/⚠️/g, '<span class="text-amber-500">⚠️</span>');

      if (processed !== part) {
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: processed }} />
        );
      }

      return part;
    });
  };

  // Find related articles
  const relatedArticles = article.relatedArticles
    ?.map((articleId) => {
      for (const s of allSections) {
        const found = s.articles.find((a) => a.id === articleId);
        if (found) {
          return { section: s, article: found };
        }
      }
      return null;
    })
    .filter(Boolean);

  return (
    <article className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <span>{section.title}</span>
        <ArrowRight className="h-3 w-3" />
        <span className="text-slate-700 dark:text-slate-200">{article.title}</span>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Updated {article.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-400" />
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {renderMarkdown(article.content)}
      </div>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-navy-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Related Articles
          </h3>
          <div className="space-y-2">
            {relatedArticles.map(
              (item) =>
                item && (
                  <button
                    key={item.article.id}
                    onClick={() => onNavigate(item.section.id, item.article.id)}
                    className="flex items-center gap-2 text-sm text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>
                      {item.section.title} &rarr; {item.article.title}
                    </span>
                  </button>
                )
            )}
          </div>
        </div>
      )}
    </article>
  );
}
