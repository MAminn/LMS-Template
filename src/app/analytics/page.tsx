"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  Eye,
  Target,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsData } from "@/lib/analytics-service";

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ type: "all" });

        // If user is instructor, fetch their own data
        if (
          session?.user &&
          "role" in session.user &&
          session.user.role === "INSTRUCTOR"
        ) {
          if ("id" in session.user) {
            params.append("instructorId", session.user.id as string);
          }
        }

        const response = await fetch(`/api/analytics?${params}`);
        const data: AnalyticsResponse = await response.json();

        if (data.success) {
          setAnalytics(data.data);
        } else {
          setError("Failed to load analytics");
        }
      } catch {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>
            Failed to load analytics
          </h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const isAdmin =
    session?.user && "role" in session.user && session.user.role === "ADMIN";

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
          <p className='text-gray-600'>
            {isAdmin
              ? "Platform-wide analytics and insights"
              : "Your course analytics and insights"}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "Admin View" : "Instructor View"}
          </Badge>
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview' className='flex items-center space-x-2'>
            <BarChart3 className='h-4 w-4' />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value='enrollment'
            className='flex items-center space-x-2'>
            <TrendingUp className='h-4 w-4' />
            <span>Enrollment</span>
          </TabsTrigger>
          <TabsTrigger
            value='performance'
            className='flex items-center space-x-2'>
            <Target className='h-4 w-4' />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger
            value='engagement'
            className='flex items-center space-x-2'>
            <Activity className='h-4 w-4' />
            <span>Engagement</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Students
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {analytics.overview.totalStudents.toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Unique enrolled students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Courses
                </CardTitle>
                <BookOpen className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {analytics.overview.totalCourses.toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Published courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Revenue
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${analytics.overview.totalRevenue.toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  From course sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Completion Rate
                </CardTitle>
                <Award className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {analytics.overview.completionRate}%
                </div>
                <p className='text-xs text-muted-foreground'>
                  Average course completion
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='enrollment' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <LineChartIcon className='h-5 w-5' />
                  <span>Monthly Enrollments</span>
                </CardTitle>
                <CardDescription>
                  Enrollment trends over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={analytics.enrollment.monthly}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='enrollments'
                      stroke='#3b82f6'
                      fill='#3b82f6'
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <DollarSign className='h-5 w-5' />
                  <span>Monthly Revenue</span>
                </CardTitle>
                <CardDescription>
                  Revenue trends over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={analytics.enrollment.monthly}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Revenue",
                      ]}
                    />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#10b981'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <TrendingUp className='h-5 w-5' />
                  <span>Top Performing Courses</span>
                </CardTitle>
                <CardDescription>
                  Courses ranked by enrollment and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart data={analytics.enrollment.topCourses.slice(0, 8)}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='title'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis yAxisId='enrollments' orientation='left' />
                    <YAxis yAxisId='revenue' orientation='right' />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId='enrollments'
                      dataKey='enrollments'
                      fill='#3b82f6'
                      name='Enrollments'
                    />
                    <Bar
                      yAxisId='revenue'
                      dataKey='revenue'
                      fill='#10b981'
                      name='Revenue ($)'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Target className='h-5 w-5' />
                  <span>Course Progress</span>
                </CardTitle>
                <CardDescription>
                  Average progress and completion rates by course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={analytics.performance.courseProgress.slice(0, 8)}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='title'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='averageProgress'
                      fill='#3b82f6'
                      name='Avg Progress %'
                    />
                    <Bar
                      dataKey='completions'
                      fill='#10b981'
                      name='Completions'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Award className='h-5 w-5' />
                  <span>Quiz Performance</span>
                </CardTitle>
                <CardDescription>
                  Average scores and pass rates for quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={analytics.performance.quizPerformance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='title'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='averageScore'
                      fill='#f59e0b'
                      name='Avg Score %'
                    />
                    <Bar dataKey='passRate' fill='#8b5cf6' name='Pass Rate %' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {analytics.performance.courseProgress.slice(0, 6).map((course) => (
              <Card key={course.courseId}>
                <CardHeader>
                  <CardTitle className='text-lg truncate'>
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Avg Progress:</span>
                    <Badge variant='outline'>{course.averageProgress}%</Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Completions:</span>
                    <Badge variant='outline'>{course.completions}</Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Dropoff Rate:</span>
                    <Badge
                      variant={
                        course.dropoffRate > 50 ? "destructive" : "secondary"
                      }>
                      {course.dropoffRate}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='engagement' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Activity className='h-5 w-5' />
                  <span>Daily Active Users</span>
                </CardTitle>
                <CardDescription>
                  User activity over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={analytics.engagement.dailyActiveUsers}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='activeUsers'
                      stroke='#3b82f6'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Eye className='h-5 w-5' />
                  <span>Top Lesson Engagement</span>
                </CardTitle>
                <CardDescription>
                  Most viewed lessons with completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={analytics.engagement.lessonEngagement.slice(0, 8)}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='title'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='views' fill='#3b82f6' name='Views' />
                    <Bar
                      dataKey='completionRate'
                      fill='#10b981'
                      name='Completion Rate %'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {analytics.engagement.lessonEngagement.slice(0, 6).map((lesson) => (
              <Card key={lesson.lessonId}>
                <CardHeader>
                  <CardTitle className='text-lg truncate'>
                    {lesson.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Views:</span>
                    <Badge variant='outline'>{lesson.views}</Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>
                      Avg Watch Time:
                    </span>
                    <Badge variant='outline'>
                      {lesson.averageWatchTime}min
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>
                      Completion Rate:
                    </span>
                    <Badge
                      variant={
                        lesson.completionRate > 80 ? "default" : "secondary"
                      }>
                      {lesson.completionRate}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
