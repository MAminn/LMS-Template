"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Pin,
  CheckCircle,
  Tag,
  Calendar,
  User,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Discussion {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  category: "general" | "assignment" | "lecture" | "technical" | "off-topic";
  tags: string[];
  isPinned: boolean;
  isResolved: boolean;
  likes: number;
  replies: number;
  createdAt: string;
  updatedAt: string;
}

export default function DiscussionsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const courseId = params.id as string;

  const categories = [
    { value: "all", label: "All Categories", icon: MessageSquare },
    { value: "general", label: "General", icon: MessageSquare },
    { value: "assignment", label: "Assignments", icon: CheckCircle },
    { value: "lecture", label: "Lectures", icon: User },
    { value: "technical", label: "Technical Help", icon: Star },
    { value: "off-topic", label: "Off Topic", icon: MessageCircle },
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "popular", label: "Most Popular" },
    { value: "replies", label: "Most Replies" },
    { value: "oldest", label: "Oldest First" },
  ];

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        courseId,
        category: selectedCategory,
        sortBy,
        page: "1",
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/discussions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedCategory, sortBy, searchTerm]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleLikeDiscussion = async (discussionId: string) => {
    try {
      const response = await fetch(
        `/api/discussions?discussionId=${discussionId}&action=toggleLike`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        setDiscussions((prev) =>
          prev.map((discussion) =>
            discussion.id === discussionId
              ? {
                  ...discussion,
                  likes: discussion.likes + (Math.random() > 0.5 ? 1 : -1),
                }
              : discussion
          )
        );
      }
    } catch (error) {
      console.error("Error liking discussion:", error);
    }
  };

  const handlePinDiscussion = async (discussionId: string) => {
    const userWithRole = session?.user as {
      role: string;
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
    if (userWithRole?.role !== "instructor") return;

    try {
      const response = await fetch(
        `/api/discussions?discussionId=${discussionId}&action=togglePin`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        setDiscussions((prev) =>
          prev.map((discussion) =>
            discussion.id === discussionId
              ? { ...discussion, isPinned: !discussion.isPinned }
              : discussion
          )
        );
      }
    } catch (error) {
      console.error("Error pinning discussion:", error);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return `${Math.floor(diffInMs / (1000 * 60))}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-blue-100 text-blue-800",
      assignment: "bg-green-100 text-green-800",
      lecture: "bg-purple-100 text-purple-800",
      technical: "bg-orange-100 text-orange-800",
      "off-topic": "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p>Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-4'>
            <Link
              href={`/instructor/courses/${courseId}`}
              className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Course
            </Link>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Course Discussions
              </h1>
              <p className='text-gray-600 mt-2'>
                Connect with other students and instructors
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/courses/${courseId}/discussions/new`)
              }
              className='flex items-center space-x-2'>
              <Plus className='h-4 w-4' />
              <span>New Discussion</span>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search discussions...'
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className='pl-10'
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className='flex items-center space-x-2'>
                        <category.icon className='h-4 w-4' />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className='flex items-center space-x-2 text-sm text-gray-600'>
                <MessageSquare className='h-4 w-4' />
                <span>{discussions.length} discussions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussions List */}
        <div className='space-y-4'>
          {discussions.map((discussion) => (
            <Card
              key={discussion.id}
              className='hover:shadow-md transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-start space-x-4'>
                  {/* User Avatar */}
                  <div className='flex-shrink-0'>
                    <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                      <User className='h-5 w-5 text-blue-600' />
                    </div>
                  </div>

                  {/* Discussion Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        {discussion.isPinned && (
                          <Pin className='h-4 w-4 text-yellow-500' />
                        )}
                        {discussion.isResolved && (
                          <CheckCircle className='h-4 w-4 text-green-500' />
                        )}
                        <h3 className='text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer'>
                          <Link
                            href={`/courses/${courseId}/discussions/${discussion.id}`}>
                            {discussion.title}
                          </Link>
                        </h3>
                      </div>

                      {(() => {
                        const userWithRole = session?.user as {
                          role: string;
                          id: string;
                          name?: string;
                          email?: string;
                          image?: string;
                        };
                        return userWithRole?.role === "instructor";
                      })() && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handlePinDiscussion(discussion.id)}
                          className={
                            discussion.isPinned
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }>
                          <Pin className='h-4 w-4' />
                        </Button>
                      )}
                    </div>

                    <p className='text-gray-600 mb-3 line-clamp-2'>
                      {discussion.content}
                    </p>

                    <div className='flex items-center space-x-4 mb-3'>
                      <Badge className={getCategoryColor(discussion.category)}>
                        {discussion.category}
                      </Badge>

                      {discussion.tags.map((tag) => (
                        <div
                          key={tag}
                          className='flex items-center space-x-1 text-sm text-gray-500'>
                          <Tag className='h-3 w-3' />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4 text-sm text-gray-500'>
                        <div className='flex items-center space-x-1'>
                          <User className='h-4 w-4' />
                          <span>{discussion.userName}</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <Calendar className='h-4 w-4' />
                          <span>{formatTimeAgo(discussion.updatedAt)}</span>
                        </div>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleLikeDiscussion(discussion.id)}
                          className='flex items-center space-x-1 text-gray-500 hover:text-red-500'>
                          <Heart className='h-4 w-4' />
                          <span>{discussion.likes}</span>
                        </Button>

                        <div className='flex items-center space-x-1 text-gray-500'>
                          <MessageCircle className='h-4 w-4' />
                          <span>{discussion.replies}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {discussions.length === 0 && (
            <Card>
              <CardContent className='p-12 text-center'>
                <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No discussions yet
                </h3>
                <p className='text-gray-600 mb-4'>
                  Be the first to start a conversation!
                </p>
                <Button
                  onClick={() =>
                    router.push(`/courses/${courseId}/discussions/new`)
                  }
                  className='flex items-center space-x-2'>
                  <Plus className='h-4 w-4' />
                  <span>Start Discussion</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination would go here */}
      </div>
    </div>
  );
}
