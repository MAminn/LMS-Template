"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        <XCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Payment Cancelled
        </h1>
        <p className='text-gray-600 mb-6'>
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className='space-y-3'>
          <Link
            href='/courses'
            className='block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'>
            Browse Courses
          </Link>
          <button
            onClick={() => router.back()}
            className='block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors'>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
