"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  FileText,
  Video,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isPublished: boolean;
  instructorId: string;
  createdAt: string;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  courseId: string;
  lessons: Lesson[];
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  moduleId: string;
  createdAt: string;
}

interface CourseContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseContentPage({ params }: CourseContentPageProps) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: "",
  });

  const router = useRouter();

  const fetchCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [resolvedParams.id]);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${resolvedParams.id}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
        // Expand first module by default
        if (data.length > 0) {
          setExpandedModules(new Set([data[0].id]));
        }
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchCourse();
    fetchModules();
  }, [fetchCourse, fetchModules]);

  const createModule = async () => {
    if (!newModuleTitle.trim()) return;

    try {
      const response = await fetch(
        `/api/courses/${resolvedParams.id}/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newModuleTitle,
            description: newModuleDescription,
          }),
        }
      );

      if (response.ok) {
        setNewModuleTitle("");
        setNewModuleDescription("");
        setShowModuleForm(false);
        fetchModules();
      } else {
        alert("Failed to create module");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Failed to create module");
    }
  };

  const createLesson = async (moduleId: string) => {
    if (!newLessonData.title.trim()) return;

    try {
      const response = await fetch(
        `/api/courses/${resolvedParams.id}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newLessonData),
        }
      );

      if (response.ok) {
        setNewLessonData({
          title: "",
          description: "",
          content: "",
          videoUrl: "",
          duration: "",
        });
        setShowLessonForm(null);
        fetchModules();
      } else {
        alert("Failed to create lesson");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert("Failed to create lesson");
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "No duration";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='h-64 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center'>
            <button
              onClick={() => router.push("/instructor/courses")}
              className='flex items-center text-blue-600 hover:text-blue-700 mr-4'>
              <ArrowLeft className='h-5 w-5 mr-2' />
              Back to Courses
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Course Content: {course?.title}
              </h1>
              <p className='text-gray-600'>Manage modules and lessons</p>
            </div>
          </div>
          <button
            onClick={() => setShowModuleForm(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center'>
            <Plus className='h-5 w-5 mr-2' />
            Add Module
          </button>
        </div>

        {/* Module Creation Form */}
        {showModuleForm && (
          <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Create New Module
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Module Title *
                </label>
                <input
                  type='text'
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter module title'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Module Description
                </label>
                <textarea
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter module description'
                />
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={createModule}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'>
                  Create Module
                </button>
                <button
                  onClick={() => {
                    setShowModuleForm(false);
                    setNewModuleTitle("");
                    setNewModuleDescription("");
                  }}
                  className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors'>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modules List */}
        <div className='space-y-4'>
          {modules.length === 0 ? (
            <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
              <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No modules yet
              </h3>
              <p className='text-gray-600 mb-6'>
                Create your first module to start building your course content.
              </p>
              <button
                onClick={() => setShowModuleForm(true)}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'>
                Create First Module
              </button>
            </div>
          ) : (
            modules.map((module) => (
              <div
                key={module.id}
                className='bg-white rounded-lg shadow-sm overflow-hidden'>
                {/* Module Header */}
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className='p-1 rounded hover:bg-gray-100 mr-3'>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className='h-5 w-5 text-gray-500' />
                        ) : (
                          <ChevronRight className='h-5 w-5 text-gray-500' />
                        )}
                      </button>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Module {module.order}: {module.title}
                        </h3>
                        {module.description && (
                          <p className='text-gray-600 text-sm mt-1'>
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm text-gray-500'>
                        {module.lessons.length} lessons
                      </span>
                      <button
                        onClick={() => setShowLessonForm(module.id)}
                        className='bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center'>
                        <Plus className='h-4 w-4 mr-1' />
                        Add Lesson
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lesson Creation Form */}
                {showLessonForm === module.id && (
                  <div className='p-6 bg-gray-50 border-b border-gray-200'>
                    <h4 className='text-md font-semibold text-gray-900 mb-4'>
                      Create New Lesson
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Lesson Title *
                        </label>
                        <input
                          type='text'
                          value={newLessonData.title}
                          onChange={(e) =>
                            setNewLessonData({
                              ...newLessonData,
                              title: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Enter lesson title'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Duration (minutes)
                        </label>
                        <input
                          type='number'
                          value={newLessonData.duration}
                          onChange={(e) =>
                            setNewLessonData({
                              ...newLessonData,
                              duration: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='e.g., 15'
                        />
                      </div>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Description
                        </label>
                        <input
                          type='text'
                          value={newLessonData.description}
                          onChange={(e) =>
                            setNewLessonData({
                              ...newLessonData,
                              description: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Brief lesson description'
                        />
                      </div>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Video URL
                        </label>
                        <input
                          type='url'
                          value={newLessonData.videoUrl}
                          onChange={(e) =>
                            setNewLessonData({
                              ...newLessonData,
                              videoUrl: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='https://youtube.com/watch?v=...'
                        />
                      </div>
                    </div>
                    <div className='flex space-x-2 mt-4'>
                      <button
                        onClick={() => createLesson(module.id)}
                        className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'>
                        Create Lesson
                      </button>
                      <button
                        onClick={() => {
                          setShowLessonForm(null);
                          setNewLessonData({
                            title: "",
                            description: "",
                            content: "",
                            videoUrl: "",
                            duration: "",
                          });
                        }}
                        className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors'>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Lessons List */}
                {expandedModules.has(module.id) && (
                  <div className='p-6'>
                    {module.lessons.length === 0 ? (
                      <div className='text-center py-8'>
                        <PlayCircle className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                        <p className='text-gray-600 text-sm'>
                          No lessons in this module yet.
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50'>
                            <div className='flex items-center'>
                              {lesson.videoUrl ? (
                                <Video className='h-5 w-5 text-blue-600 mr-3' />
                              ) : (
                                <FileText className='h-5 w-5 text-gray-600 mr-3' />
                              )}
                              <div>
                                <h5 className='font-medium text-gray-900'>
                                  Lesson {lesson.order}: {lesson.title}
                                </h5>
                                {lesson.description && (
                                  <p className='text-sm text-gray-600 mt-1'>
                                    {lesson.description}
                                  </p>
                                )}
                                <div className='flex items-center mt-1 text-xs text-gray-500'>
                                  <Clock className='h-3 w-3 mr-1' />
                                  {formatDuration(lesson.duration)}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <button className='p-2 text-gray-400 hover:text-gray-600'>
                                <Edit className='h-4 w-4' />
                              </button>
                              <button className='p-2 text-red-400 hover:text-red-600'>
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
