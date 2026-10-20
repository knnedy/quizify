import { auth } from "@/server/auth";
import { headers } from "next/headers";
import Navbar from "./components/home/navbar";
import HeroSection from "./components/home/hero-section";
import PopularCategoriesSection from "./components/home/popular-categories-section";
import FAQSection from "./components/home/faq-section";
import FeaturesSection from "./components/home/features-section";
import Footer from "./components/home/footer";
import HowItWorksSection from "./components/home/how-it-works-section";
import StatsSection from "./components/home/stats-section";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 overflow-hidden">
      <Navbar session={session} />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PopularCategoriesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
