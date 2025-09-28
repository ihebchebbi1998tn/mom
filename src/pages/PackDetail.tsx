import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  CheckCircle,
  Heart,
  MessageSquare,
  Calendar,
  Award
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: number;
  rating: number;
  image_url: string | null;
  description: string;
  status: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

const PackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState<CoursePack | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [userRating, setUserRating] = useState(0);
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  // Static reviews data in Arabic
  const staticReviews: Review[] = [
    {
      id: 1,
      name: "سارة أحمد",
      rating: 5,
      comment: "دورة رائعة جداً! استفدت منها كثيراً في التعامل مع طفلي. المحتوى مفصل وسهل الفهم والتطبيق العملي ممتاز.",
      date: "2024-09-15",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "منى خالد",
      rating: 4,
      comment: "محتوى قيم ومفيد. ساعدني في فهم احتياجات طفلي بشكل أفضل. أنصح كل أم بهذه الدورة.",
      date: "2024-09-10",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "فاطمة محمد",
      rating: 5,
      comment: "الدورة غيرت طريقة تفكيري في التربية. المدربة متمكنة والأمثلة واقعية ومفيدة جداً.",
      date: "2024-09-08",
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "نورا علي",
      rating: 5,
      comment: "أفضل استثمار قمت به لتطوير مهاراتي كأم. شكراً لكم على هذا المحتوى الرائع!",
      date: "2024-09-05",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    fetchPackDetails();
  }, [id]);

  const fetchPackDetails = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php');
      const data = await response.json();
      
      if (data.success && data.data) {
        const foundPack = data.data.find((p: CoursePack) => p.id === parseInt(id || ''));
        setPack(foundPack || null);
      }
    } catch (error) {
      console.error('Error fetching pack details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = () => {
    if (newReview.trim() && userRating > 0) {
      // In a real app, this would submit to backend
      console.log("Review submitted:", { rating: userRating, comment: newReview });
      setNewReview("");
      setUserRating(0);
      // Show success message
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">الباقة غير موجودة</h1>
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
              العودة للباقات
            </Button>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Pack Image */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={pack.image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"}
                    alt={pack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-foreground" dir="ltr">{pack.rating}</span>
                  </div>
                  
                  {/* Students Count */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground" dir="ltr">{pack.students}+</span>
                    <span className="text-sm text-muted-foreground">طالبة</span>
                  </div>
                </div>
              </div>

              {/* Pack Info */}
              <div className="space-y-6" ref={sectionRef}>
                <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {pack.title}
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Card className="p-4 text-center">
                    <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="font-semibold text-foreground">{pack.duration}</div>
                    <div className="text-sm text-muted-foreground">مدة الدورة</div>
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
                      const message = encodeURIComponent(`أريد التسجيل في ${pack.title}`);
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

        {/* Course Modules */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">محتوى الدورة</h2>
            
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">المواضيع المشمولة</h3>
                </div>
                
                <div className="grid gap-4">
                  {pack.modules && pack.modules.split(',').map((module, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{module.trim()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-primary-light/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">آراء المشاركات</h2>
              
              {/* Reviews Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {staticReviews.map((review, index) => (
                  <Card key={review.id} className={`p-6 transition-all duration-1000 hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${index * 150}ms` }}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{review.name}</h4>
                        <span className="text-sm text-muted-foreground" dir="ltr">{review.date}</span>
                      </div>
                      <div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add Review Form */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">شاركي تجربتك</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">تقييمك للدورة</label>
                    {renderStars(userRating, true, setUserRating)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">تعليقك</label>
                    <Textarea 
                      placeholder="شاركينا رأيك في الدورة وكيف استفدت منها..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={!newReview.trim() || userRating === 0}
                    className="btn-hero"
                  >
                    <Heart className="w-4 h-4 ml-2" />
                    إرسال التقييم
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <EnhancedFloatingWhatsApp />
    </div>
  );
};

export default PackDetail;