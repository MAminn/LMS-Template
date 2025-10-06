"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Type,
  BarChart3,
  Users,
  Target,
  FileText,
} from "lucide-react";

interface LandingPageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  studentsCount: string;
  coursesCount: string;
  instructorsCount: string;
  completionRate: string;
  featuresTitle: string;
  featuresSubtitle: string;
  demoTitle: string;
  demoSubtitle: string;
  footerDescription: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export default function LandingPageEditor() {
  const [content, setContent] = useState<LandingPageContent>({
    heroTitle: "Build Your Learning Empire",
    heroSubtitle:
      "Complete Learning Management System with no-code customization, advanced analytics, and seamless content delivery.",
    heroBadgeText: "🚀 Next-Generation Learning Platform",
    heroCtaPrimary: "Explore Courses",
    heroCtaSecondary: "Start Learning",
    studentsCount: "1000+",
    coursesCount: "50+",
    instructorsCount: "25+",
    completionRate: "95%",
    featuresTitle: "Everything You Need to Succeed",
    featuresSubtitle:
      "From course creation to student management, we provide all the tools you need to build and scale your educational platform.",
    demoTitle: "Try The Academy Today",
    demoSubtitle:
      "Experience the full power of our learning management system with these demo accounts.",
    footerDescription:
      "Empowering educators and learners with cutting-edge technology. Build, customize, and scale your learning platform with ease.",
  });

  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates/landing");
      const data = await response.json();
      if (data.success) {
        if (data.data.content) {
          setContent(data.data.content);
        }
        if (data.data.features) {
          setFeatures(data.data.features);
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/templates/landing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...content,
          features,
        }),
      });

      if (response.ok) {
        alert("Landing page content saved successfully!");
      } else {
        alert("Error saving content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (
    field: keyof LandingPageContent,
    value: string
  ) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (
    index: number,
    field: keyof Feature,
    value: string | string[]
  ) => {
    setFeatures((prev) =>
      prev.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      )
    );
  };

  const addFeature = () => {
    setFeatures((prev) => [
      ...prev,
      {
        title: "New Feature",
        description: "Feature description",
        icon: "🆕",
        color: "blue",
        features: ["Feature point 1", "Feature point 2", "Feature point 3"],
      },
    ]);
  };

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const colorOptions = [
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Purple", value: "purple" },
    { name: "Orange", value: "orange" },
    { name: "Red", value: "red" },
    { name: "Indigo", value: "indigo" },
  ];

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
            Landing Page Editor
          </h1>
          <p className='text-gray-600'>
            Complete control over your homepage content and messaging
          </p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={() => window.open("/", "_blank")}
            className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2'>
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

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: "hero", name: "Hero Section", icon: Type },
            { id: "stats", name: "Statistics", icon: BarChart3 },
            { id: "features", name: "Features", icon: Target },
            { id: "demo", name: "Demo Section", icon: Users },
            { id: "footer", name: "Footer", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}>
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='bg-white rounded-lg shadow p-6'>
        {/* Hero Section */}
        {activeTab === "hero" && (
          <div className='space-y-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Hero Section
            </h2>

            <div className='grid grid-cols-1 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Badge Text
                </label>
                <input
                  type='text'
                  value={content.heroBadgeText}
                  onChange={(e) =>
                    handleContentChange("heroBadgeText", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='🚀 Next-Generation Learning Platform'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Main Title
                </label>
                <input
                  type='text'
                  value={content.heroTitle}
                  onChange={(e) =>
                    handleContentChange("heroTitle", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Build Your Learning Empire'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Subtitle
                </label>
                <textarea
                  value={content.heroSubtitle}
                  onChange={(e) =>
                    handleContentChange("heroSubtitle", e.target.value)
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Complete Learning Management System...'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Primary Button Text
                  </label>
                  <input
                    type='text'
                    value={content.heroCtaPrimary}
                    onChange={(e) =>
                      handleContentChange("heroCtaPrimary", e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Explore Courses'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Secondary Button Text
                  </label>
                  <input
                    type='text'
                    value={content.heroCtaSecondary}
                    onChange={(e) =>
                      handleContentChange("heroCtaSecondary", e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Start Learning'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {activeTab === "stats" && (
          <div className='space-y-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Statistics Section
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Students Count
                </label>
                <input
                  type='text'
                  value={content.studentsCount}
                  onChange={(e) =>
                    handleContentChange("studentsCount", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='1000+'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Courses Count
                </label>
                <input
                  type='text'
                  value={content.coursesCount}
                  onChange={(e) =>
                    handleContentChange("coursesCount", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='50+'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Instructors Count
                </label>
                <input
                  type='text'
                  value={content.instructorsCount}
                  onChange={(e) =>
                    handleContentChange("instructorsCount", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='25+'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Completion Rate
                </label>
                <input
                  type='text'
                  value={content.completionRate}
                  onChange={(e) =>
                    handleContentChange("completionRate", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='95%'
                />
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === "features" && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Features Section
              </h2>
              <button
                onClick={addFeature}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'>
                Add Feature
              </button>
            </div>

            <div className='grid grid-cols-1 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Section Title
                </label>
                <input
                  type='text'
                  value={content.featuresTitle}
                  onChange={(e) =>
                    handleContentChange("featuresTitle", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Section Subtitle
                </label>
                <textarea
                  value={content.featuresSubtitle}
                  onChange={(e) =>
                    handleContentChange("featuresSubtitle", e.target.value)
                  }
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Feature Cards */}
            <div className='space-y-6'>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-md font-medium text-gray-900'>
                      Feature {index + 1}
                    </h3>
                    <button
                      onClick={() => removeFeature(index)}
                      className='text-red-600 hover:text-red-800'>
                      Remove
                    </button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Title
                      </label>
                      <input
                        type='text'
                        value={feature.title}
                        onChange={(e) =>
                          handleFeatureChange(index, "title", e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Icon (Emoji)
                      </label>
                      <input
                        type='text'
                        value={feature.icon}
                        onChange={(e) =>
                          handleFeatureChange(index, "icon", e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Description
                      </label>
                      <textarea
                        value={feature.description}
                        onChange={(e) =>
                          handleFeatureChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={2}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Color Theme
                      </label>
                      <select
                        value={feature.color}
                        onChange={(e) =>
                          handleFeatureChange(index, "color", e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                        {colorOptions.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Feature Points (comma separated)
                      </label>
                      <input
                        type='text'
                        value={feature.features.join(", ")}
                        onChange={(e) =>
                          handleFeatureChange(
                            index,
                            "features",
                            e.target.value.split(", ")
                          )
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Feature 1, Feature 2, Feature 3'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Section */}
        {activeTab === "demo" && (
          <div className='space-y-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Demo Section
            </h2>

            <div className='grid grid-cols-1 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Demo Section Title
                </label>
                <input
                  type='text'
                  value={content.demoTitle}
                  onChange={(e) =>
                    handleContentChange("demoTitle", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Try The Academy Today'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Demo Section Subtitle
                </label>
                <textarea
                  value={content.demoSubtitle}
                  onChange={(e) =>
                    handleContentChange("demoSubtitle", e.target.value)
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Experience the full power of our learning management system...'
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {activeTab === "footer" && (
          <div className='space-y-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Footer Content
            </h2>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Footer Description
              </label>
              <textarea
                value={content.footerDescription}
                onChange={(e) =>
                  handleContentChange("footerDescription", e.target.value)
                }
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Empowering educators and learners with cutting-edge technology...'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
