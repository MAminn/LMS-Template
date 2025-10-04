import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <AdminHeader />

        {/* Page Content */}
        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
