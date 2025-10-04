"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Lock, CheckCircle } from "lucide-react";

export default function DevCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<{
    id: string;
    title: string;
    description: string;
    price: number;
  } | null>(null);

  const sessionId = searchParams.get("session_id");
  const courseId = searchParams.get("course");

  useEffect(() => {
    if (courseId) {
      fetch(`/api/courses/${courseId}`)
        .then((res) => res.json())
        .then((data) => setCourseData(data))
        .catch((err) => console.error("Error fetching course:", err));
    }
  }, [courseId]);

  const handleCompletePayment = async () => {
    setLoading(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Mark payment as completed in development mode
      const response = await fetch("/api/payments/dev-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, courseId }),
      });

      if (response.ok) {
        router.push(`/payment/success?session_id=${sessionId}`);
      } else {
        throw new Error("Failed to complete payment");
      }
    } catch (error) {
      console.error("Payment completion error:", error);
      router.push(`/payment/cancel?session_id=${sessionId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/payment/cancel?session_id=${sessionId}`);
  };

  if (!courseData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-md mx-auto'>
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          {/* Header */}
          <div className='bg-blue-600 text-white p-6'>
            <div className='flex items-center justify-center mb-4'>
              <Lock className='h-6 w-6 mr-2' />
              <span className='text-lg font-semibold'>
                Development Checkout
              </span>
            </div>
            <p className='text-blue-100 text-center text-sm'>
              This is a simulated payment for development testing
            </p>
          </div>

          {/* Course Info */}
          <div className='p-6 border-b'>
            <h2 className='text-lg font-semibold text-gray-900 mb-2'>
              {courseData.title}
            </h2>
            <p className='text-gray-600 text-sm mb-4'>
              {courseData.description}
            </p>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Course Price:</span>
              <span className='text-2xl font-bold text-green-600'>
                ${courseData.price}
              </span>
            </div>
          </div>

          {/* Mock Payment Form */}
          <div className='p-6 border-b bg-gray-50'>
            <div className='flex items-center mb-4'>
              <CreditCard className='h-5 w-5 text-gray-400 mr-2' />
              <span className='text-sm text-gray-600'>Mock Payment Method</span>
            </div>
            <div className='space-y-3'>
              <div className='p-3 bg-white border rounded-lg'>
                <div className='text-sm text-gray-600'>Card Number</div>
                <div className='font-mono text-gray-800'>
                  4242 4242 4242 4242
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='p-3 bg-white border rounded-lg'>
                  <div className='text-sm text-gray-600'>Expiry</div>
                  <div className='font-mono text-gray-800'>12/28</div>
                </div>
                <div className='p-3 bg-white border rounded-lg'>
                  <div className='text-sm text-gray-600'>CVC</div>
                  <div className='font-mono text-gray-800'>123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='p-6'>
            <button
              onClick={handleCompletePayment}
              disabled={loading}
              className='w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-3'>
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className='h-5 w-5 mr-2' />
                  Complete Test Payment
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className='w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50'>
              Cancel
            </button>

            <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className='text-xs text-yellow-800'>
                <strong>Development Mode:</strong> This is a simulated checkout
                process. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
