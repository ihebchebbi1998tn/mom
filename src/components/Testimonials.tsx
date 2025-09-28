import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import EnhancedAudioPlayer from "@/components/EnhancedAudioPlayer";
const Testimonials = () => {
  const testimonials = [{
    name: "سارة أحمد",
    role: "أم لطفلين",
    quote: "تحدي رائع ، نحب نشركك برشا وحتى من راجلي لاحض تحسن متعي ..",
    rating: 5,
    audioUrl: "/audio/testimonial1.mp3"
  }, {
    name: "فاطمة محمد",
    role: "أم لثلاثة أطفال",
    quote: "حبيت نقلك محليك محليك ، عن 6 يام مع بعضنا وإن ندعيلك .. تبدلت إن في روحي وولت عند ثقة في روحي",
    rating: 5,
    audioUrl: "/audio/testimonial2.mp3"
  }, {
    name: "مريم علي",
    role: "أم عاملة",
    quote: "مجتمع رائع من الأمهات المتعلمات، والدعم المتبادل جعل التجربة أكثر إثراءً. الدورات عملية ومفيدة جداً",
    rating: 5,
    audioUrl: "/audio/testimonial3.mp3"
  }];
  const {
    ref: sectionRef,
    isVisible
  } = useScrollAnimation();
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerPage);
  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? maxIndex : prev - 1);
  };
  const goToNext = () => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };
  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerPage);
  return <section id="testimonials" className="py-20 bg-white" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            آراء{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">الأمهات </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            استمعي لتجارب الأمهات اللواتي حققن أهدافهن من خلال أكاديمية الأم
          </p>
        </div>

        {/* Testimonials Display with Side Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          <Button variant="outline" size="sm" onClick={goToPrevious} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full p-3 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {/* Right Arrow */}
          <Button variant="outline" size="sm" onClick={goToNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full p-3 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Testimonials Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6 px-8`}>
          {visibleTestimonials.map((testimonial, index) => <Card 
            key={currentIndex + index} 
            className={`card-cute p-6 relative overflow-hidden h-full flex flex-col transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ 
              transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' 
            }}
          >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="w-12 h-12" />
              </div>

              {/* Audio Icon */}
              <div className="absolute top-4 left-4 text-primary/30">
                <Headphones className="w-8 h-8" />
              </div>

              {/* Testimonial Quote */}
              <p className={`text-foreground/90 leading-relaxed italic mb-4 flex-grow text-base font-semibold ${getTextAlignmentClasses(testimonial.quote)} ${getContainerDirection(testimonial.quote)}`} dir={getTextDirection(testimonial.quote)} style={{
              unicodeBidi: 'plaintext'
            }}>
                "{testimonial.quote}"
              </p>

              {/* Enhanced Audio Player */}
              <div className="mb-4">
                <EnhancedAudioPlayer src={testimonial.audioUrl} />
              </div>

              {/* Author Info */}
              

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
            </Card>)}
          </div>
          
          {/* Page Indicator */}
          <div className="flex justify-center mt-6">
            <span className="text-sm text-muted-foreground bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
              {currentIndex + 1} - {Math.min(currentIndex + itemsPerPage, testimonials.length)} من {testimonials.length}
            </span>
          </div>
        </div>
      </div>
    </section>;
};
export default Testimonials;