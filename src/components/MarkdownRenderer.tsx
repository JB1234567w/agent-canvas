import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  searchQuery?: string;
}

function highlightSearchInText(text: string, query: string): React.ReactNode {
  if (!query.trim() || typeof text !== 'string') return text;

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

function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const codeElement = (children as React.ReactElement)?.props?.children;
    const text = typeof codeElement === 'string' ? codeElement : String(codeElement || '');
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="group relative my-3">
      <pre
        className="bg-muted/50 rounded-lg p-4 overflow-x-auto pr-12"
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded-md transition-all',
          'opacity-0 group-hover:opacity-100',
          'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
          copied && 'opacity-100 bg-primary text-primary-foreground'
        )}
        title={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export function MarkdownRenderer({ content, className, searchQuery }: MarkdownRendererProps) {
  const wrapWithHighlight = useCallback((children: React.ReactNode): React.ReactNode => {
    if (!searchQuery) return children;
    if (typeof children === 'string') {
      return highlightSearchInText(children, searchQuery);
    }
    if (Array.isArray(children)) {
      return children.map((child, i) => (
        <span key={i}>{wrapWithHighlight(child)}</span>
      ));
    }
    return children;
  }, [searchQuery]);

  return (
    <div className={cn('prose prose-invert prose-sm max-w-none', className)}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => (
            <CodeBlock {...props}>{children}</CodeBlock>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-primary text-[0.9em]"
                  {...props}
                >
                  {wrapWithHighlight(children)}
                </code>
              );
            }
            return (
              <code className={cn('text-sm font-mono', codeClassName)} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-foreground mt-6 mb-3">{wrapWithHighlight(children)}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-foreground mt-5 mb-2">{wrapWithHighlight(children)}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{wrapWithHighlight(children)}</h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground/90 leading-relaxed my-2">{wrapWithHighlight(children)}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-foreground/90">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-foreground/90">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground/90">{wrapWithHighlight(children)}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-3">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-border">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2">{children}</td>
          ),
          hr: () => <hr className="border-border my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
