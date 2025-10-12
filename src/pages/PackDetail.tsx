import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import ModernVideoModal from "@/components/ModernVideoModal";
import { ArrowLeft, Star, Users, Clock, BookOpen, CheckCircle, Heart, MessageSquare, Calendar, Award, PlayCircle } from "lucide-react";
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
  intro_video_url: string | null;
  description: string;
  status: string;
  sub_packs?: SubPack[];
}
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
interface Workshop {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  next_date: string;
  enrolled_count: number;
  max_participants: number;
  location: string;
  highlights: string[];
  price: number;
  image_url?: string;
  order_index: number;
}
interface Challenge {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  participants: number;
  reward: string;
  status: string;
  start_date: string;
  end_date: string;
  price: string;
  order_index: number;
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
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState<CoursePack | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [newReview, setNewReview] = useState("");
  const [userRating, setUserRating] = useState(0);
  const {
    ref: sectionRef,
    isVisible
  } = useScrollAnimation();

  // Static reviews data in Arabic
  const staticReviews: Review[] = [{
    id: 1,
    name: "سارة أحمد",
    rating: 5,
    comment: "دورة رائعة جداً! استفدت منها كثيراً في التعامل مع طفلي. المحتوى مفصل وسهل الفهم والتطبيق العملي ممتاز.",
    date: "2024-09-15",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  }, {
    id: 2,
    name: "منى خالد",
    rating: 4,
    comment: "محتوى قيم ومفيد. ساعدني في فهم احتياجات طفلي بشكل أفضل. أنصح كل أم بهذه الدورة.",
    date: "2024-09-10",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }, {
    id: 3,
    name: "فاطمة محمد",
    rating: 5,
    comment: "الدورة غيرت طريقة تفكيري في التربية. المدربة متمكنة والأمثلة واقعية ومفيدة جداً.",
    date: "2024-09-08",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face"
  }, {
    id: 4,
    name: "نورا علي",
    rating: 5,
    comment: "أفضل استثمار قمت به لتطوير مهاراتي كأم. شكراً لكم على هذا المحتوى الرائع!",
    date: "2024-09-05",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  }];
  useEffect(() => {
    fetchPackDetails();
  }, [id]);
  const fetchPackDetails = async () => {
    try {
      // Fetch pack details
      const packResponse = await fetch(`https://spadadibattaglia.com/mom/api/course_packs.php?id=${id}`);
      const packData = await packResponse.json();
      if (packData.success && packData.data) {
        // Fetch linked sub-packs
        try {
          const subPacksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php?pack_id=${id}`);
          const subPacksData = await subPacksResponse.json();
          if (subPacksData.success && subPacksData.data) {
            packData.data.sub_packs = subPacksData.data;
          }
        } catch (subPackError) {
          console.error('Error fetching linked sub-packs:', subPackError);
        }

        // Fetch linked workshops
        try {
          const workshopsResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_workshop_links.php?pack_id=${id}`);
          const workshopsData = await workshopsResponse.json();
          if (workshopsData.success && workshopsData.data) {
            setWorkshops(workshopsData.data);
          }
        } catch (workshopError) {
          console.error('Error fetching linked workshops:', workshopError);
        }

        // Fetch linked challenges
        try {
          const challengesResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?pack_id=${id}`);
          const challengesData = await challengesResponse.json();
          if (challengesData.success && challengesData.data) {
            setChallenges(challengesData.data);
          }
        } catch (challengeError) {
          console.error('Error fetching linked challenges:', challengeError);
        }
        setPack(packData.data);
      }
    } catch (error) {
      console.error('Error fetching pack details:', error);
    } finally {
      setLoading(false);
    }
  };
  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`} onClick={() => interactive && onRate && onRate(star)} />)}
      </div>;
  };
  const handleSubmitReview = () => {
    if (newReview.trim() && userRating > 0) {
      // In a real app, this would submit to backend
      console.log("Review submitted:", {
        rating: userRating,
        comment: newReview
      });
      setNewReview("");
      setUserRating(0);
      // Show success message
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (!pack) {
    return <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">الباقة غير موجودة</h1>
        <Button onClick={() => navigate('/')} className="btn-hero">
          العودة للصفحة الرئيسية
        </Button>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-2">
        {/* Hero Section */}
        <section className="py-4 bg-gradient-to-br from-primary/5 to-primary-light/10">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للباقات
            </Button>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Pack Image */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img src={pack.image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"} alt={pack.title} className="w-full h-full object-cover" />
                  
                  {/* Students Count */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground" dir="ltr">{pack.students}+</span>
                    <span className="text-sm text-muted-foreground">طالبة</span>
                  </div>
                </div>
                
                {/* Watch Introduction Button */}
                {pack.intro_video_url && <div className="mt-4">
                    <Button onClick={() => {
                  setSelectedVideoUrl(pack.intro_video_url);
                  setIsVideoModalOpen(true);
                }} className="btn-hero w-full" size="lg">
                      <PlayCircle className="w-5 h-5 ml-2" />
                      شاهد المقدمة
                    </Button>
                  </div>}
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
                

                {/* CTA */}
                <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Button size="lg" className="btn-hero w-full text-lg py-6" onClick={() => {
                  const message = encodeURIComponent(`أريد التسجيل في ${pack.title}`);
                  window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                }}>
                    سجلي الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pack Intro Video */}
        {pack.intro_video_url && <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-8">فيديو تعريفي بالباك</h2>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <video src={pack.intro_video_url} controls className="w-full h-full object-cover" poster={pack.image_url || undefined} />
                </div>
              </div>
            </div>
          </section>}

        {/* Course Modules & Sub-Packs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">محتوى الباك</h2>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Modules Overview */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">الدورات المشمولة</h3>
                </div>
                
                <div className="grid gap-4">
                  {pack.modules && pack.modules.split(',').map((module, index) => <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{module.trim()}</span>
                    </div>)}
                </div>
              </Card>

              {/* Sub-Packs Section */}
              {pack.sub_packs && pack.sub_packs.length > 0 && <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground text-center">الأقسام التفصيلية</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pack.sub_packs.map(subPack => <Card key={subPack.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        {/* Sub-Pack Banner */}
                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary-light/5">
                          {subPack.banner_image_url ? <img src={subPack.banner_image_url} alt={subPack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-primary/30" />
                            </div>}
                          
                          {/* Play button overlay for intro video */}
                          {subPack.intro_video_url && <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-10 h-10 text-primary" />
                              </div>
                            </div>}
                        </div>
                        
                        <div className="p-5 space-y-3">
                          <h4 className="text-lg font-bold text-foreground line-clamp-2 min-h-[3.5rem]">
                            {subPack.title}
                          </h4>
                          
                          {subPack.description && <p className="text-sm text-muted-foreground leading-relaxed">
                              {subPack.description}
                            </p>}
                          
                          <div className="flex items-center gap-2 text-xs text-primary pt-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>مشمول في الباك</span>
                          </div>
                        </div>
                      </Card>)}
                  </div>
                </div>}

              {/* Workshops Section */}
              {workshops.length > 0 && <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground text-center">الورش المشمولة</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workshops.map(workshop => <Card key={workshop.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                          {workshop.image_url ? <img src={workshop.image_url} alt={workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="w-16 h-16 text-primary/30" />
                            </div>}
                        </div>
                        
                        <div className="p-5 space-y-3">
                          <h4 className="text-lg font-bold text-foreground line-clamp-2 min-h-[3.5rem]">
                            {workshop.title}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {workshop.description}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{workshop.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{workshop.enrolled_count}/{workshop.max_participants} مسجل</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-green-600 pt-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>مشمول في الباك</span>
                          </div>
                        </div>
                      </Card>)}
                  </div>
                </div>}

              {/* Challenges Section */}
              {challenges.length > 0 && <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground text-center">التحديات المشمولة</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => <Card key={challenge.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100">
                          <div className="w-full h-full flex items-center justify-center">
                            <Award className="w-16 h-16 text-primary/30" />
                          </div>
                        </div>
                        
                        <div className="p-5 space-y-3">
                          <h4 className="text-lg font-bold text-foreground line-clamp-2 min-h-[3.5rem]">
                            {challenge.title}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {challenge.description}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{challenge.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{challenge.participants} مشترك</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-green-600 pt-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>مشمول في الباك</span>
                          </div>
                        </div>
                      </Card>)}
                  </div>
                </div>}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <EnhancedFloatingWhatsApp />
      
      {/* Video Modal */}
      {selectedVideoUrl && <ModernVideoModal isOpen={isVideoModalOpen} onClose={() => {
      setIsVideoModalOpen(false);
      setSelectedVideoUrl(null);
    }} videoUrl={selectedVideoUrl} title={pack?.title || "مقدمة الدورة"} />}
    </div>;
};
export default PackDetail;