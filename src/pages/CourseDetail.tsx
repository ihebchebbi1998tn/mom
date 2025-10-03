import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import ModernVideoModal from "@/components/ModernVideoModal";
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  CheckCircle,
  Award,
  PlayCircle
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface SubPack {
  id: number;
  pack_id: number;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  intro_video_url: string | null;
  order_index: number;
  status: string;
}

const CourseDetail = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<SubPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  useEffect(() => {
    fetchCourseDetails();
  }, [packageId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?id=${packageId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">الدورة غير موجودة</h1>
        <Button onClick={() => navigate('/')} className="btn-hero">
          العودة للصفحة الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-2">
        {/* Hero Section */}
        <section className="py-4 bg-gradient-to-br from-primary/5 to-primary-light/10">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للصفحة الرئيسية
            </Button>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Course Image */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={course.banner_image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                
                {/* Watch Introduction Button */}
                {course.intro_video_url && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => {
                        setSelectedVideoUrl(course.intro_video_url);
                        setIsVideoModalOpen(true);
                      }}
                      className="btn-hero w-full"
                      size="lg"
                    >
                      <PlayCircle className="w-5 h-5 ml-2" />
                      شاهد المقدمة
                    </Button>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="space-y-6" ref={sectionRef}>
                <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {course.title}
                  </h1>
                  {course.description && (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Card className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="font-semibold text-foreground">محتوى شامل</div>
                    <div className="text-sm text-muted-foreground">دروس تفاعلية</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="font-semibold text-foreground">شهادة معتمدة</div>
                    <div className="text-sm text-muted-foreground">بعد الانتهاء</div>
                  </Card>
                </div>

                {/* CTA */}
                <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Button 
                    size="lg" 
                    className="btn-hero w-full text-lg py-6"
                    onClick={() => {
                      const message = encodeURIComponent(`أريد التسجيل في ${course.title}`);
                      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                    }}
                  >
                    سجلي الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Intro Video */}
        {course.intro_video_url && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-8">فيديو تعريفي بالدورة</h2>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <video 
                    src={course.intro_video_url}
                    controls
                    className="w-full h-full object-cover"
                    poster={course.banner_image_url || undefined}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Course Description */}
        {course.description && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">عن الدورة</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </Card>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <EnhancedFloatingWhatsApp />
      
      {/* Video Modal */}
      {selectedVideoUrl && (
        <ModernVideoModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setSelectedVideoUrl(null);
          }}
          videoUrl={selectedVideoUrl}
          title={course?.title || "مقدمة الدورة"}
        />
      )}
    </div>
  );
};

export default CourseDetail;
