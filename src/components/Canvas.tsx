import { useState } from 'react';
import { Code, FileText, Copy, Download, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { CanvasContent } from '@/types/research';

interface CanvasProps {
  contents: CanvasContent[];
  onRemoveContent: (id: string) => void;
}

export function Canvas({ contents, onRemoveContent }: CanvasProps) {
  const [activeTab, setActiveTab] = useState<string>(contents[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const downloadContent = (content: CanvasContent) => {
    const extension = content.type === 'code' ? content.language || 'txt' : 'md';
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getIcon = (type: CanvasContent['type']) => {
    switch (type) {
      case 'code':
        return Code;
      case 'report':
      case 'markdown':
        return FileText;
      default:
        return FileText;
    }
  };

  return (
    <div className={cn(
      'flex h-full flex-col bg-card',
      isFullscreen && 'fixed inset-0 z-50'
    )}>
      <div className="panel-header">
        <span className="panel-title">Canvas</span>
        <Button
          variant="icon"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {contents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <Code className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Canvas Area</h3>
          <p className="text-muted-foreground max-w-sm">
            The agent will display code snippets, reports, and generated content here
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border overflow-x-auto">
            <TabsList className="h-10 bg-transparent justify-start rounded-none px-2">
              {contents.map((content) => {
                const Icon = getIcon(content.type);
                return (
                  <TabsTrigger
                    key={content.id}
                    value={content.id}
                    className="group data-[state=active]:bg-secondary rounded-md gap-2 px-3"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="max-w-[120px] truncate">{content.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveContent(content.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {contents.map((content) => (
            <TabsContent
              key={content.id}
              value={content.id}
              className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-2">
                  {content.type === 'code' && content.language && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {content.language}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{content.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(content.content)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => downloadContent(content)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto scrollbar-thin p-4">
                {content.type === 'code' ? (
                  <pre className="text-sm font-mono bg-muted/50 rounded-lg p-4 overflow-x-auto">
                    <code>{content.content}</code>
                  </pre>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{content.content}</div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
