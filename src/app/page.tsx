import { HomeContent } from "@/components/HomeContent";
import { getLandingPageContent } from "@/lib/landing-page";

export default async function Home() {
  const { content, features } = await getLandingPageContent();

  return <HomeContent content={content} features={features} />;
}
