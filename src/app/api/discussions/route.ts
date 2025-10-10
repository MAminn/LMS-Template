import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// In a real app, these would be database models
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

interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isInstructorReply: boolean;
  isBestAnswer: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data for development
const mockDiscussions: Discussion[] = [
  {
    id: "1",
    courseId: "course1",
    userId: "user1",
    userName: "Alice Johnson",
    userAvatar: "/avatars/alice.jpg",
    title: "Question about React Hooks",
    content:
      "I'm having trouble understanding useEffect. Can someone explain the dependency array?",
    category: "technical",
    tags: ["react", "hooks", "useEffect"],
    isPinned: false,
    isResolved: false,
    likes: 5,
    replies: 3,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    courseId: "course1",
    userId: "user2",
    userName: "Bob Smith",
    userAvatar: "/avatars/bob.jpg",
    title: "Assignment 3 clarification",
    content: "For the final project, are we allowed to use external libraries?",
    category: "assignment",
    tags: ["assignment", "project", "libraries"],
    isPinned: true,
    isResolved: true,
    likes: 8,
    replies: 7,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// eslint-disable-next-line prefer-const
let mockReplies: DiscussionReply[] = [
  {
    id: "1",
    discussionId: "1",
    userId: "instructor1",
    userName: "Dr. Sarah Wilson",
    userAvatar: "/avatars/instructor.jpg",
    content:
      "Great question! The dependency array in useEffect determines when the effect runs. If you pass an empty array [], it only runs once after the initial render...",
    isInstructorReply: true,
    isBestAnswer: true,
    likes: 12,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const createDiscussionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.enum([
    "general",
    "assignment",
    "lecture",
    "technical",
    "off-topic",
  ]),
  tags: z.array(z.string()).max(5).optional().default([]),
});

const createReplySchema = z.object({
  discussionId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const discussionId = searchParams.get("discussionId");
    const type = searchParams.get("type") || "discussions";
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "recent";
    const search = searchParams.get("search");

    if (type === "replies" && discussionId) {
      // Get replies for a specific discussion
      const replies = mockReplies
        .filter((reply) => reply.discussionId === discussionId)
        .sort((a, b) => {
          if (a.isBestAnswer && !b.isBestAnswer) return -1;
          if (!a.isBestAnswer && b.isBestAnswer) return 1;
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

      return NextResponse.json({
        success: true,
        data: replies,
        meta: {
          total: replies.length,
          discussionId,
        },
      });
    }

    // Get discussions
    let discussions = mockDiscussions.filter(
      (d) => !courseId || d.courseId === courseId
    );

    // Filter by category
    if (category && category !== "all") {
      discussions = discussions.filter((d) => d.category === category);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      discussions = discussions.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.content.toLowerCase().includes(searchLower) ||
          d.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    discussions.sort((a, b) => {
      // Pinned discussions always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortBy) {
        case "popular":
          return b.likes - a.likes;
        case "replies":
          return b.replies - a.replies;
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default: // recent
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const paginatedDiscussions = discussions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedDiscussions,
      meta: {
        total: discussions.length,
        page,
        limit,
        totalPages: Math.ceil(discussions.length / limit),
        hasNext: offset + limit < discussions.length,
        hasPrev: page > 1,
        filters: {
          courseId,
          category,
          search,
          sortBy,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "discussion";

    if (type === "reply") {
      // Create a new reply
      const validatedData = createReplySchema.parse(body);

      const discussion = mockDiscussions.find(
        (d) => d.id === validatedData.discussionId
      );
      if (!discussion) {
        return NextResponse.json(
          { error: "Discussion not found" },
          { status: 404 }
        );
      }

      const newReply: DiscussionReply = {
        id: Date.now().toString(),
        discussionId: validatedData.discussionId,
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        userAvatar: session.user.image,
        content: validatedData.content,
        isInstructorReply: session.user.role === "instructor",
        isBestAnswer: false,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockReplies.push(newReply);

      // Update discussion reply count and updated time
      const discussionIndex = mockDiscussions.findIndex(
        (d) => d.id === validatedData.discussionId
      );
      if (discussionIndex !== -1) {
        mockDiscussions[discussionIndex]!.replies += 1;
        mockDiscussions[discussionIndex]!.updatedAt = new Date().toISOString();
      }

      return NextResponse.json({
        success: true,
        data: newReply,
        message: "Reply created successfully",
      });
    }

    // Create a new discussion
    const validatedData = createDiscussionSchema.parse(body);

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      courseId: validatedData.courseId,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      userAvatar: session.user.image,
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      tags: validatedData.tags,
      isPinned: false,
      isResolved: false,
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDiscussions.push(newDiscussion);

    return NextResponse.json({
      success: true,
      data: newDiscussion,
      message: "Discussion created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const discussionId = searchParams.get("discussionId");
    const replyId = searchParams.get("replyId");
    const action = searchParams.get("action");

    if (!action) {
      return NextResponse.json(
        { error: "Action parameter required" },
        { status: 400 }
      );
    }

    if (replyId && action === "markBestAnswer") {
      // Mark reply as best answer
      const discussion = mockDiscussions.find((d) => d.id === discussionId);
      if (!discussion) {
        return NextResponse.json(
          { error: "Discussion not found" },
          { status: 404 }
        );
      }

      // Only discussion creator or instructor can mark best answer
      if (
        discussion.userId !== session.user.id &&
        session.user.role !== "instructor"
      ) {
        return NextResponse.json(
          { error: "Not authorized to mark best answer" },
          { status: 403 }
        );
      }

      // Remove best answer from other replies
      mockReplies.forEach((reply) => {
        if (reply.discussionId === discussionId) {
          reply.isBestAnswer = reply.id === replyId;
        }
      });

      // Mark discussion as resolved
      const discussionIndex = mockDiscussions.findIndex(
        (d) => d.id === discussionId
      );
      if (discussionIndex !== -1) {
        mockDiscussions[discussionIndex]!.isResolved = true;
      }

      return NextResponse.json({
        success: true,
        message: "Best answer marked successfully",
      });
    }

    if (discussionId && action === "togglePin") {
      // Toggle pin status (instructors only)
      if (session.user.role !== "instructor") {
        return NextResponse.json(
          { error: "Not authorized to pin discussions" },
          { status: 403 }
        );
      }

      const discussionIndex = mockDiscussions.findIndex(
        (d) => d.id === discussionId
      );
      if (discussionIndex === -1) {
        return NextResponse.json(
          { error: "Discussion not found" },
          { status: 404 }
        );
      }

      mockDiscussions[discussionIndex]!.isPinned =
        !mockDiscussions[discussionIndex]!.isPinned;

      return NextResponse.json({
        success: true,
        data: mockDiscussions[discussionIndex],
        message: "Discussion pin status updated",
      });
    }

    if ((discussionId || replyId) && action === "toggleLike") {
      // Toggle like status
      if (replyId) {
        const replyIndex = mockReplies.findIndex((r) => r.id === replyId);
        if (replyIndex === -1) {
          return NextResponse.json(
            { error: "Reply not found" },
            { status: 404 }
          );
        }

        // In a real app, you'd track which users liked what
        // For demo, just increment/decrement
        mockReplies[replyIndex]!.likes += Math.random() > 0.5 ? 1 : -1;
        if (mockReplies[replyIndex]!.likes < 0)
          mockReplies[replyIndex]!.likes = 0;

        return NextResponse.json({
          success: true,
          data: mockReplies[replyIndex],
          message: "Like status updated",
        });
      } else if (discussionId) {
        const discussionIndex = mockDiscussions.findIndex(
          (d) => d.id === discussionId
        );
        if (discussionIndex === -1) {
          return NextResponse.json(
            { error: "Discussion not found" },
            { status: 404 }
          );
        }

        mockDiscussions[discussionIndex]!.likes += Math.random() > 0.5 ? 1 : -1;
        if (mockDiscussions[discussionIndex]!.likes < 0)
          mockDiscussions[discussionIndex]!.likes = 0;

        return NextResponse.json({
          success: true,
          data: mockDiscussions[discussionIndex],
          message: "Like status updated",
        });
      }
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating discussion:", error);
    return NextResponse.json(
      { error: "Failed to update discussion" },
      { status: 500 }
    );
  }
}
