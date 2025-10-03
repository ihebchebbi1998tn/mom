import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TabbedOfferings from "@/components/TabbedOfferings";
import Consultation from "@/components/Consultation";
import Founder from "@/components/Founder";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

import LoadingScreen from "@/components/LoadingScreen";
import useVisitorTracking from "@/hooks/useVisitorTracking";
import { useState, useEffect } from "react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  // Track visitor on landing page
  useVisitorTracking('landing-page');

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 300);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`min-h-screen transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <main>
        <Hero />
        <TabbedOfferings />
        <About />
        <Consultation />
        <Founder />
        <Testimonials />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
