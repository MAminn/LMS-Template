"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Clock, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PaymentButton } from "@/components/PaymentButton";

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
  enrollmentCount: number;
}

interface CourseDetailProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailProps) {
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string>("");
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.id);
      await fetchCourse(resolvedParams.id);
      setLoading(false);
    };
    unwrapParams();
  }, [params]);

  const fetchCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) {
        throw new Error("Course not found");
      }
      const courseData = await response.json();
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to load course");
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
            Course Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            {error || "The course you're looking for doesn't exist."}
          </p>
          <Link
            href='/courses'
            className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

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
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-8'>
              <div className='relative h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center'>
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <span className='text-white text-6xl font-bold'>
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className='p-6'>
                <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                  {course.title}
                </h1>

                <div className='flex items-center space-x-6 text-sm text-gray-600 mb-4'>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 mr-1' />
                    {course.enrollmentCount} students
                  </div>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 mr-1' />
                    8h 30m
                  </div>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 mr-1 text-yellow-400 fill-current' />
                    4.8 (324 reviews)
                  </div>
                </div>

                <p className='text-gray-700 leading-relaxed mb-6'>
                  {course.description}
                </p>

                <div className='border-t pt-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Instructor
                  </h3>
                  <p className='text-gray-600'>{course.instructor.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm p-6 sticky top-8'>
              <div className='text-center mb-6'>
                <div className='text-3xl font-bold mb-2'>
                  {course.price > 0 ? (
                    <span className='text-green-600'>${course.price}</span>
                  ) : (
                    <span className='text-green-600'>Free</span>
                  )}
                </div>
                <div className='text-sm text-gray-600'>
                  Full lifetime access
                </div>
              </div>

              {course.price > 0 ? (
                <PaymentButton
                  courseId={course.id}
                  courseName={course.title}
                  price={course.price}
                />
              ) : (
                <Link
                  href={`/courses/${courseId}/learn`}
                  className='block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center'>
                  Start Learning
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
