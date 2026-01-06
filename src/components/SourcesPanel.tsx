import { useMemo } from 'react';
import { ExternalLink, BookOpen, Globe, FileText, Link2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message, Source } from '@/types/research';

interface SourcesPanelProps {
  messages: Message[];
}

interface GroupedSource extends Source {
  count: number;
  messageIds: string[];
}

export function SourcesPanel({ messages }: SourcesPanelProps) {
  const groupedSources = useMemo(() => {
    const sourceMap = new Map<string, GroupedSource>();

    messages.forEach((message) => {
      if (message.role === 'agent' && message.sources) {
        message.sources.forEach((source) => {
          const key = source.url;
          const existing = sourceMap.get(key);
          if (existing) {
            existing.count++;
            existing.messageIds.push(message.id);
          } else {
            sourceMap.set(key, {
              ...source,
              count: 1,
              messageIds: [message.id],
            });
          }
        });
      }
    });

    return Array.from(sourceMap.values()).sort((a, b) => b.count - a.count);
  }, [messages]);

  const getSourceIcon = (url: string) => {
    const domain = url.toLowerCase();
    if (domain.includes('arxiv')) return FileText;
    if (domain.includes('nature') || domain.includes('science')) return BookOpen;
    if (domain.includes('wikipedia')) return Globe;
    return Link2;
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const totalSources = groupedSources.length;
  const totalCitations = groupedSources.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="panel-header">
        <span className="panel-title">Sources</span>
        <span className="text-xs text-muted-foreground ml-2">
          {totalSources} source{totalSources !== 1 ? 's' : ''}
        </span>
      </div>

      <ScrollArea className="flex-1">
        {groupedSources.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-medium mb-1">No sources yet</h4>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Sources and citations will appear here as the agent researches your questions.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {/* Stats Summary */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-lg font-bold text-primary">{totalSources}</div>
                <div className="text-xs text-muted-foreground">Sources</div>
              </div>
              <div className="flex-1 rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-lg font-bold text-primary">{totalCitations}</div>
                <div className="text-xs text-muted-foreground">Citations</div>
              </div>
            </div>

            {/* Sources List */}
            {groupedSources.map((source, index) => {
              const Icon = getSourceIcon(source.url);
              return (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        [{index + 1}]
                      </span>
                      <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {source.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {getDomain(source.url)}
                    </p>
                    {source.snippet && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1">
                        {source.snippet}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                        Cited {source.count}×
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
