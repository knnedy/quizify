import { getOptionalUser } from "@/server/session";
import CtaSection from "./_components/home/cta-section";
import FaqSection from "./_components/home/faq-section";
import FeaturesSection from "./_components/home/features-section";
import Footer from "./_components/home/footer";
import HeroSection from "./_components/home/hero-section";
import HowItWorksSection from "./_components/home/how-it-works-section";
import HomeNavbar from "./_components/home/navbar";
import PopularCategoriesSection from "./_components/home/popular-categories-section";
import StatsSection from "./_components/home/stats-section";
import TrendingSection from "./_components/home/trending-section";

export default async function HomePage() {
  const user = await getOptionalUser();
  const isSignedIn = Boolean(user);

  return (
    <>
      <HomeNavbar user={user ? { name: user.name, email: user.email } : null} />
      <main>
        <HeroSection isSignedIn={isSignedIn} />
        <StatsSection />
        <TrendingSection />
        <PopularCategoriesSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FaqSection />
        <CtaSection isSignedIn={isSignedIn} />
      </main>
      <Footer />
    </>
  );
}
