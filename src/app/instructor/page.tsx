import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);

  const stats = [
    {
      title: "My Courses",
      value: "4",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Total Students",
      value: "156",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Revenue",
      value: "$2,340",
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      title: "Course Rating",
      value: "4.8",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8 animate-fade-in'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Welcome back, {session?.user.name}! 👋
        </h1>
        <p className='text-gray-600 text-lg'>
          Manage your courses and track your teaching performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`bg-white rounded-lg shadow hover:shadow-lg p-6 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}>
              <div className='flex items-center'>
                <div
                  className={`${stat.color} p-3 rounded-lg transition-transform duration-200 hover:scale-110`}>
                  <Icon className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-semibold text-gray-900 transition-colors duration-200'>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Management */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-medium text-gray-900'>My Courses</h2>
              <Link
                href='/instructor/courses/create'
                className='bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors duration-200 transform hover:scale-105'>
                Create Course
              </Link>
            </div>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200 hover:bg-blue-50'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    JavaScript Fundamentals
                  </h3>
                  <p className='text-sm text-gray-600'>45 students enrolled</p>
                </div>
                <button className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105'>
                  Manage
                </button>
              </div>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200 hover:bg-blue-50'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    React Development
                  </h3>
                  <p className='text-sm text-gray-600'>32 students enrolled</p>
                </div>
                <button className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105'>
                  Manage
                </button>
              </div>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200 hover:bg-blue-50'>
                <div>
                  <h3 className='font-medium text-gray-900'>Node.js Backend</h3>
                  <p className='text-sm text-gray-600'>28 students enrolled</p>
                </div>
                <button className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105'>
                  Manage
                </button>
              </div>
            </div>
            <div className='mt-4 text-center'>
              <Link
                href='/instructor/courses'
                className='text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200'>
                View All Courses →
              </Link>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-medium text-gray-900'>
              Recent Student Activity
            </h2>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                <div className='w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse'></div>
                <div>
                  <p className='text-sm text-gray-900'>
                    Sarah completed &ldquo;Variables and Data Types&rdquo;
                  </p>
                  <p className='text-xs text-gray-500'>2 hours ago</p>
                </div>
              </div>
              <div className='flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                <div>
                  <p className='text-sm text-gray-900'>
                    John enrolled in &ldquo;React Development&rdquo;
                  </p>
                  <p className='text-xs text-gray-500'>4 hours ago</p>
                </div>
              </div>
              <div className='flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                <div className='w-2 h-2 bg-purple-500 rounded-full mt-2'></div>
                <div>
                  <p className='text-sm text-gray-900'>
                    Maria left a 5-star review
                  </p>
                  <p className='text-xs text-gray-500'>1 day ago</p>
                </div>
              </div>
              <div className='flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                <div className='w-2 h-2 bg-orange-500 rounded-full mt-2'></div>
                <div>
                  <p className='text-sm text-gray-900'>
                    Alex asked a question in the forum
                  </p>
                  <p className='text-xs text-gray-500'>2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-medium text-gray-900'>Analytics</h2>
              <Link
                href='/analytics'
                className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105 flex items-center space-x-2'>
                <BarChart3 className='h-4 w-4' />
                <span>View Analytics</span>
              </Link>
            </div>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors duration-200 hover:bg-green-50'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Course Performance
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Average completion: 87%
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-semibold text-green-600'>↗ 12%</p>
                  <p className='text-xs text-gray-500'>vs last month</p>
                </div>
              </div>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200 hover:bg-blue-50'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Student Engagement
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Daily active learners: 42
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-semibold text-blue-600'>↗ 8%</p>
                  <p className='text-xs text-gray-500'>vs last week</p>
                </div>
              </div>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors duration-200 hover:bg-purple-50'>
                <div>
                  <h3 className='font-medium text-gray-900'>Quiz Scores</h3>
                  <p className='text-sm text-gray-600'>Average score: 84%</p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-semibold text-purple-600'>↗ 5%</p>
                  <p className='text-xs text-gray-500'>vs last month</p>
                </div>
              </div>
            </div>
            <div className='mt-4 text-center'>
              <Link
                href='/analytics'
                className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200'>
                View Detailed Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
