"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/enrollments");
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      } else {
        setError("Failed to load your courses. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setError("Something went wrong. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Enrolled Courses",
      value: enrollments.length.toString(),
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Hours Learned",
      value: (enrollments.length * 6.5).toFixed(1),
      icon: Clock,
      color: "bg-green-500",
    },
    {
      title: "Certificates",
      value: "0",
      icon: Award,
      color: "bg-purple-500",
    },
    {
      title: "Progress",
      value: "0%",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Welcome back, {session?.user?.name}!
        </h1>
        <p className='text-gray-600 mt-1'>
          Continue your learning journey and track your progress.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {loading
          ? // Loading skeleton for stats
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className='bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                  <div className='ml-4 flex-1'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-6 bg-gray-200 rounded w-1/2'></div>
                  </div>
                </div>
              </div>
            ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className='bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1'
                  style={{ animationDelay: `${index * 100}ms` }}>
                  <div className='flex items-center'>
                    <div
                      className={`${stat.color} p-3 rounded-lg transition-transform hover:scale-110 duration-200`}>
                      <Icon className='h-6 w-6 text-white' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>
                        {stat.title}
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-6'>My Courses</h2>
        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className='text-center py-12'>
            <BookOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No courses enrolled yet
            </h3>
            <p className='text-gray-600 mb-6'>
              Start your learning journey by enrolling in your first course.
            </p>
            <button
              onClick={() => router.push("/courses")}
              className='bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium'>
              Browse Courses
            </button>
          </div>
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-600'>
              You have {enrollments.length} enrolled courses
            </p>
            <button
              onClick={() => router.push("/courses")}
              className='mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium'>
              View More Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
