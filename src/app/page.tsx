import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import ServicesSection from "@/components/home/ServicesSection";
import HowItWorks from "@/components/home/HowItWorks";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import NearMeSection from "@/components/home/NearMeSection";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <NearMeSection />
      <ServicesSection />
      <HowItWorks />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
