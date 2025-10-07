"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useBranding,
  useBrandingClasses,
  useBrandingStyles,
} from "@/hooks/useBranding";
import type {
  LandingPageContent,
  LandingPageFeature,
} from "@/lib/landing-page";

interface HomeContentProps {
  content: LandingPageContent;
  features: LandingPageFeature[];
}

export function HomeContent({ content, features }: HomeContentProps) {
  const { theme } = useBranding();
  const brandingStyles = useBrandingStyles();
  const brandingClasses = useBrandingClasses();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      {/* Navigation Header */}
      <nav className='bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              {theme.assets.logo ? (
                <Image
                  src={theme.assets.logo}
                  alt={theme.identity.siteName}
                  width={120}
                  height={40}
                  className='h-10 object-contain'
                />
              ) : (
                <>
                  <div
                    className='w-10 h-10 rounded-lg flex items-center justify-center'
                    style={brandingStyles.gradient}>
                    <span className='text-white font-bold text-lg'>
                      {theme.identity.siteName
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </span>
                  </div>
                  <span className='text-xl font-bold text-gray-900'>
                    {theme.identity.siteName}
                  </span>
                </>
              )}
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                href='/courses'
                className='text-gray-600 hover:text-gray-900 font-medium transition-colors'>
                Courses
              </Link>
              <Link
                href='/about'
                className='text-gray-600 hover:text-gray-900 font-medium transition-colors'>
                About
              </Link>
              <Link
                href='/auth/signin'
                className='text-gray-600 hover:text-gray-900 font-medium transition-colors'>
                Sign In
              </Link>
              <Link
                href='/auth/signin'
                className={`${brandingClasses.btnPrimary} px-4 py-2 rounded-lg transition-colors font-medium`}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className='relative h-[80vh] py-20 overflow-hidden flex justify-center align-center'
        style={{
          ...(theme.assets.heroBackground && {
            backgroundImage: `url(${theme.assets.heroBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }),
        }}>
        <div
          className='absolute inset-0'
          style={{
            background: theme.assets.heroBackground
              ? `linear-gradient(135deg, ${theme.colors.primary}40, ${theme.colors.secondary}40)`
              : `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10)`,
          }}></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full'>
          <div className='text-center'>
            <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
              {content.heroTitle}
            </h1>
            <p className='text-xl text-gray-600 mb-10 max-w-3xl mx-auto'>
              {content.heroSubtitle}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/courses'
                className={`${brandingClasses.btnPrimary} px-8 py-4 rounded-lg text-lg font-semibold transition-colors`}>
                {content.heroCtaPrimary}
              </Link>
              <Link
                href='/demo'
                className={`${brandingClasses.btnOutlinePrimary} px-8 py-4 rounded-lg text-lg font-semibold transition-colors`}>
                {content.heroCtaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div
                className={`text-3xl font-bold ${brandingClasses.textPrimary}`}>
                {content.studentsCount}
              </div>
              <div className='text-gray-600'>Students</div>
            </div>
            <div className='text-center'>
              <div
                className={`text-3xl font-bold ${brandingClasses.textPrimary}`}>
                {content.coursesCount}
              </div>
              <div className='text-gray-600'>Courses</div>
            </div>
            <div className='text-center'>
              <div
                className={`text-3xl font-bold ${brandingClasses.textPrimary}`}>
                {content.instructorsCount}
              </div>
              <div className='text-gray-600'>Instructors</div>
            </div>
            <div className='text-center'>
              <div
                className={`text-3xl font-bold ${brandingClasses.textPrimary}`}>
                {content.completionRate}
              </div>
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
              {content.featuresTitle}
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              {content.featuresSubtitle}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow border'
                style={{
                  borderColor:
                    index % 2 === 0
                      ? theme.colors.primary + "30"
                      : theme.colors.secondary + "30",
                }}>
                <div
                  className='w-12 h-12 rounded-lg flex items-center justify-center mb-6'
                  style={
                    index % 2 === 0
                      ? brandingStyles.primary
                      : brandingStyles.secondary
                  }>
                  <span className='text-white text-2xl'>{feature.icon}</span>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  {feature.title}
                </h3>
                <p className='text-gray-700 mb-6'>{feature.description}</p>
                <ul className='space-y-2'>
                  {Array.isArray(feature.features) &&
                    feature.features.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className='flex items-center text-gray-700'>
                        <div
                          className='w-2 h-2 rounded-full mr-3'
                          style={{
                            backgroundColor:
                              index % 2 === 0
                                ? theme.colors.primary
                                : theme.colors.secondary,
                          }}></div>
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className='py-20 bg-gradient-to-r from-gray-50 to-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              {content.demoTitle}
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              {content.demoSubtitle}
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-200'>
              <div className='flex items-center mb-6'>
                <div
                  className='w-12 h-12 rounded-lg flex items-center justify-center mr-4'
                  style={brandingStyles.primary}>
                  <span className='text-white text-xl'>👨‍🏫</span>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Instructor Account
                  </h3>
                  <p className='text-gray-600'>Full course creation access</p>
                </div>
              </div>
              <div className='space-y-3 mb-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Email:</span>
                  <span className='font-mono'>instructor@example.com</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Password:</span>
                  <span className='font-mono'>instructor123</span>
                </div>
              </div>
              <Link
                href='/auth/signin'
                className={`w-full ${brandingClasses.btnPrimary} px-6 py-3 rounded-lg font-semibold transition-colors block text-center`}>
                Try Instructor Demo
              </Link>
            </div>

            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-200'>
              <div className='flex items-center mb-6'>
                <div
                  className='w-12 h-12 rounded-lg flex items-center justify-center mr-4'
                  style={brandingStyles.secondary}>
                  <span className='text-white text-xl'>👨‍🎓</span>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Student Account
                  </h3>
                  <p className='text-gray-600'>
                    Course enrollment and learning
                  </p>
                </div>
              </div>
              <div className='space-y-3 mb-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Email:</span>
                  <span className='font-mono'>student@example.com</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Password:</span>
                  <span className='font-mono'>student123</span>
                </div>
              </div>
              <Link
                href='/auth/signin'
                className={`w-full ${brandingClasses.btnSecondary} px-6 py-3 rounded-lg font-semibold transition-colors block text-center`}>
                Try Student Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div className='md:col-span-2'>
              <div className='flex items-center space-x-3 mb-6'>
                {theme.assets.logo ? (
                  <Image
                    src={theme.assets.logo}
                    alt={theme.identity.siteName}
                    width={120}
                    height={40}
                    className='h-10 object-contain'
                  />
                ) : (
                  <>
                    <div
                      className='w-10 h-10 rounded-lg flex items-center justify-center'
                      style={brandingStyles.gradient}>
                      <span className='text-white font-bold text-lg'>
                        {theme.identity.siteName
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </span>
                    </div>
                    <span className='text-xl font-bold'>
                      {theme.identity.siteName}
                    </span>
                  </>
                )}
              </div>
              <p className='text-gray-400 mb-6 max-w-md'>
                {content.footerDescription}
              </p>
              <div className='flex space-x-4'>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Twitter
                </Link>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'>
                  LinkedIn
                </Link>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'>
                  GitHub
                </Link>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'>
                  YouTube
                </Link>
              </div>
            </div>
            <div>
              <h4 className='text-lg font-semibold mb-4'>Product</h4>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/courses'
                    className='text-gray-400 hover:text-white transition-colors'>
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    href='/pricing'
                    className='text-gray-400 hover:text-white transition-colors'>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href='/features'
                    className='text-gray-400 hover:text-white transition-colors'>
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-lg font-semibold mb-4'>Company</h4>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/about'
                    className='text-gray-400 hover:text-white transition-colors'>
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href='/contact'
                    className='text-gray-400 hover:text-white transition-colors'>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href='/privacy'
                    className='text-gray-400 hover:text-white transition-colors'>
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href='/terms'
                    className='text-gray-400 hover:text-white transition-colors'>
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-12 pt-8 text-center'>
            <p className='text-gray-400'>
              © 2024 {theme.identity.siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
