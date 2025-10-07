import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import heroImage from "@/assets/hero-mother-daughter-floral.png";
const Hero = () => {
  const navigate = useNavigate();
  const {
    ref: heroRef,
    isVisible
  } = useScrollAnimation();
  const isMobile = useIsMobile();
  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section id="home" ref={heroRef} className="relative h-[85dvh] lg:h-[60vh] w-full flex items-center overflow-hidden bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400">
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto h-full items-center px-4 lg:px-4 md:px-0 relative z-10">
        {/* Left Content */}
        <div className={`flex flex-col justify-center items-center lg:items-end text-center lg:text-right h-full transition-all duration-1000 relative ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`} style={isMobile ? {
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: '0 -1rem'
      } : undefined}>
          {isMobile && <div className="absolute inset-0 bg-gradient-to-r from-pink-400/60 via-pink-300/60 to-pink-400/60">
              <div className="absolute inset-0 bg-black/25"></div>
            </div>}
          <div className={`relative z-10 mt-8 lg:mt-0 max-w-lg px-6 lg:px-0 ${isMobile ? '' : ''}`}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight text-center lg:text-right">
              أكاديمية الأم
              <span className="block text-yellow-300 text-2xl lg:text-3xl mt-2">
                شعارنا ليس تقديم النصائح بل تقديم الحلول
              </span>
            </h1>

          <p className="text-lg lg:text-xl text-white mb-6 max-w-lg mx-auto lg:mx-0 text-center lg:text-right leading-relaxed">رحلتُكِ لعيش أمومة ممتعة وتربية طفل متوازن تبدأ من هنا، حيث نقدم لكِ الأدوات والمعرفة لتحقيق التوازن </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
              <Button size="lg" className="btn-hero rounded-full px-6 py-3 text-lg font-semibold hover:shadow-[0_0_30px_rgba(233,30,99,0.5)] hover:scale-105 transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-shimmer before:skew-x-12" onClick={() => navigate("/auth")}>
                ابدئي رحلة التعلم الآن
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button size="lg" variant="outline" className="btn-outline rounded-full px-6 py-3 text-lg font-semibold" onClick={scrollToTestimonials}>
                اكتشفي المزيد
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-center">
              <div className="flex flex-col items-center">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-1" dir="ltr">
                  500+
                </div>
                <div className="text-sm text-white/80">أم مستفيدة</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-1" dir="ltr">
                  20+
                </div>
                <div className="text-sm text-white/80">دورة تدريبية</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-1" dir="ltr">
                  95%
                </div>
                <div className="text-sm text-white/80">رضا العملاء</div>
              </div>
            </div>
          </div>
        </div>

      {/* Right Image */}
      {!isMobile && <div className={`h-full w-full flex items-center justify-center transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
          <img src={heroImage} alt="أم وطفلها - أكاديمية الأم" className="h-full max-w-[45%] object-cover" loading="eager" decoding="async" fetchPriority="high" />
        </div>}

      </div>

      {/* Scroll Indicator - Mobile Only */}
      {isMobile && <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-white/80">
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </div>}
    </section>;
};
export default Hero;