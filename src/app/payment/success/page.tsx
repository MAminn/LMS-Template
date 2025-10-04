"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PaymentData {
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    course: {
      id: string;
      title: string;
      description: string;
      thumbnail: string;
    };
  };
  stripeSession: {
    id: string;
    paymentStatus: string;
    customerEmail: string;
  };
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    // Verify payment
    fetch(`/api/payments/verify?session_id=${sessionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPaymentData(data);
        } else {
          setError(data.error || "Payment verification failed");
        }
      })
      .catch((err) => {
        console.error("Error verifying payment:", err);
        setError("Failed to verify payment");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-blue-600 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Verifying Payment...
          </h2>
          <p className='text-gray-600'>
            Please wait while we confirm your purchase.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
          <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Payment Error
          </h1>
          <p className='text-gray-600 mb-6'>{error}</p>
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

  if (!paymentData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900'>
            No Payment Data
          </h2>
          <p className='text-gray-600'>Unable to load payment information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Success Header */}
        <div className='bg-green-600 text-white p-8 text-center'>
          <CheckCircle className='h-16 w-16 mx-auto mb-4' />
          <h1 className='text-3xl font-bold mb-2'>Payment Successful!</h1>
          <p className='text-green-100'>
            Your course purchase has been completed successfully.
          </p>
        </div>

        {/* Payment Details */}
        <div className='p-8'>
          <div className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Purchase Details
            </h2>
            <div className='bg-gray-50 rounded-lg p-6 space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Course:</span>
                <span className='font-semibold'>
                  {paymentData.payment.course.title}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Amount:</span>
                <span className='font-semibold'>
                  ${paymentData.payment.amount.toFixed(2)}{" "}
                  {paymentData.payment.currency.toUpperCase()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Status:</span>
                <span className='font-semibold text-green-600'>
                  {paymentData.payment.status}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Date:</span>
                <span className='font-semibold'>
                  {new Date(paymentData.payment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Your Course
            </h3>
            <div className='border border-gray-200 rounded-lg p-4 flex items-start space-x-4'>
              {paymentData.payment.course.thumbnail && (
                <img
                  src={paymentData.payment.course.thumbnail}
                  alt={paymentData.payment.course.title}
                  className='w-20 h-20 object-cover rounded-lg'
                />
              )}
              <div className='flex-1'>
                <h4 className='font-semibold text-gray-900 mb-2'>
                  {paymentData.payment.course.title}
                </h4>
                <p className='text-gray-600 text-sm'>
                  {paymentData.payment.course.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Link
              href={`/courses/${paymentData.payment.course.id}/learn`}
              className='block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold'>
              Start Learning Now
            </Link>
            <Link
              href='/student'
              className='block w-full bg-gray-200 text-gray-800 text-center py-3 px-4 rounded-md hover:bg-gray-300 transition-colors'>
              Go to Dashboard
            </Link>
          </div>

          {/* Additional Info */}
          <div className='mt-8 text-center text-sm text-gray-500'>
            <p>
              A confirmation email has been sent to{" "}
              <span className='font-semibold'>
                {paymentData.stripeSession.customerEmail}
              </span>
            </p>
            <p className='mt-2'>Payment ID: {paymentData.payment.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
