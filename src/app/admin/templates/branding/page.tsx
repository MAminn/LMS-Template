"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Eye, Palette, Type, Layout } from "lucide-react";

interface BrandingSettings {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  siteName?: string;
  siteDescription?: string;
  fontFamily?: string;
  favicon?: string;
}

import Image from "next/image";

export default function BrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings>({
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    siteName: "The Academy",
    siteDescription: "Learn anything, anywhere, anytime",
    fontFamily: "Inter",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  const fetchBrandingSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates/branding");
      const data = await response.json();
      if (data.success && data.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error("Error fetching branding settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/templates/branding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success message
        alert("Branding settings saved successfully!");
      } else {
        alert("Error saving settings");
      }
    } catch (error) {
      console.error("Error saving branding settings:", error);
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof BrandingSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Branding Settings
          </h1>
          <p className='text-gray-600'>
            Customize your platform&apos;s visual identity and branding
          </p>
        </div>
        <div className='flex space-x-3'>
          <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2'>
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2'>
            <Save size={16} />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Settings Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Site Identity */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center space-x-2 mb-4'>
              <Type className='w-5 h-5 text-gray-500' />
              <h2 className='text-lg font-semibold'>Site Identity</h2>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Site Name
                </label>
                <input
                  type='text'
                  value={settings.siteName || ""}
                  onChange={(e) =>
                    handleInputChange("siteName", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='The Academy'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription || ""}
                  onChange={(e) =>
                    handleInputChange("siteDescription", e.target.value)
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Learn anything, anywhere, anytime'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Logo URL
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='text'
                    value={settings.logoUrl || ""}
                    onChange={(e) =>
                      handleInputChange("logoUrl", e.target.value)
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='https://example.com/logo.png'
                  />
                  <button className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center'>
                    <Upload size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center space-x-2 mb-4'>
              <Palette className='w-5 h-5 text-gray-500' />
              <h2 className='text-lg font-semibold'>Color Scheme</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Primary Color
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='color'
                    value={settings.primaryColor}
                    onChange={(e) =>
                      handleInputChange("primaryColor", e.target.value)
                    }
                    className='w-12 h-10 border border-gray-300 rounded-lg'
                  />
                  <input
                    type='text'
                    value={settings.primaryColor}
                    onChange={(e) =>
                      handleInputChange("primaryColor", e.target.value)
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Secondary Color
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='color'
                    value={settings.secondaryColor || "#1e40af"}
                    onChange={(e) =>
                      handleInputChange("secondaryColor", e.target.value)
                    }
                    className='w-12 h-10 border border-gray-300 rounded-lg'
                  />
                  <input
                    type='text'
                    value={settings.secondaryColor || "#1e40af"}
                    onChange={(e) =>
                      handleInputChange("secondaryColor", e.target.value)
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div className='mt-4'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Quick Presets
              </p>
              <div className='flex space-x-2'>
                {[
                  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af" },
                  { name: "Green", primary: "#10b981", secondary: "#059669" },
                  { name: "Purple", primary: "#8b5cf6", secondary: "#7c3aed" },
                  { name: "Red", primary: "#ef4444", secondary: "#dc2626" },
                  { name: "Orange", primary: "#f97316", secondary: "#ea580c" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      handleInputChange("primaryColor", preset.primary);
                      handleInputChange("secondaryColor", preset.secondary);
                    }}
                    className='px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50'
                    style={{ backgroundColor: preset.primary, color: "white" }}>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center space-x-2 mb-4'>
              <Layout className='w-5 h-5 text-gray-500' />
              <h2 className='text-lg font-semibold'>Typography</h2>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Font Family
              </label>
              <select
                value={settings.fontFamily || "Inter"}
                onChange={(e) =>
                  handleInputChange("fontFamily", e.target.value)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value='Inter'>Inter</option>
                <option value='Roboto'>Roboto</option>
                <option value='Open Sans'>Open Sans</option>
                <option value='Poppins'>Poppins</option>
                <option value='Montserrat'>Montserrat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg shadow p-6 sticky top-6'>
            <h3 className='text-lg font-semibold mb-4'>Live Preview</h3>

            {/* Mock Preview */}
            <div
              className='border-2 border-gray-200 rounded-lg overflow-hidden'
              style={{ fontFamily: settings.fontFamily }}>
              {/* Header */}
              <div
                className='p-4 text-white'
                style={{ backgroundColor: settings.primaryColor }}>
                <div className='flex items-center space-x-2'>
                  {settings.logoUrl ? (
                    <Image
                      src={settings.logoUrl}
                      alt='Logo'
                      width={32}
                      height={32}
                      className='object-contain'
                    />
                  ) : (
                    <div className='w-8 h-8 bg-white/20 rounded'></div>
                  )}
                  <h1 className='font-bold'>{settings.siteName}</h1>
                </div>
              </div>

              {/* Content */}
              <div className='p-4'>
                <p className='text-sm text-gray-600 mb-3'>
                  {settings.siteDescription}
                </p>

                <button
                  className='px-4 py-2 rounded text-white text-sm'
                  style={{ backgroundColor: settings.secondaryColor }}>
                  Get Started
                </button>

                <div className='mt-4 space-y-2'>
                  <div className='h-2 bg-gray-200 rounded'></div>
                  <div className='h-2 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-2 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
