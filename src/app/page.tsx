import { getPublicStats } from "@/server/queries/platform";
import { listCategories, listQuizzes } from "@/server/queries/quizzes";
import { getOptionalUser } from "@/server/session";
import CtaSection from "./_components/cta-section";
import FaqSection from "./_components/faq-section";
import FeaturesSection from "./_components/features-section";
import Footer from "./_components/footer";
import HeroSection from "./_components/hero-section";
import HowItWorksSection from "./_components/how-it-works-section";
import HomeNavbar from "./_components/navbar";
import PopularCategoriesSection from "./_components/popular-categories-section";
import StatsSection from "./_components/stats-section";
import TrendingSection from "./_components/trending-section";

export default async function HomePage() {
  const [user, stats, popular, categories] = await Promise.all([
    getOptionalUser(),
    getPublicStats(),
    listQuizzes({ sort: "popular", pageSize: 6 }),
    listCategories(),
  ]);
  const isSignedIn = Boolean(user);

  return (
    <>
      <HomeNavbar user={user ? { name: user.name, email: user.email } : null} />
      <main>
        <HeroSection isSignedIn={isSignedIn} />
        <StatsSection stats={stats} />
        <TrendingSection quizzes={popular.items} />
        <PopularCategoriesSection categories={categories} />
        <HowItWorksSection />
        <FeaturesSection />
        <FaqSection />
        <CtaSection isSignedIn={isSignedIn} />
      </main>
      <Footer />
    </>
  );
}
