import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Video, FileText } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File, metadata: FileMetadata) => Promise<void>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  lessonId?: string;
  type: 'attachment' | 'video' | 'thumbnail';
}

interface FileMetadata {
  title: string;
  description?: string;
  isRequired?: boolean;
}

export default function EnhancedFileUpload({
  onUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'video/*': ['.mp4', '.webm', '.mov'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB default
  type,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    metadata: FileMetadata;
    id: string;
  }>>([]);
  const [showMetadataForm, setShowMetadataForm] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const fileName = file.name.split('.')[0];
      setUploadedFiles(prev => [...prev, {
        file,
        metadata: { title: fileName || 'Untitled', description: '', isRequired: false },
        id,
      }]);
      setShowMetadataForm(id);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: type === 'attachment',
  });

  const handleUpload = async (fileItem: { file: File; metadata: FileMetadata; id: string }) => {
    setUploading(true);
    try {
      await onUpload(fileItem.file, fileItem.metadata);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileItem.id));
      setShowMetadataForm(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setShowMetadataForm(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop {type === 'attachment' ? 'files' : `a ${type}`} here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.map((fileItem) => (
        <div key={fileItem.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getFileIcon(fileItem.file)}
              <div>
                <p className="font-medium text-gray-900">{fileItem.file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(fileItem.file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => removeFile(fileItem.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Metadata Form */}
          {showMetadataForm === fileItem.id && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={fileItem.metadata.title}
                  onChange={(e) => {
                    const newFiles = uploadedFiles.map(f => 
                      f.id === fileItem.id 
                        ? { ...f, metadata: { ...f.metadata, title: e.target.value } }
                        : f
                    );
                    setUploadedFiles(newFiles);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter file title"
                />
              </div>

              {type === 'attachment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={fileItem.metadata.description}
                      onChange={(e) => {
                        const newFiles = uploadedFiles.map(f => 
                          f.id === fileItem.id 
                            ? { ...f, metadata: { ...f.metadata, description: e.target.value } }
                            : f
                        );
                        setUploadedFiles(newFiles);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Optional description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${fileItem.id}`}
                      checked={fileItem.metadata.isRequired}
                      onChange={(e) => {
                        const newFiles = uploadedFiles.map(f => 
                          f.id === fileItem.id 
                            ? { ...f, metadata: { ...f.metadata, isRequired: e.target.checked } }
                            : f
                        );
                        setUploadedFiles(newFiles);
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`required-${fileItem.id}`} className="ml-2 text-sm text-gray-700">
                      Required for course completion
                    </label>
                  </div>
                </>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpload(fileItem)}
                  disabled={uploading || !fileItem.metadata.title.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => setShowMetadataForm(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}