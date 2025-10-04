import { Palette, Layout, Mail, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

const templateCards = [
  {
    title: "Branding Settings",
    description: "Customize colors, logos, fonts, and overall brand identity",
    icon: Palette,
    href: "/admin/templates/branding",
    color: "bg-blue-500",
    stats: "Active Theme",
  },
  {
    title: "Page Builder",
    description: "Create and customize pages with drag-and-drop editor",
    icon: Layout,
    href: "/admin/templates/pages",
    color: "bg-green-500",
    stats: "12 Pages",
  },
  {
    title: "Email Templates",
    description:
      "Design automated emails for courses, notifications, and marketing",
    icon: Mail,
    href: "/admin/templates/emails",
    color: "bg-purple-500",
    stats: "8 Templates",
  },
  {
    title: "Banner Management",
    description:
      "Manage homepage banners, announcements, and promotional content",
    icon: ImageIcon,
    href: "/admin/templates/banners",
    color: "bg-orange-500",
    stats: "3 Active",
  },
];

export default function TemplateManagerPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Template Manager
        </h1>
        <p className='text-gray-600'>
          Complete control over your platform&apos;s appearance and content
          without coding. Customize everything from branding to page layouts
          with our powerful no-code tools.
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                <Palette className='w-5 h-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>Active Theme</p>
              <p className='text-lg font-semibold text-gray-900'>Default</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                <Layout className='w-5 h-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>Custom Pages</p>
              <p className='text-lg font-semibold text-gray-900'>12</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                <Mail className='w-5 h-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>
                Email Templates
              </p>
              <p className='text-lg font-semibold text-gray-900'>8</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center'>
                <ImageIcon className='w-5 h-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>
                Active Banners
              </p>
              <p className='text-lg font-semibold text-gray-900'>3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {templateCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 group'>
              <div className='flex items-start space-x-4'>
                <div
                  className={`${card.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className='w-6 h-6 text-white' />
                </div>

                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                      {card.title}
                    </h3>
                    <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                      {card.stats}
                    </span>
                  </div>

                  <p className='text-gray-600 text-sm leading-relaxed'>
                    {card.description}
                  </p>

                  <div className='mt-4 flex items-center text-blue-600 text-sm font-medium'>
                    Manage →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className='bg-white rounded-lg shadow'>
        <div className='p-6 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Recent Template Changes
          </h2>
        </div>
        <div className='p-6'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              <span className='text-sm text-gray-600'>
                Updated primary color to #3b82f6
              </span>
              <span className='text-xs text-gray-400'>2 hours ago</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span className='text-sm text-gray-600'>
                Created new welcome email template
              </span>
              <span className='text-xs text-gray-400'>1 day ago</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
              <span className='text-sm text-gray-600'>
                Updated homepage banner content
              </span>
              <span className='text-xs text-gray-400'>3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
