import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import VideoShowcaseSection from "@/components/landing/VideoShowcaseSection";
import ValuePropositionSection from "@/components/landing/ValuePropositionSection";
import ImpactSection from "@/components/landing/ImpactSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import CTASection from "@/components/landing/CTASection";
import usePageTitle from "@/hooks/usePageTitle";

const Index = () => {
  usePageTitle("");
  return (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <TrustedBySection />
    <ProblemSection />
    <FeaturesSection />
    <VideoShowcaseSection />
    <ValuePropositionSection />
    <HowItWorksSection />
    <ImpactSection />
    <TestimonialsSection />
    <PricingSection />
    <ContactSection />
    <CTASection />
    <Footer />
  </div>
  );
};

export default Index;
