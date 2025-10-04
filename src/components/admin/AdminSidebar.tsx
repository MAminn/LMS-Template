"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Palette,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    name: "Template Manager",
    icon: Palette,
    href: "/admin/templates",
    subItems: [
      { name: "Branding", href: "/admin/templates/branding" },
      { name: "Page Builder", href: "/admin/templates/pages" },
      { name: "Email Templates", href: "/admin/templates/emails" },
      { name: "Banners", href: "/admin/templates/banners" },
    ],
  },
  {
    name: "Course Management",
    icon: BookOpen,
    href: "/admin/courses",
    subItems: [
      { name: "All Courses", href: "/admin/courses" },
      { name: "Categories", href: "/admin/courses/categories" },
      { name: "Reviews", href: "/admin/courses/reviews" },
    ],
  },
  {
    name: "User Management",
    icon: Users,
    href: "/admin/users",
    subItems: [
      { name: "All Users", href: "/admin/users" },
      { name: "Instructors", href: "/admin/users/instructors" },
      { name: "Students", href: "/admin/users/students" },
    ],
  },
  {
    name: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    subItems: [
      { name: "Overview", href: "/admin/analytics" },
      { name: "Revenue", href: "/admin/analytics/revenue" },
      { name: "Engagement", href: "/admin/analytics/engagement" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(
    "Template Manager"
  );
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-700'>
        {!isCollapsed && <h1 className='text-xl font-bold'>The Academy</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-1 rounded hover:bg-gray-700'>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className='mt-4'>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const isExpanded = expandedItem === item.name;

          return (
            <div key={item.name}>
              {/* Main Item */}
              <div
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer ${
                  isActive ? "bg-blue-600" : ""
                }`}
                onClick={() => item.subItems && toggleExpanded(item.name)}>
                <Link
                  href={item.href}
                  className='flex items-center space-x-3 flex-1'>
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </div>

              {/* Sub Items */}
              {item.subItems && isExpanded && !isCollapsed && (
                <div className='bg-gray-800'>
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`block px-12 py-2 text-sm hover:bg-gray-700 ${
                        pathname === subItem.href ? "bg-blue-600" : ""
                      }`}>
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
