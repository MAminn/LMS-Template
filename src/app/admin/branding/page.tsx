"use client";

import { useState, useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";

interface BrandingSettings {
  id?: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  siteDescription: string;
  faviconUrl?: string;
}

export default function BrandingAdmin() {
  const { theme, refreshBranding } = useBranding();
  const [settings, setSettings] = useState<BrandingSettings>({
    siteName: theme.identity.siteName,
    primaryColor: theme.colors.primary,
    secondaryColor: theme.colors.secondary,
    fontFamily: theme.fonts.primary,
    siteDescription: theme.identity.siteDescription,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/templates/branding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Branding updated successfully!");
        await refreshBranding();
      } else {
        setMessage(`Error: ${result.error || "Failed to update branding"}`);
      }
    } catch (error) {
      setMessage("Network error occurred");
      console.error("Error updating branding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      siteName: "The Academy",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      fontFamily: "Inter",
      siteDescription: "Learn anything, anywhere, anytime",
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow-xl rounded-lg'>
          <div className='px-6 py-8 border-b border-gray-200'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Branding Settings
            </h1>
            <p className='mt-2 text-gray-600'>
              Customize your site&apos;s appearance and branding elements.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='px-6 py-8 space-y-6'>
            {/* Site Identity */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label
                  htmlFor='siteName'
                  className='block text-sm font-medium text-gray-700 mb-2'>
                  Site Name
                </label>
                <input
                  type='text'
                  id='siteName'
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='fontFamily'
                  className='block text-sm font-medium text-gray-700 mb-2'>
                  Font Family
                </label>
                <select
                  id='fontFamily'
                  value={settings.fontFamily}
                  onChange={(e) =>
                    setSettings({ ...settings, fontFamily: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='Inter'>Inter</option>
                  <option value='Roboto'>Roboto</option>
                  <option value='Open Sans'>Open Sans</option>
                  <option value='Lato'>Lato</option>
                  <option value='Poppins'>Poppins</option>
                </select>
              </div>
            </div>

            {/* Site Description */}
            <div>
              <label
                htmlFor='siteDescription'
                className='block text-sm font-medium text-gray-700 mb-2'>
                Site Description
              </label>
              <textarea
                id='siteDescription'
                rows={3}
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Brief description of your site'
              />
            </div>

            {/* Colors */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label
                  htmlFor='primaryColor'
                  className='block text-sm font-medium text-gray-700 mb-2'>
                  Primary Color
                </label>
                <div className='flex items-center space-x-3'>
                  <input
                    type='color'
                    id='primaryColor'
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className='w-12 h-10 border border-gray-300 rounded cursor-pointer'
                  />
                  <input
                    type='text'
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='secondaryColor'
                  className='block text-sm font-medium text-gray-700 mb-2'>
                  Secondary Color
                </label>
                <div className='flex items-center space-x-3'>
                  <input
                    type='color'
                    id='secondaryColor'
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className='w-12 h-10 border border-gray-300 rounded cursor-pointer'
                  />
                  <input
                    type='text'
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Color Preview
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div
                    className='w-16 h-16 rounded-lg mx-auto mb-2'
                    style={{ backgroundColor: settings.primaryColor }}></div>
                  <p className='text-sm text-gray-600'>Primary</p>
                </div>
                <div className='text-center'>
                  <div
                    className='w-16 h-16 rounded-lg mx-auto mb-2'
                    style={{ backgroundColor: settings.secondaryColor }}></div>
                  <p className='text-sm text-gray-600'>Secondary</p>
                </div>
                <div className='text-center'>
                  <div
                    className='w-16 h-16 rounded-lg mx-auto mb-2'
                    style={{
                      background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                    }}></div>
                  <p className='text-sm text-gray-600'>Gradient</p>
                </div>
                <div className='text-center'>
                  <div
                    className='w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold'
                    style={{ backgroundColor: settings.primaryColor }}>
                    {settings.siteName
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>
                  <p className='text-sm text-gray-600'>Logo</p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}>
                {message}
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-between pt-6 border-t'>
              <button
                type='button'
                onClick={handleReset}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'>
                Reset to Defaults
              </button>
              <div className='space-x-3'>
                <button
                  type='button'
                  onClick={() => (window.location.href = "/")}
                  className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'>
                  View Site
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors'>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
