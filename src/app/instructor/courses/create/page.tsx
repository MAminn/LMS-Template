"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Upload,
  DollarSign,
} from "lucide-react";
import Image from "next/image";

interface CourseData {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isPublished: boolean;
}

export default function CreateCoursePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    isPublished: false,
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/course-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCourseData({ ...courseData, thumbnail: data.url });
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || "Failed to upload image");
      }
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Validation functions
  const validateField = (field: string, value: string | number) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case "title":
        if (!value || (value as string).trim().length < 3) {
          errors.title = "Course title must be at least 3 characters long";
        } else if ((value as string).length > 100) {
          errors.title = "Course title must be less than 100 characters";
        }
        break;
      case "description":
        if (!value || (value as string).trim().length < 20) {
          errors.description =
            "Course description must be at least 20 characters long";
        } else if ((value as string).length > 1000) {
          errors.description =
            "Course description must be less than 1000 characters";
        }
        break;
      case "price":
        if (typeof value === "number" && value < 0) {
          errors.price = "Price cannot be negative";
        } else if (typeof value === "number" && value > 1000) {
          errors.price = "Price cannot exceed $1000";
        }
        break;
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          courseData.title.trim().length >= 3 &&
          courseData.description.trim().length >= 20 &&
          !validationErrors.title &&
          !validationErrors.description
        );
      case 2:
        return (
          courseData.price >= 0 &&
          courseData.price <= 1000 &&
          !validationErrors.price
        );
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await handleFileUpload(file);
    } else {
      setUploadError("Please drop a valid image file");
    }
  };

  const steps = [
    { id: 1, name: "Basic Info", description: "Course title and description" },
    { id: 2, name: "Content", description: "Course thumbnail and materials" },
    {
      id: 3,
      name: "Pricing",
      description: "Set course price and availability",
    },
    { id: 4, name: "Review", description: "Review and publish" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          isPublished: false,
        }),
      });

      if (response.ok) {
        // Redirect to course management with success message
        router.push("/instructor/courses?created=draft");
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || "Failed to save course");
      }
    } catch {
      setSubmitError("Failed to save course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          isPublished: true,
        }),
      });

      if (response.ok) {
        // Redirect to course management with success message
        router.push("/instructor/courses?created=published");
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || "Failed to publish course");
      }
    } catch {
      setSubmitError("Failed to publish course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Title *
              </label>
              <input
                type='text'
                value={courseData.title}
                onChange={(e) =>
                  setCourseData({ ...courseData, title: e.target.value })
                }
                className='w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your course title'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Description *
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) =>
                  setCourseData({ ...courseData, description: e.target.value })
                }
                rows={6}
                className='w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Describe what students will learn in this course...'
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Thumbnail
              </label>
              <div
                className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors'
                onDragOver={handleDragOver}
                onDrop={handleDrop}>
                {courseData.thumbnail ? (
                  <div className='relative w-full h-48 mb-4'>
                    <Image
                      src={courseData.thumbnail}
                      alt='Course thumbnail'
                      fill
                      className='object-cover rounded-lg'
                    />
                    <button
                      onClick={() =>
                        setCourseData({ ...courseData, thumbnail: "" })
                      }
                      className='absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700'>
                      ×
                    </button>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <Upload
                      className={`mx-auto h-12 w-12 ${
                        isUploading
                          ? "text-blue-500 animate-pulse"
                          : "text-gray-400"
                      }`}
                    />
                    <div className='text-sm text-gray-600'>
                      <label className='font-medium text-blue-600 hover:text-blue-500 cursor-pointer'>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={handleFileInputChange}
                          className='hidden'
                          disabled={isUploading}
                        />
                        {isUploading ? "Uploading..." : "Click to upload"}
                      </label>{" "}
                      or drag and drop
                    </div>
                    <p className='text-xs text-gray-500'>
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className='mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2'>
                  {uploadError}
                </div>
              )}

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Or enter image URL
                </label>
                <input
                  type='url'
                  value={courseData.thumbnail}
                  onChange={(e) =>
                    setCourseData({ ...courseData, thumbnail: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='https://example.com/image.jpg'
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Price (USD)
              </label>
              <div className='relative'>
                <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='number'
                  value={courseData.price}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='0.00'
                  min='0'
                  step='0.01'
                />
              </div>
              <p className='mt-1 text-sm text-gray-500'>
                Set to $0 to make this course free
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='bg-gray-50 rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Course Review
              </h3>
              <dl className='space-y-3'>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Title</dt>
                  <dd className='text-sm text-gray-900'>{courseData.title}</dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Description
                  </dt>
                  <dd className='text-sm text-gray-900'>
                    {courseData.description}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Price</dt>
                  <dd className='text-sm text-gray-900'>
                    {courseData.price === 0 ? "Free" : `$${courseData.price}`}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Instructor
                  </dt>
                  <dd className='text-sm text-gray-900'>
                    {session?.user?.name}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <button
          onClick={() => router.back()}
          className='flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4'>
          <ArrowLeft className='h-4 w-4 mr-1' />
          Back to Courses
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>Create New Course</h1>
        <p className='text-gray-600 mt-1'>
          Build and publish your course to start teaching students
        </p>
      </div>

      {/* Progress Steps */}
      <div className='mb-8'>
        <nav aria-label='Progress'>
          <ol className='flex items-center'>
            {steps.map((step, stepIdx) => (
              <li
                key={step.id}
                className={`relative ${
                  stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                }`}>
                <div className='flex items-center'>
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      step.id === currentStep
                        ? "bg-blue-600 text-white"
                        : step.id < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-500"
                    }`}>
                    <span className='text-sm font-medium'>{step.id}</span>
                  </div>
                  <div className='ml-4 min-w-0'>
                    <p
                      className={`text-sm font-medium ${
                        step.id <= currentStep
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}>
                      {step.name}
                    </p>
                    <p className='text-sm text-gray-500'>{step.description}</p>
                  </div>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-8 sm:w-20 ${
                      step.id < currentStep ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className='bg-white rounded-lg shadow p-6 mb-8'>
        {submitError && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
            {submitError}
          </div>
        )}
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className='flex justify-between'>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Previous
        </button>

        <div className='flex space-x-3'>
          <button
            onClick={handleSaveDraft}
            disabled={isLoading || !courseData.title || !courseData.description}
            className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50'>
            <Save className='h-4 w-4 mr-2' />
            Save Draft
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={
                currentStep === 1 &&
                (!courseData.title || !courseData.description)
              }
              className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50'>
              Next
              <ArrowRight className='h-4 w-4 ml-2' />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={
                isLoading || !courseData.title || !courseData.description
              }
              className='flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50'>
              <Eye className='h-4 w-4 mr-2' />
              {isLoading ? "Publishing..." : "Publish Course"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
