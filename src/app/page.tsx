import { HomeContent } from "@/components/HomeContent";
import { getLandingPageContent } from "@/lib/landing-page";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const { content, features } = await getLandingPageContent();
  
  console.log("Homepage loading - Content found:", !!content);
  console.log("Hero title:", content.heroTitle);

  return <HomeContent content={content} features={features} />;
}
