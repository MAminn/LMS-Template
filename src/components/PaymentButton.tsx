"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Lock } from "lucide-react";

interface PaymentButtonProps {
  courseId: string;
  courseTitle: string;
  price: number;
  className?: string;
  disabled?: boolean;
}

export function PaymentButton({
  courseId,
  price,
  className = "",
  disabled = false,
}: PaymentButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (price <= 0) {
      setError("This course is free");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        className={`flex items-center justify-center py-3 px-6 bg-gray-100 rounded-lg ${className}`}>
        <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
      </div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => router.push("/auth/signin")}
        className={`flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold ${className}`}>
        <Lock className='h-5 w-5' />
        <span>Sign In to Purchase</span>
      </button>
    );
  }

  if (price <= 0) {
    return (
      <div
        className={`flex items-center justify-center py-3 px-6 bg-green-100 text-green-800 rounded-lg font-semibold ${className}`}>
        Free Course
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold w-full ${className}`}>
        {loading ? (
          <>
            <Loader2 className='h-5 w-5 animate-spin' />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className='h-5 w-5' />
            <span>Purchase for ${price}</span>
          </>
        )}
      </button>

      {error && (
        <div className='text-red-600 text-sm text-center bg-red-50 p-2 rounded-md'>
          {error}
        </div>
      )}

      <div className='text-xs text-gray-500 text-center'>
        <div className='flex items-center justify-center space-x-1'>
          <Lock className='h-3 w-3' />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}
