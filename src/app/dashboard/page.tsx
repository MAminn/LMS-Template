"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    // Redirect based on user role
    const user = session.user as { role: string };
    switch (user.role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "INSTRUCTOR":
        router.push("/instructor");
        break;
      case "STUDENT":
        router.push("/student");
        break;
      default:
        router.push("/auth/signin");
        break;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Redirecting...</p>
      </div>
    </div>
  );
}
