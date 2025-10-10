"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Upload,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CourseFile {
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

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
}

export default function CourseFilesPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upload");

  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // In a real app, fetch course data from API
        setCourse({
          id: courseId,
          title: "JavaScript Fundamentals",
          description: "Learn the basics of JavaScript programming",
          instructorId: (session?.user as { id?: string })?.id || "",
        });

        // Fetch existing files
        const response = await fetch(`/api/upload?courseId=${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session && courseId) {
      fetchCourseData();
    }
  }, [session, courseId]);

  const handleFileUpload = (file: CourseFile) => {
    setFiles((prev) => [...prev, file]);
  };

  const getFilesByCategory = (category: string) => {
    return files.filter((file) => file.category === category);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p>Loading course files...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Course not found</h2>
          <Link href='/instructor' className='text-blue-600 hover:underline'>
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-4'>
            <Link
              href={`/instructor/courses/${courseId}/content`}
              className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Course Content
            </Link>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {course.title}
              </h1>
              <p className='text-gray-600 mt-2'>
                Upload and manage course files and resources
              </p>
            </div>
            <Badge variant='outline' className='text-blue-700 bg-blue-50'>
              File Manager
            </Badge>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='upload' className='flex items-center space-x-2'>
              <Upload className='h-4 w-4' />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger
              value='documents'
              className='flex items-center space-x-2'>
              <FileText className='h-4 w-4' />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value='images' className='flex items-center space-x-2'>
              <ImageIcon className='h-4 w-4' />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value='videos' className='flex items-center space-x-2'>
              <Video className='h-4 w-4' />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value='audio' className='flex items-center space-x-2'>
              <Music className='h-4 w-4' />
              <span>Audio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='upload' className='space-y-6'>
            <FileUpload
              courseId={courseId}
              uploadType='course-content'
              onUploadComplete={handleFileUpload}
              className='w-full'
            />
          </TabsContent>

          <TabsContent value='documents' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5' />
                  <span>Course Documents</span>
                  <Badge variant='outline'>
                    {getFilesByCategory("documents").length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilesByCategory("documents").length === 0 ? (
                  <div className='text-center py-8'>
                    <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>
                      No documents uploaded yet
                    </p>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className='flex items-center space-x-2'>
                      <Plus className='h-4 w-4' />
                      <span>Upload Documents</span>
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {getFilesByCategory("documents").map((file) => (
                      <div
                        key={file.id}
                        className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                        <div className='flex items-start space-x-3'>
                          <FileText className='h-6 w-6 text-red-500 flex-shrink-0 mt-1' />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {file.filename}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {formatFileSize(file.size)}
                            </p>
                            <div className='mt-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => window.open(file.url, "_blank")}>
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='images' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <ImageIcon className='h-5 w-5' />
                  <span>Course Images</span>
                  <Badge variant='outline'>
                    {getFilesByCategory("images").length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilesByCategory("images").length === 0 ? (
                  <div className='text-center py-8'>
                    <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>No images uploaded yet</p>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className='flex items-center space-x-2'>
                      <Plus className='h-4 w-4' />
                      <span>Upload Images</span>
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {getFilesByCategory("images").map((file) => (
                      <div
                        key={file.id}
                        className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                        <div className='aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center'>
                          {file.url.startsWith("data:") ? (
                            <Image
                              src={file.url}
                              alt={file.filename}
                              width={200}
                              height={150}
                              className='max-h-full max-w-full object-contain rounded-lg'
                            />
                          ) : (
                            <ImageIcon className='h-8 w-8 text-gray-400' />
                          )}
                        </div>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {file.filename}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {formatFileSize(file.size)}
                        </p>
                        <div className='mt-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => window.open(file.url, "_blank")}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='videos' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Video className='h-5 w-5' />
                  <span>Course Videos</span>
                  <Badge variant='outline'>
                    {getFilesByCategory("videos").length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilesByCategory("videos").length === 0 ? (
                  <div className='text-center py-8'>
                    <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>No videos uploaded yet</p>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className='flex items-center space-x-2'>
                      <Plus className='h-4 w-4' />
                      <span>Upload Videos</span>
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {getFilesByCategory("videos").map((file) => (
                      <div key={file.id} className='border rounded-lg p-4'>
                        <div className='aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center'>
                          <Video className='h-8 w-8 text-gray-400' />
                        </div>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {file.filename}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {formatFileSize(file.size)}
                        </p>
                        <div className='mt-3 flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => window.open(file.url, "_blank")}>
                            Watch
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='audio' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Music className='h-5 w-5' />
                  <span>Audio Files</span>
                  <Badge variant='outline'>
                    {getFilesByCategory("audio").length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilesByCategory("audio").length === 0 ? (
                  <div className='text-center py-8'>
                    <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>
                      No audio files uploaded yet
                    </p>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className='flex items-center space-x-2'>
                      <Plus className='h-4 w-4' />
                      <span>Upload Audio</span>
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {getFilesByCategory("audio").map((file) => (
                      <div key={file.id} className='border rounded-lg p-4'>
                        <div className='flex items-center space-x-3'>
                          <Music className='h-8 w-8 text-purple-500 flex-shrink-0' />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {file.filename}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {formatFileSize(file.size)}
                            </p>
                            <div className='mt-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => window.open(file.url, "_blank")}>
                                Play
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
