"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon, Video, Music, File, Loader2 } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<UploadedFile[]>;
  disabled?: boolean;
  className?: string;
  variant?: "dropzone" | "button";
  hint?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Video;
  if (type.startsWith("audio/")) return Music;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileUpload({
  accept = "image/*,video/*,audio/*",
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  value = [],
  onChange,
  onUpload,
  disabled = false,
  className,
  variant = "dropzone",
  hint,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: FileList | File[]): { valid: File[]; errors: string[] } => {
      const fileArray = Array.from(files);
      const errors: string[] = [];
      const valid: File[] = [];

      // Check max files
      if (!multiple && fileArray.length > 1) {
        errors.push("Only one file is allowed");
        return { valid: [], errors };
      }

      if (value.length + fileArray.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return { valid: [], errors };
      }

      // Validate each file
      for (const file of fileArray) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} exceeds ${maxSize}MB limit`);
          continue;
        }

        // Check file type
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", "/"));
          }
          return file.type === type;
        });

        if (!isAccepted) {
          errors.push(`${file.name} is not an accepted file type`);
          continue;
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [accept, maxFiles, maxSize, multiple, value.length]
  );

  const createPreview = (file: File): string | undefined => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setError(errors.join(", "));
        return;
      }

      if (valid.length === 0) return;

      setIsUploading(true);

      try {
        let uploadedFiles: UploadedFile[];

        if (onUpload) {
          // Custom upload handler
          uploadedFiles = await onUpload(valid);
        } else {
          // Default: create local file references
          uploadedFiles = await Promise.all(
            valid.map(async (file) => ({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file),
              preview: createPreview(file),
            }))
          );
        }

        const newFiles = multiple ? [...value, ...uploadedFiles] : uploadedFiles;
        onChange?.(newFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [validateFiles, onUpload, multiple, value, onChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const newFiles = value.filter((f) => f.id !== id);
      onChange?.(newFiles);
    },
    [value, onChange]
  );

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  if (variant === "button") {
    return (
      <div className={cn("space-y-2", className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload File
            </>
          )}
        </Button>

        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 bg-secondary rounded-md"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="p-0.5 hover:bg-destructive/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !isDragging && "hover:border-primary/50 hover:bg-secondary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Uploading..." : "Drop files here or click to upload"}
            </p>
            {hint && (
              <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxSize}MB {multiple && `, up to ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {value.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="relative group rounded-lg overflow-hidden border bg-secondary"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center bg-secondary">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file.id);
                    }}
                    className="p-1.5 bg-destructive rounded-full text-white hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-2 bg-background/80 backdrop-blur-sm">
                  <p className="text-xs truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
