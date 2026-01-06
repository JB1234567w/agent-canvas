import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Paperclip, Loader2, Bot, User, X } from 'lucide-react';
import { SearchBar, highlightText } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { FileUpload, AttachmentPreview } from '@/components/FileUpload';
import type { Message, FileAttachment } from '@/types/research';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
}

export function ChatPanel({ messages, isLoading, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Find all matches
  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return messages
      .filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((m) => m.id);
  }, [messages, searchQuery]);

  const scrollToMatch = useCallback((messageId: string) => {
    const ref = messageRefs.current.get(messageId);
    ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(matches[nextIndex]);
  }, [matches, currentMatchIndex, scrollToMatch]);

  const handlePrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(matches[prevIndex]);
  }, [matches, currentMatchIndex, scrollToMatch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentMatchIndex(0);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(input.trim(), attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
    setShowUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="panel-header">
        <span className="panel-title">Research Chat</span>
        <SearchBar
          onSearch={handleSearch}
          matchCount={matches.length}
          currentMatch={matches.length > 0 ? currentMatchIndex + 1 : 0}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          placeholder="Search messages..."
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Deep Research Agent</h3>
            <p className="text-muted-foreground max-w-md">
              Ask me anything. I'll search, analyze, and synthesize information to provide
              comprehensive research with sources.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              ref={(el) => {
                if (el) messageRefs.current.set(message.id, el);
              }}
              className={cn(
                'flex gap-3 animate-fade-in transition-all duration-300',
                message.role === 'user' ? 'flex-row-reverse' : '',
                searchQuery && matches.includes(message.id) && 'ring-2 ring-primary/50 rounded-lg p-2 -m-2',
                searchQuery && matches[currentMatchIndex] === message.id && 'ring-primary bg-primary/5'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                )}
              </div>
              <div
                className={cn(
                  'flex flex-col gap-1 max-w-[80%]',
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'message-bubble',
                    message.role === 'user' ? 'message-user' : 'message-agent'
                  )}
                >
                {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {searchQuery ? highlightText(message.content, searchQuery) : message.content}
                    </p>
                  ) : (
                    <MarkdownRenderer 
                      content={message.content} 
                      className="text-sm" 
                      searchQuery={searchQuery}
                    />
                  )}
                  {message.attachments && <AttachmentPreview attachments={message.attachments} />}
                </div>
                <span className="text-xs text-muted-foreground px-1">
                  {formatTime(message.timestamp)}
                </span>
                {message.sources && message.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-md text-primary transition-colors"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Bot className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="message-bubble message-agent flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Researching...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {/* File Upload Area */}
        {showUpload && (
          <div className="relative">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <FileUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
        )}

        {/* Inline attachment previews when upload panel is closed */}
        {!showUpload && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1 text-xs"
              >
                <span className="truncate max-w-[100px]">{attachment.name}</span>
                <button
                  onClick={() => setAttachments(attachments.filter(a => a.id !== attachment.id))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="icon"
            size="icon"
            className={cn('shrink-0', showUpload && 'bg-primary/20')}
            onClick={() => setShowUpload(!showUpload)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            ref={textareaRef}
            placeholder="Ask a research question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none bg-input border-border"
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
