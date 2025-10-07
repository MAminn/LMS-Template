import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing landing page content fetch...');
    
    // Test the exact same query as the homepage
    const content = await prisma.landingPageContent.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    
    const allContent = await prisma.landingPageContent.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({
      success: true,
      activeContent: content ? {
        id: content.id,
        heroTitle: content.heroTitle,
        isActive: content.isActive,
        createdAt: content.createdAt
      } : null,
      allContentCount: allContent.length,
      allContent: allContent.map(c => ({
        id: c.id,
        heroTitle: c.heroTitle,
        isActive: c.isActive,
        createdAt: c.createdAt
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}