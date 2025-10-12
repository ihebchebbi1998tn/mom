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
import testimonial9 from "@/assets/testimonials/testimonial-9.png";
import testimonial10 from "@/assets/testimonials/testimonial-10.png";
import testimonial11 from "@/assets/testimonials/testimonial-11.png";
import testimonial12 from "@/assets/testimonials/testimonial-12.png";
import testimonial13 from "@/assets/testimonials/testimonial-13.png";
import testimonial14 from "@/assets/testimonials/testimonial-14.png";
import testimonial15 from "@/assets/testimonials/testimonial-15.png";
import testimonial16 from "@/assets/testimonials/testimonial-16.png";
import testimonial17 from "@/assets/testimonials/testimonial-17.png";
import testimonial18 from "@/assets/testimonials/testimonial-18.png";
import testimonial19 from "@/assets/testimonials/testimonial-19.png";
import testimonial20 from "@/assets/testimonials/testimonial-20.png";
import testimonial21 from "@/assets/testimonials/testimonial-21.png";
import testimonial22 from "@/assets/testimonials/testimonial-22.png";
import testimonial23 from "@/assets/testimonials/testimonial-23.png";
import testimonial24 from "@/assets/testimonials/testimonial-24.png";
import testimonial25 from "@/assets/testimonials/testimonial-25.png";
import testimonial26 from "@/assets/testimonials/testimonial-26.png";
import testimonial27 from "@/assets/testimonials/testimonial-27.png";
import testimonial28 from "@/assets/testimonials/testimonial-28.png";
import testimonial29 from "@/assets/testimonials/testimonial-29.png";
import testimonial30 from "@/assets/testimonials/testimonial-30.png";
import testimonial31 from "@/assets/testimonials/testimonial-31.png";
import testimonial32 from "@/assets/testimonials/testimonial-32.png";
import testimonial33 from "@/assets/testimonials/testimonial-33.png";
import testimonial34 from "@/assets/testimonials/testimonial-34.png";
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
    name: "أم عبد الله",
    package: "باك ذهبي",
    imageUrl: testimonial1
  }, {
    name: "أم أحمد",
    package: "باك ذهبي",
    imageUrl: testimonial2
  }, {
    name: "أم محمد",
    package: "باك ذهبي",
    imageUrl: testimonial3
  }, {
    name: "أم سارة",
    package: "باك ذهبي",
    imageUrl: testimonial4
  }, {
    name: "أم يوسف",
    package: "باك ذهبي",
    imageUrl: testimonial5
  }, {
    name: "أم علي",
    package: "باك ذهبي",
    imageUrl: testimonial6
  }, {
    name: "أم فاطمة",
    package: "باك ذهبي",
    imageUrl: testimonial7
  }, {
    name: "أم خديجة",
    package: "باك ذهبي",
    imageUrl: testimonial8
  }, {
    name: "أم مريم",
    package: "باك ذهبي",
    imageUrl: testimonial9
  }, {
    name: "أم ليلى",
    package: "باك ذهبي",
    imageUrl: testimonial10
  }, {
    name: "أم هند",
    package: "باك ذهبي",
    imageUrl: testimonial11
  }, {
    name: "أم نور",
    package: "باك ذهبي",
    imageUrl: testimonial12
  }, {
    name: "أم آية",
    package: "باك ذهبي",
    imageUrl: testimonial13
  }, {
    name: "أم زينب",
    package: "باك ذهبي",
    imageUrl: testimonial14
  }, {
    name: "أم ياسمين",
    package: "باك ذهبي",
    imageUrl: testimonial15
  }, {
    name: "أم حنان",
    package: "باك ذهبي",
    imageUrl: testimonial16
  }, {
    name: "أم سلمى",
    package: "باك ذهبي",
    imageUrl: testimonial17
  }, {
    name: "أم رقية",
    package: "باك ذهبي",
    imageUrl: testimonial18
  }, {
    name: "أم إيمان",
    package: "باك ذهبي",
    imageUrl: testimonial19
  }, {
    name: "أم لينا",
    package: "باك ذهبي",
    imageUrl: testimonial20
  }, {
    name: "أم سمية",
    package: "باك ذهبي",
    imageUrl: testimonial21
  }, {
    name: "أم عائشة",
    package: "باك ذهبي",
    imageUrl: testimonial22
  }, {
    name: "أم كريمة",
    package: "باك ذهبي",
    imageUrl: testimonial23
  }, {
    name: "أم راضية",
    package: "باك ذهبي",
    imageUrl: testimonial24
  }, {
    name: "أم منى",
    package: "باك ذهبي",
    imageUrl: testimonial25
  }, {
    name: "أم صفية",
    package: "باك ذهبي",
    imageUrl: testimonial26
  }, {
    name: "أم سعاد",
    package: "باك ذهبي",
    imageUrl: testimonial27
  }, {
    name: "أم وردة",
    package: "باك ذهبي",
    imageUrl: testimonial28
  }, {
    name: "أم جميلة",
    package: "باك ذهبي",
    imageUrl: testimonial29
  }, {
    name: "أم نجاة",
    package: "باك ذهبي",
    imageUrl: testimonial30
  }, {
    name: "أم فريدة",
    package: "باك ذهبي",
    imageUrl: testimonial31
  }, {
    name: "أم بشرى",
    package: "باك ذهبي",
    imageUrl: testimonial32
  }, {
    name: "رحمة",
    package: "باك ذهبي",
    imageUrl: testimonial33
  }, {
    name: "سيرين",
    package: "باك ذهبي",
    imageUrl: testimonial34
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
              {visibleAudioTestimonials.map((testimonial, index) => <Card key={currentAudioIndex + index} className={`card-cute p-6 relative overflow-hidden flex flex-col transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{
              transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms'
            }}>
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
                </Card>)}
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
          <h3 className="text-2xl font-bold text-foreground text-center mb-8"> شاهدات مكتوبة </h3>
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
              {visiblePhotoTestimonials.map((testimonial, index) => <div key={currentPhotoIndex + index} className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{
              transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms'
            }} onClick={() => setSelectedImage(testimonial.imageUrl!)}>
                  {/* Review Image */}
                  <img src={testimonial.imageUrl} alt={`Review from ${testimonial.name}`} className="w-full h-64 object-contain" />
                </div>)}
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
            <img src={selectedImage || ""} alt="Testimonial" className="w-full h-auto rounded-lg" />
          </DialogContent>
        </Dialog>
      </div>
    </section>;
};
export default Testimonials;