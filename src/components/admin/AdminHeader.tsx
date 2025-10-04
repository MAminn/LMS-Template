"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, User, LogOut } from "lucide-react";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Search Bar */}
        <div className='flex-1 max-w-md'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder='Search...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Right Side */}
        <div className='flex items-center space-x-4'>
          {/* Notifications */}
          <button className='p-2 text-gray-400 hover:text-gray-600 relative'>
            <Bell size={20} />
            <span className='absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full'></span>
          </button>

          {/* User Menu */}
          <div className='flex items-center space-x-3'>
            <div className='text-right'>
              <p className='text-sm font-medium text-gray-900'>
                {session?.user?.name || "Admin User"}
              </p>
              <p className='text-xs text-gray-500'>Administrator</p>
            </div>

            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                <User size={16} className='text-white' />
              </div>

              <button
                onClick={() => signOut()}
                className='p-2 text-gray-400 hover:text-gray-600'
                title='Sign Out'>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
