"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  File,
  Image,
  Video,
  FileText,
  Music,
  X,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  type: string;
  category: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface FileUploadProps {
  courseId?: string;
  uploadType?: "course-content" | "course-thumbnail" | "general";
  allowedTypes?: string[];
  maxFileSize?: number;
  onUploadComplete?: (file: UploadedFile) => void;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  result?: UploadedFile;
}

const FILE_TYPE_ICONS = {
  images: Image,
  videos: Video,
  documents: FileText,
  audio: Music,
  general: File,
};

const FILE_TYPE_COLORS = {
  images: "bg-green-100 text-green-800",
  videos: "bg-blue-100 text-blue-800",
  documents: "bg-red-100 text-red-800",
  audio: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileCategory(type: string): keyof typeof FILE_TYPE_ICONS {
  if (type.startsWith("image/")) return "images";
  if (type.startsWith("video/")) return "videos";
  if (type.startsWith("audio/")) return "audio";
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("text")
  )
    return "documents";
  return "general";
}

export function FileUpload({
  courseId,
  uploadType = "course-content",
  allowedTypes,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  onUploadComplete,
  className = "",
}: FileUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);
      if (courseId) {
        formData.append("courseId", courseId);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return {
        id: Date.now().toString(),
        filename: result.filename,
        originalName: result.filename,
        url: result.url,
        type: result.type,
        category: result.category,
        size: result.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "current-user",
      };
    },
    [uploadType, courseId]
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      setIsUploading(true);

      const newUploads: UploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploadQueue((prev) => [...prev, ...newUploads]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue; // Skip undefined files

        const uploadIndex = uploadQueue.length + i;

        try {
          // Simulate progress
          setUploadQueue((prev) =>
            prev.map((upload, idx) =>
              idx === uploadIndex ? { ...upload, progress: 50 } : upload
            )
          );

          const result = await uploadFile(file);

          setUploadQueue((prev) =>
            prev.map((upload, idx) =>
              idx === uploadIndex
                ? {
                    ...upload,
                    progress: 100,
                    status: "completed" as const,
                    result,
                  }
                : upload
            )
          );

          setUploadedFiles((prev) => [...prev, result]);
          onUploadComplete?.(result);
        } catch (error) {
          setUploadQueue((prev) =>
            prev.map((upload, idx) =>
              idx === uploadIndex
                ? {
                    ...upload,
                    status: "error" as const,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : upload
            )
          );
        }
      }

      setIsUploading(false);
    },
    [uploadQueue.length, onUploadComplete, uploadFile]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFileUpload(acceptedFiles);
    },
    [handleFileUpload]
  );

  const acceptedTypes = allowedTypes
    ? allowedTypes.reduce((acc, type) => {
        acc[type] = [];
        return acc;
      }, {} as Record<string, string[]>)
    : undefined;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    ...(acceptedTypes && { accept: acceptedTypes }),
  });

  const removeFromQueue = (index: number) => {
    setUploadQueue((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Upload className='h-5 w-5' />
            <span>Upload Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}>
            <input {...getInputProps()} />
            <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            {isDragActive ? (
              <p className='text-blue-600'>Drop the files here...</p>
            ) : (
              <div>
                <p className='text-gray-600 mb-2'>
                  Drag & drop files here, or click to select files
                </p>
                <p className='text-sm text-gray-500'>
                  Supports documents, images, videos, and audio files up to{" "}
                  {formatFileSize(maxFileSize)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Upload Progress</span>
              {isUploading && <Loader2 className='h-5 w-5 animate-spin' />}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {uploadQueue.map((upload, index) => {
              const category = getFileCategory(upload.file.type);
              const Icon = FILE_TYPE_ICONS[category];

              return (
                <div
                  key={index}
                  className='flex items-center space-x-3 p-3 border rounded-lg'>
                  <Icon className='h-6 w-6 text-gray-500 flex-shrink-0' />

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {upload.file.name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {formatFileSize(upload.file.size)}
                    </p>

                    {upload.status === "uploading" && (
                      <div className='mt-1'>
                        <div className='bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center space-x-2'>
                    {upload.status === "completed" && (
                      <CheckCircle className='h-5 w-5 text-green-500' />
                    )}
                    {upload.status === "error" && (
                      <AlertCircle className='h-5 w-5 text-red-500' />
                    )}
                    {upload.status === "uploading" && (
                      <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
                    )}

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeFromQueue(index)}
                      className='h-8 w-8 p-0'>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {uploadedFiles.map((file) => {
              const category = getFileCategory(file.type);
              const Icon = FILE_TYPE_ICONS[category];

              return (
                <div
                  key={file.id}
                  className='flex items-center space-x-3 p-3 border rounded-lg'>
                  <Icon className='h-6 w-6 text-gray-500 flex-shrink-0' />

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {file.filename}
                    </p>
                    <div className='flex items-center space-x-2 mt-1'>
                      <Badge
                        variant='outline'
                        className={FILE_TYPE_COLORS[category]}>
                        {category}
                      </Badge>
                      <span className='text-xs text-gray-500'>
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => window.open(file.url, "_blank")}
                      className='h-8 w-8 p-0'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = file.url;
                        link.download = file.filename;
                        link.click();
                      }}
                      className='h-8 w-8 p-0'>
                      <Download className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
