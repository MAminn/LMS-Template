"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Award,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
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
}

interface LessonProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

interface CourseLearnPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseLearnPage({ params }: CourseLearnPageProps) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const router = useRouter();

  const fetchCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}`);
      if (response.ok) {
        const result = await response.json();
        // Extract the course data from the API response structure
        setCourse(result.data || result);
      } else if (response.status === 404) {
        console.error("Course not found");
        setCourse(null);
      } else {
        console.error("Failed to fetch course:", response.status);
        setCourse(null);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }, [resolvedParams.id]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/courses/${resolvedParams.id}/progress`
      );
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  }, [resolvedParams.id]);

  const calculateProgress = useCallback(() => {
    const totalLessons = modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );
    const completedLessons = progress.filter((p) => p.completed).length;
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    setCompletionPercentage(percentage);
  }, [modules, progress]);

  useEffect(() => {
    fetchCourse();
    fetchModules();
    fetchProgress();
  }, [fetchCourse, fetchModules, fetchProgress]);

  useEffect(() => {
    if (modules.length > 0 && !currentLesson) {
      // Set first lesson as current
      const firstModule = modules[0];
      if (
        firstModule &&
        firstModule.lessons &&
        firstModule.lessons.length > 0
      ) {
        const firstLesson = firstModule.lessons[0];
        if (firstLesson) {
          setCurrentLesson(firstLesson);
          setExpandedModules(new Set([firstModule.id]));
        }
      }
    }
  }, [modules, currentLesson]);

  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  const markLessonComplete = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        fetchProgress();
        // Auto-advance to next lesson
        const currentModule = modules.find((m) =>
          m.lessons.some((l) => l.id === lessonId)
        );
        if (currentModule) {
          const currentLessonIndex = currentModule.lessons.findIndex(
            (l) => l.id === lessonId
          );
          if (currentLessonIndex < currentModule.lessons.length - 1) {
            // Next lesson in same module
            const nextLesson = currentModule.lessons[currentLessonIndex + 1];
            if (nextLesson) {
              setCurrentLesson(nextLesson);
            }
          } else {
            // Next module's first lesson
            const currentModuleIndex = modules.findIndex(
              (m) => m.id === currentModule.id
            );
            if (currentModuleIndex < modules.length - 1) {
              const nextModule = modules[currentModuleIndex + 1];
              if (
                nextModule &&
                nextModule.lessons &&
                nextModule.lessons.length > 0
              ) {
                const firstLesson = nextModule.lessons[0];
                if (firstLesson) {
                  setCurrentLesson(firstLesson);
                  setExpandedModules(
                    (prev) => new Set([...prev, nextModule.id])
                  );
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
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

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lessonId === lessonId && p.completed);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getVideoEmbedUrl = (url: string | null) => {
    if (!url) return null;

    // YouTube URL conversion
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo URL conversion
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Course Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            The course you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.push("/courses")}
            className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'>
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <button
                onClick={() => router.push("/student")}
                className='flex items-center text-blue-600 hover:text-blue-700 mr-4'>
                <ArrowLeft className='h-5 w-5 mr-2' />
                Back to Dashboard
              </button>
              <div>
                <h1 className='text-lg font-semibold text-gray-900'>
                  {course?.title}
                </h1>
                <p className='text-sm text-gray-600'>
                  by {course?.instructor?.name || "Loading..."}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-600'>Progress:</span>
                <div className='w-32 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out'
                    style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>
                  {completionPercentage}%
                </span>
              </div>
              {completionPercentage === 100 && (
                <div className='flex items-center text-green-600'>
                  <Award className='h-5 w-5 mr-1' />
                  <span className='text-sm font-medium'>Complete!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Course Content Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm'>
              <div className='p-4 border-b border-gray-200'>
                <h2 className='font-semibold text-gray-900'>Course Content</h2>
              </div>
              <div className='max-h-96 overflow-y-auto'>
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className='border-b border-gray-200 last:border-b-0'>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className='w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium text-gray-900 text-sm'>
                          {module.title}
                        </h3>
                        <p className='text-xs text-gray-600 mt-1'>
                          {module.lessons.length} lessons
                        </p>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className='h-4 w-4 text-gray-500' />
                      ) : (
                        <ChevronRight className='h-4 w-4 text-gray-500' />
                      )}
                    </button>
                    {expandedModules.has(module.id) && (
                      <div className='pb-2'>
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={`w-full p-3 text-left text-sm border-l-2 ${
                              currentLesson?.id === lesson.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-transparent hover:bg-gray-50"
                            }`}>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center'>
                                {isLessonCompleted(lesson.id) ? (
                                  <CheckCircle className='h-4 w-4 text-green-500 mr-2 flex-shrink-0' />
                                ) : (
                                  <PlayCircle className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
                                )}
                                <span className='truncate'>{lesson.title}</span>
                              </div>
                              {lesson.duration && (
                                <span className='text-xs text-gray-500 ml-2'>
                                  {formatDuration(lesson.duration)}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className='lg:col-span-3'>
            {currentLesson ? (
              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                {/* Video Player */}
                {currentLesson.videoUrl && (
                  <div className='aspect-video bg-black'>
                    <iframe
                      src={getVideoEmbedUrl(currentLesson.videoUrl) || ""}
                      className='w-full h-full'
                      frameBorder='0'
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  </div>
                )}

                {/* Lesson Content */}
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                        {currentLesson.title}
                      </h1>
                      {currentLesson.description && (
                        <p className='text-gray-600'>
                          {currentLesson.description}
                        </p>
                      )}
                      {currentLesson.duration && (
                        <div className='flex items-center text-sm text-gray-500 mt-2'>
                          <Clock className='h-4 w-4 mr-1' />
                          {formatDuration(currentLesson.duration)}
                        </div>
                      )}
                    </div>
                    {!isLessonCompleted(currentLesson.id) && (
                      <button
                        onClick={() => markLessonComplete(currentLesson.id)}
                        className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center'>
                        <CheckCircle className='h-5 w-5 mr-2' />
                        Mark Complete
                      </button>
                    )}
                  </div>

                  {/* Lesson Text Content */}
                  {currentLesson.content && (
                    <div className='prose max-w-none'>
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                          <BookOpen className='h-5 w-5 mr-2' />
                          Lesson Notes
                        </h3>
                        <div className='text-gray-700 whitespace-pre-wrap'>
                          {currentLesson.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className='flex justify-between items-center mt-8 pt-6 border-t border-gray-200'>
                    <div className='text-sm text-gray-600'>
                      Lesson {currentLesson.order} of{" "}
                      {modules.find((m) => m.id === currentLesson.moduleId)
                        ?.lessons.length || 0}
                    </div>
                    <div className='flex space-x-2'>
                      {isLessonCompleted(currentLesson.id) ? (
                        <div className='flex items-center text-green-600 text-sm'>
                          <CheckCircle className='h-4 w-4 mr-1' />
                          Completed
                        </div>
                      ) : (
                        <button
                          onClick={() => markLessonComplete(currentLesson.id)}
                          className='flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors'>
                          <CheckCircle className='h-4 w-4 mr-2' />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
                <PlayCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Welcome to the Course
                </h3>
                <p className='text-gray-600'>
                  Select a lesson from the sidebar to start learning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
