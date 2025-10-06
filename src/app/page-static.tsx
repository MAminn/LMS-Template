import Link from "next/link";

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      {/* Navigation Header */}
      <nav className='bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>TA</span>
              </div>
              <span className='text-xl font-bold text-gray-900'>
                The Academy
              </span>
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                href='/courses'
                className='text-gray-600 hover:text-gray-900 font-medium transition-colors'>
                Courses
              </Link>
              <Link
                href='/auth/signin'
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <div className='mb-8'>
            <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
              Build Your{" "}
              <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Learning Empire
              </span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
              Complete Learning Management System with no-code customization,
              advanced analytics, and seamless content delivery. Perfect for
              educators, businesses, and training organizations.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/courses'
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
                Explore Courses
              </Link>
              <Link
                href='/auth/signin'
                className='bg-white text-gray-900 px-8 py-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors font-semibold text-lg'>
                Start Learning
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-gray-900'>1000+</div>
              <div className='text-gray-600'>Students</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-gray-900'>50+</div>
              <div className='text-gray-600'>Courses</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-gray-900'>25+</div>
              <div className='text-gray-600'>Instructors</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-gray-900'>95%</div>
              <div className='text-gray-600'>Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Everything You Need to Succeed
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              From course creation to student management, we provide all the
              tools you need to build and scale your educational platform.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Video Learning */}
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
                <span className='text-white text-2xl'>🎥</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Video Learning
              </h3>
              <p className='text-gray-600 mb-4'>
                Support for YouTube, Vimeo, and custom video content with
                interactive lessons and progress tracking.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• HD video streaming</li>
                <li>• Progress bookmarks</li>
                <li>• Mobile responsive player</li>
              </ul>
            </div>

            {/* Progress Tracking */}
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6'>
                <span className='text-white text-2xl'>📊</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Progress Analytics
              </h3>
              <p className='text-gray-600 mb-4'>
                Real-time progress tracking with detailed analytics and
                completion certificates.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Real-time progress</li>
                <li>• Completion certificates</li>
                <li>• Performance insights</li>
              </ul>
            </div>

            {/* No-Code Customization */}
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6'>
                <span className='text-white text-2xl'>🎨</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                No-Code Design
              </h3>
              <p className='text-gray-600 mb-4'>
                Complete branding control with drag-and-drop customization
                tools.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Custom branding</li>
                <li>• Drag & drop builder</li>
                <li>• Theme templates</li>
              </ul>
            </div>

            {/* Multi-Role System */}
            <div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6'>
                <span className='text-white text-2xl'>👥</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Role Management
              </h3>
              <p className='text-gray-600 mb-4'>
                Comprehensive user management with student, instructor, and
                admin roles.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Role-based access</li>
                <li>• Permission controls</li>
                <li>• User dashboards</li>
              </ul>
            </div>

            {/* Content Management */}
            <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6'>
                <span className='text-white text-2xl'>📚</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Content Library
              </h3>
              <p className='text-gray-600 mb-4'>
                Organize courses with modules, lessons, and rich multimedia
                content.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Structured modules</li>
                <li>• Rich media support</li>
                <li>• Content scheduling</li>
              </ul>
            </div>

            {/* Mobile Ready */}
            <div className='bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-6'>
                <span className='text-white text-2xl'>📱</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Mobile Ready
              </h3>
              <p className='text-gray-600 mb-4'>
                Fully responsive design that works perfectly on all devices.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Mobile optimized</li>
                <li>• Touch friendly</li>
                <li>• Offline support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Try The Academy Today
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Experience the full power of our learning management system with
              these demo accounts.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
            {/* Student Demo */}
            <div className='bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow'>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>🎓</span>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Student Experience
                </h3>
                <p className='text-gray-600 text-sm'>
                  Explore courses, track progress, and earn certificates
                </p>
              </div>
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <div className='text-sm text-gray-600 mb-2'>
                  Demo Credentials:
                </div>
                <div className='font-mono text-sm'>
                  <div>📧 student@academy.com</div>
                  <div>🔑 student123</div>
                </div>
              </div>
              <Link
                href='/auth/signin'
                className='w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block'>
                Try Student Portal
              </Link>
            </div>

            {/* Instructor Demo */}
            <div className='bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow'>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>👨‍🏫</span>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Instructor Tools
                </h3>
                <p className='text-gray-600 text-sm'>
                  Create courses, manage content, and track student progress
                </p>
              </div>
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <div className='text-sm text-gray-600 mb-2'>
                  Demo Credentials:
                </div>
                <div className='font-mono text-sm'>
                  <div>📧 instructor@academy.com</div>
                  <div>🔑 instructor123</div>
                </div>
              </div>
              <Link
                href='/auth/signin'
                className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block'>
                Try Instructor Tools
              </Link>
            </div>

            {/* Admin Demo */}
            <div className='bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow'>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>⚙️</span>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Admin Dashboard
                </h3>
                <p className='text-gray-600 text-sm'>
                  Complete platform control with analytics and customization
                </p>
              </div>
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <div className='text-sm text-gray-600 mb-2'>
                  Demo Credentials:
                </div>
                <div className='font-mono text-sm'>
                  <div>📧 admin@academy.com</div>
                  <div>🔑 admin123</div>
                </div>
              </div>
              <Link
                href='/auth/signin'
                className='w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-center block'>
                Try Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='col-span-1 md:col-span-2'>
              <div className='flex items-center space-x-3 mb-6'>
                <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-lg'>TA</span>
                </div>
                <span className='text-xl font-bold'>The Academy</span>
              </div>
              <p className='text-gray-400 mb-6 max-w-md'>
                Empowering educators and learners with cutting-edge technology.
                Build, customize, and scale your learning platform with ease.
              </p>
              <div className='flex space-x-4'>
                <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer'>
                  <span className='text-gray-400'>📧</span>
                </div>
                <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer'>
                  <span className='text-gray-400'>🐦</span>
                </div>
                <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer'>
                  <span className='text-gray-400'>💼</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Platform</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link
                    href='/courses'
                    className='hover:text-white transition-colors'>
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    href='/auth/signin'
                    className='hover:text-white transition-colors'>
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href='/auth/signin'
                    className='hover:text-white transition-colors'>
                    Instructor Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href='/auth/signin'
                    className='hover:text-white transition-colors'>
                    Admin Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Features</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>Video Learning</li>
                <li>Progress Tracking</li>
                <li>Certificates</li>
                <li>No-Code Design</li>
              </ul>
            </div>
          </div>

          <div className='border-t border-gray-800 mt-12 pt-8 text-center text-gray-400'>
            <p>
              &copy; 2025 The Academy. Built with Next.js, TypeScript, and ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
