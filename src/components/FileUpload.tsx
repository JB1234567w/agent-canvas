import { useState, useRef, useCallback } from 'react';
import { X, FileText, Image, File, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileAttachment } from '@/types/research';

interface FileUploadProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF' },
  'image/png': { icon: Image, label: 'Image' },
  'image/jpeg': { icon: Image, label: 'Image' },
  'image/gif': { icon: Image, label: 'Image' },
  'image/webp': { icon: Image, label: 'Image' },
  'text/plain': { icon: FileText, label: 'Text' },
  'text/markdown': { icon: FileText, label: 'Markdown' },
  'application/msword': { icon: FileText, label: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'Word' },
};

export function FileUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxSizeMB = 20,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (attachments.length + newAttachments.length >= maxFiles) return;
      if (file.size > maxSizeBytes) return;

      const attachment: FileAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
      };
      newAttachments.push(attachment);
    });

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  }, [attachments, maxFiles, maxSizeMB, onAttachmentsChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeAttachment = useCallback((id: string) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url);
    }
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  }, [attachments, onAttachmentsChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    const config = ACCEPTED_TYPES[type as keyof typeof ACCEPTED_TYPES];
    return config?.icon || File;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-4 transition-all',
          'flex flex-col items-center justify-center gap-2',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragging ? 'border-primary bg-primary/10' : 'border-border',
        )}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground/70">
            PDF, Images, Documents up to {maxSizeMB}MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.type);
            
            return (
              <div
                key={attachment.id}
                className="group relative flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-2 pr-8"
              >
                {isImage(attachment.type) ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate max-w-[120px]">
                    {attachment.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttachment(attachment.id);
                  }}
                  className="absolute right-1 top-1 p-1 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline attachment display for messages
export function AttachmentPreview({ attachments }: { attachments: FileAttachment[] }) {
  if (!attachments || attachments.length === 0) return null;

  const getFileIcon = (type: string) => {
    const config = ACCEPTED_TYPES[type as keyof typeof ACCEPTED_TYPES];
    return config?.icon || File;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment) => {
        const FileIcon = getFileIcon(attachment.type);

        if (isImage(attachment.type)) {
          return (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-48 max-w-xs rounded-lg border border-border object-contain hover:opacity-90 transition-opacity"
              />
            </a>
          );
        }

        return (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-2 hover:bg-secondary transition-colors"
          >
            <FileIcon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">{attachment.name}</span>
          </a>
        );
      })}
    </div>
  );
}
