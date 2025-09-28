import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, Users, Star, ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        setCoursePacks(data.data?.filter((pack: CoursePack) => pack.status === 'active') || []);
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
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
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