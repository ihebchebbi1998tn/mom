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
  const audioTestimonials = [{
    name: "سامية",
    package: "باك ذهبي",
    audioUrl: "/audio/testimonial1.mp3"
  }, {
    name: "وفاء",
    package: "باك ذهبي",
    audioUrl: "/audio/testimonial2.mp3"
  }, {
    name: "ريم",
    package: "باك ذهبي",
    audioUrl: "/audio/testimonial3.mp3"
  }];
  
  const photoTestimonials = [{
    name: "أميرة",
    package: "باك ذهبي",
    imageUrl: testimonial1
  }, {
    name: "إيناس",
    package: "باك ذهبي",
    imageUrl: testimonial2
  }, {
    name: "روعة",
    package: "باك ذهبي",
    imageUrl: testimonial3
  }, {
    name: "مروى",
    package: "باك ذهبي",
    imageUrl: testimonial4
  }, {
    name: "سمية",
    package: "باك ذهبي",
    imageUrl: testimonial5
  }, {
    name: "سندس",
    package: "باك ذهبي",
    imageUrl: testimonial7
  }, {
    name: "صفاء",
    package: "باك ذهبي",
    imageUrl: testimonial8
  }];
  const {
    ref: sectionRef,
    isVisible
  } = useScrollAnimation();
  const isMobile = useIsMobile();
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const itemsPerPage = isMobile ? 1 : 3;
  
  const maxAudioIndex = Math.max(0, audioTestimonials.length - itemsPerPage);
  const maxPhotoIndex = Math.max(0, photoTestimonials.length - itemsPerPage);
  
  const goToPreviousAudio = () => {
    setCurrentAudioIndex(prev => prev === 0 ? maxAudioIndex : prev - 1);
  };
  const goToNextAudio = () => {
    setCurrentAudioIndex(prev => prev >= maxAudioIndex ? 0 : prev + 1);
  };
  const goToPreviousPhoto = () => {
    setCurrentPhotoIndex(prev => prev === 0 ? maxPhotoIndex : prev - 1);
  };
  const goToNextPhoto = () => {
    setCurrentPhotoIndex(prev => prev >= maxPhotoIndex ? 0 : prev + 1);
  };
  
  const visibleAudioTestimonials = audioTestimonials.slice(currentAudioIndex, currentAudioIndex + itemsPerPage);
  const visiblePhotoTestimonials = photoTestimonials.slice(currentPhotoIndex, currentPhotoIndex + itemsPerPage);
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

        {/* Audio Testimonials Section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            شهادات صوتية
          </h3>
          <div className="relative">
            {/* Left Arrow */}
            <Button variant="outline" size="sm" onClick={goToPreviousAudio} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full p-3 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            {/* Right Arrow */}
            <Button variant="outline" size="sm" onClick={goToNextAudio} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full p-3 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Audio Testimonials Grid */}
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6 px-8`}>
              {visibleAudioTestimonials.map((testimonial, index) => (
                <Card 
                  key={currentAudioIndex + index} 
                  className={`card-cute p-6 relative overflow-hidden flex flex-col transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ 
                    transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' 
                  }}
                >
                  {/* Mom Name */}
                  <div className="text-right mb-4">
                    <h3 className="text-lg font-bold text-primary">{testimonial.name}</h3>
                  </div>

                  {/* Enhanced Audio Player */}
                  <div>
                    <EnhancedAudioPlayer src={testimonial.audioUrl} />
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
                </Card>
              ))}
            </div>
            
            {/* Page Indicator */}
            <div className="flex justify-center mt-6">
              <span className="text-sm text-muted-foreground bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
                {currentAudioIndex + 1} - {Math.min(currentAudioIndex + itemsPerPage, audioTestimonials.length)} من {audioTestimonials.length}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Testimonials Section */}
        <div>
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            شهادات مصورة
          </h3>
          <div className="relative">
            {/* Left Arrow */}
            <Button variant="outline" size="sm" onClick={goToPreviousPhoto} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full p-3 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            {/* Right Arrow */}
            <Button variant="outline" size="sm" onClick={goToNextPhoto} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full p-3 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Photo Testimonials Grid */}
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6 px-8`}>
              {visiblePhotoTestimonials.map((testimonial, index) => (
                <div 
                  key={currentPhotoIndex + index} 
                  className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ 
                    transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' 
                  }}
                  onClick={() => setSelectedImage(testimonial.imageUrl!)}
                >
                  {/* Name overlay on top */}
                  <div className="absolute -top-2 right-4 z-10 px-4 py-2 rounded-lg">
                    <h3 className="text-lg font-bold text-primary">{testimonial.name}</h3>
                  </div>

                  {/* Review Image */}
                  <img 
                    src={testimonial.imageUrl} 
                    alt={`Review from ${testimonial.name}`}
                    className="w-full h-64 object-contain"
                  />
                </div>
              ))}
            </div>
            
            {/* Page Indicator */}
            <div className="flex justify-center mt-6">
              <span className="text-sm text-muted-foreground bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
                {currentPhotoIndex + 1} - {Math.min(currentPhotoIndex + itemsPerPage, photoTestimonials.length)} من {photoTestimonials.length}
              </span>
            </div>
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
