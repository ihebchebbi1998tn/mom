import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import EnhancedAudioPlayer from "@/components/EnhancedAudioPlayer";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import testimonial images
import testimonial1 from "@/assets/testimonials/testimonial-1.png";
import testimonial2 from "@/assets/testimonials/testimonial-2.png";
import testimonial3 from "@/assets/testimonials/testimonial-3.png";
import testimonial4 from "@/assets/testimonials/testimonial-4.png";
import testimonial5 from "@/assets/testimonials/testimonial-5.png";
import testimonial6 from "@/assets/testimonials/testimonial-6.png";
import testimonial7 from "@/assets/testimonials/testimonial-7.png";
import testimonial8 from "@/assets/testimonials/testimonial-8.png";
const Testimonials = () => {
  const testimonials = [{
    name: "سارة محمد",
    package: "باك ذهبي",
    audioUrl: "/audio/testimonial1.mp3"
  }, {
    name: "فاطمة أحمد",
    package: "باك ذهبي",
    imageUrl: testimonial1
  }, {
    name: "نور الهدى",
    package: "باك ذهبي",
    audioUrl: "/audio/testimonial2.mp3"
  }, {
    name: "ليلى حسن",
    package: "باك ذهبي",
    imageUrl: testimonial2
  }, {
    name: "منى عبدالله",
    package: "باك ذهبي",
    imageUrl: testimonial3
  }, {
    name: "هدى يوسف",
    package: "باك ذهبي",
    audioUrl: "/audio/testimonial3.mp3"
  }, {
    name: "زينب علي",
    package: "باك ذهبي",
    imageUrl: testimonial4
  }, {
    name: "رنا خالد",
    package: "باك ذهبي",
    imageUrl: testimonial5
  }, {
    name: "أمينة سعيد",
    package: "باك ذهبي",
    imageUrl: testimonial7
  }, {
    name: "سلمى إبراهيم",
    package: "باك ذهبي",
    imageUrl: testimonial8
  }];
  const {
    ref: sectionRef,
    isVisible
  } = useScrollAnimation();
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
            تعرفي على آراء{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">الأمهات</span>
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
            className={`card-cute p-6 relative overflow-hidden flex flex-col transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ 
              transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' 
            }}
          >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="w-12 h-12" />
              </div>

              {/* Audio Icon - only show if audio exists */}
              {testimonial.audioUrl && (
                <div className="absolute top-4 left-4 text-primary/30">
                  <Headphones className="w-8 h-8" />
                </div>
              )}

              {/* Mom Name and Package */}
              <div className="text-right mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2">{testimonial.name}</h3>
                <p className="text-primary font-medium" dir="rtl">{testimonial.package}</p>
              </div>

              {/* Review Image (if exists) */}
              {testimonial.imageUrl && (
                <div 
                  className="mb-4 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-primary/30"
                  onClick={() => setSelectedImage(testimonial.imageUrl!)}
                >
                  <img 
                    src={testimonial.imageUrl} 
                    alt={`Review from ${testimonial.name}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Enhanced Audio Player (if exists) */}
              {testimonial.audioUrl && (
                <div>
                  <EnhancedAudioPlayer src={testimonial.audioUrl} />
                </div>
              )}
              

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

        {/* Image Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl w-[95vw] p-2">
            <img 
              src={selectedImage || ""} 
              alt="Testimonial" 
              className="w-full h-auto rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>;
};
export default Testimonials;
