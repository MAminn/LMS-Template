"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT" as "STUDENT" | "INSTRUCTOR",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Please sign in.");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>TA</span>
          </div>
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Join The Academy
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Create your account to start learning
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>
                {error}
              </div>
            )}

            {success && (
              <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>
                {success}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'>
                Full Name
              </label>
              <div className='mt-1 relative'>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className='appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Enter your full name'
                />
                <User className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'>
                Email Address
              </label>
              <div className='mt-1 relative'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className='appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Enter your email address'
                />
                <Mail className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Account Type
              </label>
              <div className='mt-2 space-y-2'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='role'
                    value='STUDENT'
                    checked={formData.role === "STUDENT"}
                    onChange={(e) =>
                      handleInputChange("role", e.target.value as "STUDENT")
                    }
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                  />
                  <span className='ml-2 text-sm text-gray-700'>
                    Student - Learn from courses
                  </span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='role'
                    value='INSTRUCTOR'
                    checked={formData.role === "INSTRUCTOR"}
                    onChange={(e) =>
                      handleInputChange("role", e.target.value as "INSTRUCTOR")
                    }
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                  />
                  <span className='ml-2 text-sm text-gray-700'>
                    Instructor - Create and teach courses
                  </span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <div className='mt-1 relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className='appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Create a password'
                />
                <Lock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700'>
                Confirm Password
              </label>
              <div className='mt-1 relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className='appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Confirm your password'
                />
                <Lock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'>
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className='w-4 h-4 mr-2' />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className='mt-6'>
            <div className='text-center'>
              <span className='text-sm text-gray-600'>
                Already have an account?{" "}
                <Link
                  href='/auth/signin'
                  className='font-medium text-blue-600 hover:text-blue-500'>
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
