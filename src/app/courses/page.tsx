"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Users, Star, BookOpen, Filter } from "lucide-react";

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

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/courses?published=true");

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data.courses || data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
      // Set some mock data for demonstration
      setCourses([
        {
          id: "1",
          title: "JavaScript Fundamentals",
          description:
            "Learn the core concepts of JavaScript programming language from scratch.",
          thumbnail: null,
          price: 0,
          isPublished: true,
          instructor: { id: "1", name: "John Doe", email: "john@example.com" },
          enrollmentCount: 156,
        },
        {
          id: "2",
          title: "React Development Mastery",
          description:
            "Master React.js and build modern web applications with hooks and context.",
          thumbnail: null,
          price: 49.99,
          isPublished: true,
          instructor: {
            id: "2",
            name: "Sarah Smith",
            email: "sarah@example.com",
          },
          enrollmentCount: 89,
        },
        {
          id: "3",
          title: "Node.js Backend Development",
          description:
            "Build scalable backend applications with Node.js, Express, and MongoDB.",
          thumbnail: null,
          price: 79.99,
          isPublished: true,
          instructor: {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
          },
          enrollmentCount: 67,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && course.price === 0) ||
      (priceFilter === "paid" && course.price > 0);

    return matchesSearch && matchesPrice;
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center'>
            <div className='inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6'>
              <BookOpen className='h-4 w-4 mr-2' />
              Course Catalog
            </div>
            <h1 className='text-5xl font-bold text-gray-900 mb-6'>
              Discover Amazing Courses
            </h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Explore our comprehensive course catalog and start your learning
              journey today.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6'>
            <div className='relative flex-1 max-w-lg'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
              <input
                type='text'
                placeholder='Search courses, instructors, or topics...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              />
            </div>

            <div className='flex items-center space-x-4'>
              <Filter className='text-gray-400 h-5 w-5' />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className='border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]'>
                <option value='all'>All Courses</option>
                <option value='free'>Free Courses</option>
                <option value='paid'>Paid Courses</option>
              </select>
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
            <span>
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""} found
            </span>
            <span>
              {courses.filter((c) => c.price === 0).length} free courses
              available
            </span>
          </div>
        </div>

        {/* Course Grid */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6'>
            <div className='flex items-center'>
              <svg
                className='w-5 h-5 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='bg-white rounded-lg shadow-sm overflow-hidden animate-pulse'>
                <div className='w-full h-48 bg-gray-200'></div>
                <div className='p-6'>
                  <div className='h-4 bg-gray-200 rounded mb-4'></div>
                  <div className='h-6 bg-gray-200 rounded mb-3'></div>
                  <div className='h-4 bg-gray-200 rounded mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className='text-center py-12'>
            <BookOpen className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              No courses found
            </h3>
            <p className='text-gray-600'>
              Try adjusting your search criteria or browse all courses.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden'
                onClick={() => router.push(`/courses/${course.id}`)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}>
                <div className='relative h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center'>
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      className='object-cover'
                    />
                  ) : (
                    <span className='text-white text-3xl font-bold'>
                      {course.title ? course.title.charAt(0) : "C"}
                    </span>
                  )}
                  <div className='absolute top-4 right-4'>
                    <span className='bg-white/90 text-gray-900 px-2 py-1 rounded-full text-xs font-medium'>
                      Course
                    </span>
                  </div>
                </div>

                <div className='p-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center'>
                      <Star className='h-4 w-4 text-yellow-400 fill-current' />
                      <span className='text-sm text-gray-600 ml-1'>4.8</span>
                    </div>
                    <div className='text-right'>
                      {course.price === 0 ? (
                        <span className='text-lg font-bold text-green-600'>
                          Free
                        </span>
                      ) : (
                        <span className='text-lg font-bold text-gray-900'>
                          ${course.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
                    {course.title}
                  </h3>

                  <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                    {course.description}
                  </p>

                  <div className='flex items-center justify-between text-sm text-gray-500'>
                    <div className='flex items-center'>
                      <Users className='h-4 w-4 mr-1' />
                      {course.enrollmentCount || 0} students
                    </div>
                    <span>
                      by {course.instructor?.name || "Unknown Instructor"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
