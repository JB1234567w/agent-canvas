import { useState, useCallback, useMemo } from 'react';
import { Code, FileText, Copy, Download, X, Maximize2, Minimize2, FileDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { SearchBar, highlightText } from '@/components/SearchBar';
import { toast } from 'sonner';
import type { CanvasContent } from '@/types/research';

interface CanvasProps {
  contents: CanvasContent[];
  onRemoveContent: (id: string) => void;
}

export function Canvas({ contents, onRemoveContent }: CanvasProps) {
  const [activeTab, setActiveTab] = useState<string>(contents[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Find matches across all canvas content
  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return contents.filter((c) => 
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).map((c) => c.id);
  }, [contents, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentMatchIndex(0);
  }, []);

  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    setActiveTab(matches[nextIndex]);
  }, [matches, currentMatchIndex]);

  const handlePrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIndex);
    setActiveTab(matches[prevIndex]);
  }, [matches, currentMatchIndex]);

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const downloadAsMarkdown = useCallback((content: CanvasContent) => {
    const extension = content.type === 'code' ? content.language || 'txt' : 'md';
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${content.title}.${extension}`);
  }, []);

  const downloadAsPDF = useCallback((content: CanvasContent) => {
    // Create a new window with styled content for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${content.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              color: #1a1a1a;
            }
            h1 { font-size: 2em; margin-bottom: 0.5em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
            h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
            h3 { font-size: 1.25em; margin-top: 1.25em; margin-bottom: 0.5em; }
            p { margin: 1em 0; }
            pre {
              background: #f5f5f5;
              padding: 16px;
              border-radius: 8px;
              overflow-x: auto;
              font-family: 'Fira Code', 'Monaco', monospace;
              font-size: 0.9em;
            }
            code {
              background: #f0f0f0;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Fira Code', 'Monaco', monospace;
            }
            pre code { background: none; padding: 0; }
            ul, ol { margin: 1em 0; padding-left: 2em; }
            li { margin: 0.5em 0; }
            blockquote {
              border-left: 4px solid #ddd;
              margin: 1em 0;
              padding-left: 1em;
              color: #666;
              font-style: italic;
            }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background: #f5f5f5; }
            @media print {
              body { padding: 20px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            }
          </style>
        </head>
        <body>
          ${markdownToHtml(content.content)}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('Opening print dialog for PDF export');
  }, []);

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
        <div className="flex items-center gap-1">
          <SearchBar
            onSearch={handleSearch}
            matchCount={matches.length}
            currentMatch={matches.length > 0 ? currentMatchIndex + 1 : 0}
            onNextMatch={handleNextMatch}
            onPrevMatch={handlePrevMatch}
            placeholder="Search canvas..."
          />
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
                const isMatch = matches.includes(content.id);
                return (
                  <TabsTrigger
                    key={content.id}
                    value={content.id}
                    className={cn(
                      'group data-[state=active]:bg-secondary rounded-md gap-2 px-3',
                      isMatch && searchQuery && 'ring-1 ring-primary/50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="max-w-[120px] truncate">
                      {searchQuery ? highlightText(content.title, searchQuery) : content.title}
                    </span>
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
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadAsMarkdown(content)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download as {content.type === 'code' ? (content.language || 'Text') : 'Markdown'}
                      </DropdownMenuItem>
                      {content.type !== 'code' && (
                        <DropdownMenuItem onClick={() => downloadAsPDF(content)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex-1 overflow-auto scrollbar-thin p-4">
                <MarkdownRenderer 
                  content={content.type === 'code' ? `\`\`\`${content.language || ''}\n${content.content}\n\`\`\`` : content.content}
                  searchQuery={searchQuery}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// Simple markdown to HTML converter for PDF export
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    // Blockquotes
    .replace(/^>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');

  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up list items
  html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gis, '');

  return html;
}
