import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <TrustedBySection />
    <FeaturesSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <PricingSection />
    <ContactSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
