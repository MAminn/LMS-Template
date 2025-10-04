"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  BookOpen,
} from "lucide-react";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isPublished: boolean;
  createdAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  enrollmentCount: number;
}

export default function InstructorCoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "name" | "enrollments"
  >("newest");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for success messages from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const created = urlParams.get("created");

    if (created === "published") {
      setSuccessMessage("Course published successfully!");
      // Clear the URL parameter
      window.history.replaceState({}, "", window.location.pathname);
    } else if (created === "draft") {
      setSuccessMessage("Course saved as draft successfully!");
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Auto-hide success message after 5 seconds
    if (created) {
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const user = session?.user as { id: string };
      if (!user?.id) return;

      const params = new URLSearchParams({
        instructorId: user.id,
      });

      if (filterStatus !== "all") {
        params.append(
          "published",
          filterStatus === "published" ? "true" : "false"
        );
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/courses?${params}`, {
        credentials: "include", // Include cookies for authentication
      });
      if (response.ok) {
        const data = await response.json();
        // Handle the new API response structure { courses, total }
        setCourses(data.courses || data);
      } else {
        console.error("Failed to fetch courses:", response.status);
        setError("Failed to load courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, searchTerm, filterStatus]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((course) => course.id !== courseId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const togglePublishStatus = async (
    courseId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchCourses(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "published")
      return matchesSearch && course.isPublished;
    if (filterStatus === "draft") return matchesSearch && !course.isPublished;

    return matchesSearch;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.isPublished).length,
    draft: courses.filter((c) => !c.isPublished).length,
    totalStudents: courses.reduce(
      (sum, course) => sum + course.enrollmentCount,
      0
    ),
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-64'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Success Message */}
      {successMessage && (
        <div className='mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between'>
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            className='text-green-500 hover:text-green-700'>
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className='sm:flex sm:items-center sm:justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Courses</h1>
          <p className='mt-2 text-sm text-gray-700'>
            Manage your courses, track student enrollment, and monitor
            performance.
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
            <Plus className='h-4 w-4 mr-2' />
            Create Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-blue-100'>
              <BookOpen className='h-6 w-6 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Courses</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-green-100'>
              <Eye className='h-6 w-6 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Published</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats.published}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-yellow-100'>
              <Edit className='h-6 w-6 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Drafts</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats.draft}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-purple-100'>
              <Users className='h-6 w-6 text-purple-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Students
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='bg-white rounded-lg shadow mb-6'>
        <div className='p-6 border-b border-gray-200'>
          <div className='sm:flex sm:items-center sm:justify-between'>
            <div className='flex-1 max-w-lg'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search courses...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm'
                />
              </div>
            </div>
            <div className='mt-4 sm:mt-0 sm:ml-4'>
              <div className='flex items-center space-x-2'>
                <Filter className='h-4 w-4 text-gray-400' />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as typeof filterStatus)
                  }
                  className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md'>
                  <option value='all'>All Courses</option>
                  <option value='published'>Published</option>
                  <option value='draft'>Drafts</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className='overflow-hidden'>
          {filteredCourses.length === 0 ? (
            <div className='text-center py-12'>
              <BookOpen className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                No courses found
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {courses.length === 0
                  ? "Get started by creating your first course."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {courses.length === 0 && (
                <div className='mt-6'>
                  <button
                    onClick={() => router.push("/instructor/courses/create")}
                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700'>
                    <Plus className='h-4 w-4 mr-2' />
                    Create Your First Course
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='divide-y divide-gray-200'>
              {filteredCourses.map((course) => (
                <div key={course.id} className='p-6 hover:bg-gray-50'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            width={80}
                            height={60}
                            className='rounded-lg object-cover'
                          />
                        ) : (
                          <div className='w-20 h-15 bg-gray-200 rounded-lg flex items-center justify-center'>
                            <BookOpen className='h-6 w-6 text-gray-400' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2 mb-1'>
                          <h3 className='text-lg font-medium text-gray-900 truncate'>
                            {course.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              course.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 truncate'>
                          {course.description}
                        </p>
                        <div className='mt-2 flex items-center space-x-4 text-sm text-gray-500'>
                          <div className='flex items-center'>
                            <Users className='h-4 w-4 mr-1' />
                            {course.enrollmentCount} students
                          </div>
                          <div className='flex items-center'>
                            <DollarSign className='h-4 w-4 mr-1' />
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </div>
                          <div>
                            Created{" "}
                            {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() =>
                          router.push(`/instructor/courses/${course.id}`)
                        }
                        className='p-2 text-gray-400 hover:text-gray-600'
                        title='View Course'>
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/instructor/courses/${course.id}/content`
                          )
                        }
                        className='p-2 text-purple-400 hover:text-purple-600'
                        title='Manage Content'>
                        <BookOpen className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/instructor/courses/${course.id}/edit`)
                        }
                        className='p-2 text-gray-400 hover:text-gray-600'
                        title='Edit Course'>
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          togglePublishStatus(course.id, course.isPublished)
                        }
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          course.isPublished
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                        title={course.isPublished ? "Unpublish" : "Publish"}>
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(course.id)}
                        className='p-2 text-red-400 hover:text-red-600'
                        title='Delete Course'>
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3 text-center'>
              <h3 className='text-lg font-medium text-gray-900'>
                Delete Course
              </h3>
              <div className='mt-2 px-7 py-3'>
                <p className='text-sm text-gray-500'>
                  Are you sure you want to delete this course? This action
                  cannot be undone. All enrolled students will lose access.
                </p>
              </div>
              <div className='flex justify-center space-x-3 mt-4'>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className='px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400'>
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCourse(deleteConfirm)}
                  className='px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
