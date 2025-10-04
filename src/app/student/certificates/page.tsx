"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Award,
  Download,
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";

interface Certificate {
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  completionDate: string;
  totalLessons: number;
  completedLessons: number;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/certificates");
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = (certificate: Certificate) => {
    // Create a simple certificate layout
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner border
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Title
    ctx.fillStyle = "#1e40af";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Certificate of Completion", canvas.width / 2, 120);

    // Subtitle
    ctx.fillStyle = "#64748b";
    ctx.font = "24px Arial";
    ctx.fillText("This certifies that", canvas.width / 2, 180);

    // Student name
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 36px Arial";
    ctx.fillText(certificate.studentName, canvas.width / 2, 240);

    // Course completion text
    ctx.fillStyle = "#64748b";
    ctx.font = "24px Arial";
    ctx.fillText(
      "has successfully completed the course",
      canvas.width / 2,
      300
    );

    // Course title
    ctx.fillStyle = "#1e40af";
    ctx.font = "bold 32px Arial";
    ctx.fillText(certificate.courseTitle, canvas.width / 2, 360);

    // Date and instructor
    ctx.fillStyle = "#64748b";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Completion Date: ${certificate.completionDate}`, 80, 480);
    ctx.fillText(`Instructor: ${certificate.instructorName}`, 80, 510);

    // Academy logo (text)
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("The Academy", canvas.width - 80, 480);

    // Download the certificate
    const link = document.createElement("a");
    link.download = `${certificate.courseTitle}_Certificate.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center'>
            <button
              onClick={() => router.push("/student")}
              className='flex items-center text-blue-600 hover:text-blue-700 mr-4'>
              <ArrowLeft className='h-5 w-5 mr-2' />
              Back to Dashboard
            </button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                My Certificates
              </h1>
              <p className='text-gray-600'>
                Download and share your course completion certificates
              </p>
            </div>
          </div>
          <div className='flex items-center'>
            <Award className='h-8 w-8 text-yellow-500 mr-2' />
            <span className='text-lg font-semibold text-gray-900'>
              {certificates.length} Certificate
              {certificates.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
            <Award className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              No Certificates Yet
            </h3>
            <p className='text-gray-600 mb-6'>
              Complete courses to earn certificates that you can download and
              share.
            </p>
            <button
              onClick={() => router.push("/courses")}
              className='bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium'>
              Browse Courses
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {certificates.map((certificate) => (
              <div
                key={certificate.courseId}
                className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                {/* Certificate Preview */}
                <div className='h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center border-b'>
                  <div className='text-center'>
                    <Award className='h-12 w-12 text-blue-600 mx-auto mb-2' />
                    <h3 className='text-lg font-bold text-blue-900'>
                      Certificate of Completion
                    </h3>
                    <p className='text-blue-600 text-sm mt-1'>The Academy</p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className='p-6'>
                  <h4 className='font-semibold text-gray-900 mb-3 line-clamp-2'>
                    {certificate.courseTitle}
                  </h4>

                  <div className='space-y-2 text-sm text-gray-600 mb-4'>
                    <div className='flex items-center'>
                      <User className='h-4 w-4 mr-2' />
                      <span>Student: {certificate.studentName}</span>
                    </div>
                    <div className='flex items-center'>
                      <Calendar className='h-4 w-4 mr-2' />
                      <span>Completed: {certificate.completionDate}</span>
                    </div>
                    <div className='flex items-center'>
                      <BookOpen className='h-4 w-4 mr-2' />
                      <span>
                        Lessons: {certificate.completedLessons}/
                        {certificate.totalLessons}
                      </span>
                    </div>
                  </div>

                  <div className='flex space-x-2'>
                    <button
                      onClick={() => generateCertificate(certificate)}
                      className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium'>
                      <Download className='h-4 w-4 mr-2' />
                      Download
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/courses/${certificate.courseId}`)
                      }
                      className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700'>
                      View Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className='mt-12 bg-white rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            About Your Certificates
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>
                Certificate Requirements
              </h4>
              <ul className='list-disc list-inside space-y-1'>
                <li>Complete 100% of course lessons</li>
                <li>Be enrolled as a student</li>
                <li>Course must be published by instructor</li>
              </ul>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>
                Share Your Achievement
              </h4>
              <ul className='list-disc list-inside space-y-1'>
                <li>Download high-quality PNG certificates</li>
                <li>Share on LinkedIn, social media</li>
                <li>Add to your professional portfolio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
