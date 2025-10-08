import { HomeContent } from "@/components/HomeContent";
import { getLandingPageContent } from "@/lib/landing-page";

// Use ISR with short revalidation for better performance
export const revalidate = 30; // Revalidate every 30 seconds

export default async function Home() {
  const { content, features } = await getLandingPageContent();

  return <HomeContent content={content} features={features} />;
}
