import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, Users, Star, ArrowLeft, User, Briefcase, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import oldLogo from "@/assets/maman-attentionnee-logo.png";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: string;
  rating: number;
  image_url?: string;
  description?: string;
  status: string;
  workshops?: Workshop[];
  challenges?: Challenge[];
}

interface Workshop {
  id: number;
  title: string;
  description?: string;
  duration?: string;
  image_url?: string;
  price?: number;
}

interface Challenge {
  id: number;
  title: string;
  description?: string;
  duration?: string;
  image_url?: string;
  difficulty?: string;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [coursePacks, setCoursePacks] = useState<CoursePack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursePacks();
  }, []);

  const fetchCoursePacks = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php');
      const data = await response.json();
      if (data.success) {
        const activePacks = data.data?.filter((pack: CoursePack) => pack.status === 'active') || [];
        
        // Fetch workshops and challenges for each pack
        const packsWithExtras = await Promise.all(
          activePacks.map(async (pack: CoursePack) => {
            try {
              // Fetch linked workshops
              const workshopsResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_workshop_links.php?pack_id=${pack.id}`);
              const workshopsData = await workshopsResponse.json();
              const workshops = workshopsData.success ? workshopsData.data : [];

              // Fetch linked challenges
              const challengesResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?pack_id=${pack.id}`);
              const challengesData = await challengesResponse.json();
              const challenges = challengesData.success ? challengesData.data : [];

              return { ...pack, workshops, challenges };
            } catch (error) {
              console.error(`Error fetching extras for pack ${pack.id}:`, error);
              return { ...pack, workshops: [], challenges: [] };
            }
          })
        );
        
        setCoursePacks(packsWithExtras);
      }
    } catch (error) {
      console.error('Error fetching course packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      {/* Branding Bar */}
      <div className="bg-gradient-to-r from-pink-100 to-rose-100 border-b border-pink-200 py-2 sticky top-0 z-50">
        <div className="flex justify-center items-center gap-2 px-4">
          <img 
            src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
            alt="أكاديمية الأم" 
            className="w-6 h-6 object-contain"
          />
          <span className="text-xs font-medium text-pink-700">
            تطبيق من تصميم
          </span>
          <span className="text-xs font-bold text-pink-600" dir="ltr">
            @maman_attentionnee
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <User className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  لوحة الطالب
                </h1>
                <p className="text-sm text-muted-foreground">استكشف الدورات المتاحة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">مرحباً بك في منصة التعلم</h2>
          <p className="text-muted-foreground">اختر من مجموعة واسعة من الدورات التدريبية المصممة خصيصاً لتطوير مهاراتك</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الدورات المتاحة</p>
                <p className="text-2xl font-bold text-primary">{coursePacks.length}</p>
              </div>
              <Play className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-primary">
                  {coursePacks.reduce((total, pack) => {
                    const studentCount = parseInt(pack.students.replace('+', '')) || 0;
                    return total + studentCount;
                  }, 0)}+
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                <p className="text-2xl font-bold text-primary">
                  {coursePacks.length > 0 ? 
                    (coursePacks.reduce((sum, pack) => sum + pack.rating, 0) / coursePacks.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Course Packs Grid */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">الدورات التدريبية المتاحة</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري تحميل الدورات...</p>
            </div>
          ) : coursePacks.length === 0 ? (
            <div className="text-center py-12">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">لا توجد دورات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursePacks.map((pack) => (
                <Card key={pack.id} className="card-elegant overflow-hidden hover:shadow-lg transition-all duration-300">
                  {pack.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={pack.image_url} 
                        alt={pack.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-2">{pack.title}</h4>
                      {pack.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{pack.description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">الوحدات:</span>
                        <Badge variant="outline">{pack.modules.split(',').length}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">المدة:</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {pack.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">الطلاب:</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {pack.students}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">التقييم:</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {pack.rating}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">{pack.price}</span>
                        <Badge className="bg-green-100 text-green-800">متاح الآن</Badge>
                      </div>
                      
                      <Button className="w-full btn-hero">
                        <Play className="w-4 h-4 ml-2" />
                        ابدأ التعلم
                      </Button>
                    </div>

                    {/* Modules Preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">الوحدات المتضمنة:</p>
                      <div className="flex flex-wrap gap-2">
                        {pack.modules.split(',').slice(0, 3).map((module, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {module.trim()}
                          </Badge>
                        ))}
                        {pack.modules.split(',').length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pack.modules.split(',').length - 3} المزيد
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Workshops Preview */}
                    {pack.workshops && pack.workshops.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          الورشات المتضمنة ({pack.workshops.length})
                        </p>
                        <div className="space-y-2">
                          {pack.workshops.slice(0, 2).map((workshop) => (
                            <div key={workshop.id} className="text-xs p-2 bg-secondary/30 rounded">
                              <div className="font-medium">{workshop.title}</div>
                              {workshop.duration && (
                                <div className="text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {workshop.duration}
                                </div>
                              )}
                            </div>
                          ))}
                          {pack.workshops.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{pack.workshops.length - 2} ورشة إضافية
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Challenges Preview */}
                    {pack.challenges && pack.challenges.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          التحديات المتضمنة ({pack.challenges.length})
                        </p>
                        <div className="space-y-2">
                          {pack.challenges.slice(0, 2).map((challenge) => (
                            <div key={challenge.id} className="text-xs p-2 bg-secondary/30 rounded">
                              <div className="font-medium">{challenge.title}</div>
                              <div className="text-muted-foreground flex items-center gap-2 mt-1">
                                {challenge.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {challenge.duration}
                                  </span>
                                )}
                                {challenge.difficulty && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    {challenge.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {pack.challenges.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{pack.challenges.length - 2} تحدي إضافي
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;