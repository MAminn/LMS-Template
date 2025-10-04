"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Users,
  Clock,
  Star,
  PlayCircle,
  BookOpen,
  Award,
} from "lucide-react";
import { PaymentButton } from "@/components/PaymentButton";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isPublished: boolean;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      duration: number | null;
    }>;
  }>;
  _count?: {
    enrollments: number;
  };
}

interface CourseDetailProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailProps) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCourse();
    if (session?.user) {
      checkEnrollmentStatus();
    }
  }, [resolvedParams.id, session]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}`);
      if (response.ok) {
        const result = await response.json();
        setCourse(result.data || result);
      } else {
        setError("Course not found");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!session?.user) return;

    try {
      // Check enrollment
      const enrollmentResponse = await fetch(
        `/api/courses/${resolvedParams.id}/enrollment`
      );
      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        setIsEnrolled(enrollmentData.enrolled);
      }

      // Check payment status
      const paymentResponse = await fetch(
        `/api/payments/status?courseId=${resolvedParams.id}`
      );
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setHasPurchased(paymentData.purchased);
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            {error || "Course Not Found"}
          </h1>
          <p className='text-gray-600 mb-6'>
            The course you&apos;re looking for doesn&apos;t exist or isn&apos;t
            available.
          </p>
          <Link
            href='/courses'
            className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'>
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons =
    course.modules?.reduce(
      (total, module) => total + module.lessons.length,
      0
    ) || 0;
  const totalDuration =
    course.modules?.reduce(
      (total, module) =>
        total +
        module.lessons.reduce(
          (moduleTotal, lesson) => moduleTotal + (lesson.duration || 0),
          0
        ),
      0
    ) || 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const canAccessCourse = course.price === 0 || hasPurchased || isEnrolled;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <button
          onClick={() => router.back()}
          className='flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors'>
          <ArrowLeft className='h-5 w-5 mr-2' />
          Back to Courses
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-8'>
              {/* Course Header */}
              <div className='relative h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center'>
                {course.thumbnail ? (
                  <div
                    className='absolute inset-0 bg-cover bg-center'
                    style={{ backgroundImage: `url(${course.thumbnail})` }}
                  />
                ) : (
                  <div className='text-white text-6xl font-bold'>
                    {course.title.charAt(0)}
                  </div>
                )}
                <div className='absolute inset-0 bg-black bg-opacity-30' />
                <div className='relative text-center text-white'>
                  <h1 className='text-4xl font-bold mb-2'>{course.title}</h1>
                  <p className='text-xl opacity-90'>
                    by {course.instructor?.name}
                  </p>
                </div>
              </div>

              {/* Course Info */}
              <div className='p-6'>
                <div className='flex items-center space-x-6 text-sm text-gray-600 mb-6'>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 mr-1' />
                    {course._count?.enrollments || 0} students
                  </div>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 mr-1' />
                    {formatDuration(totalDuration)}
                  </div>
                  <div className='flex items-center'>
                    <BookOpen className='h-4 w-4 mr-1' />
                    {totalLessons} lessons
                  </div>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 mr-1 text-yellow-400 fill-current' />
                    4.8 (324 reviews)
                  </div>
                </div>

                <div className='prose max-w-none'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                    About This Course
                  </h2>
                  <p className='text-gray-700 leading-relaxed text-lg'>
                    {course.description ||
                      "Learn everything you need to know in this comprehensive course."}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Content */}
            {course.modules && course.modules.length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                  Course Content
                </h2>
                <div className='space-y-4'>
                  {course.modules.map((module, moduleIndex) => (
                    <div
                      key={module.id}
                      className='border border-gray-200 rounded-lg'>
                      <div className='p-4 bg-gray-50 border-b border-gray-200'>
                        <h3 className='font-semibold text-gray-900'>
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        <p className='text-sm text-gray-600 mt-1'>
                          {module.lessons.length} lessons
                        </p>
                      </div>
                      <div className='divide-y divide-gray-100'>
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className='p-4 flex items-center justify-between'>
                            <div className='flex items-center'>
                              <PlayCircle className='h-4 w-4 text-gray-400 mr-3' />
                              <span className='text-gray-900'>
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                            </div>
                            {lesson.duration && (
                              <span className='text-sm text-gray-500'>
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm p-6 sticky top-8'>
              <div className='text-center mb-6'>
                <div className='text-3xl font-bold text-gray-900 mb-2'>
                  {course.price > 0 ? `$${course.price}` : "Free"}
                </div>
                <div className='text-sm text-gray-600'>
                  Full lifetime access
                </div>
              </div>

              {canAccessCourse ? (
                <Link
                  href={`/courses/${course.id}/learn`}
                  className='block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center mb-4'>
                  {isEnrolled ? "Continue Learning" : "Start Learning"}
                </Link>
              ) : (
                <PaymentButton
                  courseId={course.id}
                  courseTitle={course.title}
                  price={course.price}
                  className='mb-4'
                />
              )}

              {/* Course Features */}
              <div className='border-t border-gray-200 pt-6'>
                <h3 className='font-semibold text-gray-900 mb-4'>
                  This course includes:
                </h3>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 text-gray-400 mr-3' />
                    {formatDuration(totalDuration)} on-demand video
                  </div>
                  <div className='flex items-center'>
                    <BookOpen className='h-4 w-4 text-gray-400 mr-3' />
                    {totalLessons} lessons
                  </div>
                  <div className='flex items-center'>
                    <Award className='h-4 w-4 text-gray-400 mr-3' />
                    Certificate of completion
                  </div>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 text-gray-400 mr-3' />
                    Access to instructor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
