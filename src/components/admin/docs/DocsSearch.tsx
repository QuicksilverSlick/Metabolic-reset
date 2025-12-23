import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchDocs, type DocSearchResult } from '@/lib/docs';

interface DocsSearchProps {
  sections: ReturnType<typeof import('@/lib/docs').allSections>;
  onSelectResult: (sectionId: string, articleId: string) => void;
}

export function DocsSearch({ sections, onSelectResult }: DocsSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchDocs(sections, query);
      setResults(searchResults.slice(0, 10));
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, sections]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (result: DocSearchResult) => {
    onSelectResult(result.sectionId, result.articleId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={`${result.sectionId}-${result.articleId}`}
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-navy-700 last:border-0 transition-colors ${
                index === selectedIndex
                  ? 'bg-gold-50 dark:bg-gold-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-navy-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-navy-700 rounded text-slate-600 dark:text-slate-400">
                  {result.sectionTitle}
                </span>
              </div>
              <div className="font-medium text-slate-900 dark:text-white">
                {result.articleTitle}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {result.matchedContent}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
