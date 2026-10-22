import { getOptionalUser } from "@/server/session";
import CtaSection from "./components/home/cta-section";
import FaqSection from "./components/home/faq-section";
import FeaturesSection from "./components/home/features-section";
import Footer from "./components/home/footer";
import HeroSection from "./components/home/hero-section";
import HowItWorksSection from "./components/home/how-it-works-section";
import HomeNavbar from "./components/home/navbar";
import PopularCategoriesSection from "./components/home/popular-categories-section";
import StatsSection from "./components/home/stats-section";
import TrendingSection from "./components/home/trending-section";

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
