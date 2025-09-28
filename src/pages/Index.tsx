import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import Workshops from "@/components/Workshops";
import Consultation from "@/components/Consultation";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import InstagramDrawer from "@/components/InstagramDrawer";
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
        <Courses />
        <About />
        <Workshops />
        <Consultation />
        <Testimonials />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <InstagramDrawer />
    </div>
  );
};

export default Index;
