import { useState, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  matchCount?: number;
  currentMatch?: number;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  matchCount = 0,
  currentMatch = 0,
  onNextMatch,
  onPrevMatch,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleToggle = useCallback(() => {
    if (isOpen) {
      setQuery('');
      onSearch('');
    }
    setIsOpen(!isOpen);
  }, [isOpen, onSearch]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevMatch?.();
      } else {
        onNextMatch?.();
      }
    }
    if (e.key === 'Escape') {
      handleToggle();
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {isOpen && (
        <div className="flex items-center gap-1 animate-fade-in">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-7 w-40 text-xs pr-12"
              autoFocus
            />
            {query && matchCount > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {currentMatch}/{matchCount}
              </span>
            )}
          </div>
          {query && matchCount > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onPrevMatch}
                title="Previous match (Shift+Enter)"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onNextMatch}
                title="Next match (Enter)"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )}
      <Button
        variant="icon"
        size="icon"
        className={cn('h-7 w-7', isOpen && 'bg-primary/20')}
        onClick={handleToggle}
        title={isOpen ? 'Close search' : 'Search (Ctrl+F)'}
      >
        {isOpen ? <X className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

// Utility function to highlight text matches
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/40 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// Hook for managing search state
export function useSearch(items: string[]) {
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const matches = query.trim()
    ? items
        .map((item, index) => ({ index, item }))
        .filter(({ item }) => item.toLowerCase().includes(query.toLowerCase()))
    : [];

  const nextMatch = useCallback(() => {
    if (matches.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % matches.length);
    }
  }, [matches.length]);

  const prevMatch = useCallback(() => {
    if (matches.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
    }
  }, [matches.length]);

  const reset = useCallback(() => {
    setQuery('');
    setCurrentIndex(0);
  }, []);

  return {
    query,
    setQuery,
    matches,
    matchCount: matches.length,
    currentIndex: matches.length > 0 ? currentIndex + 1 : 0,
    currentMatchIndex: matches[currentIndex]?.index,
    nextMatch,
    prevMatch,
    reset,
  };
}
