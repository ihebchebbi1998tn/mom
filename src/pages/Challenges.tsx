import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, Trophy, Users, Calendar, CheckCircle, Menu } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface Challenge {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  participants: number;
  reward: string;
  status: 'active' | 'upcoming' | 'completed';
  start_date: string;
  end_date: string;
}

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSectionSelect = (section: string) => {
    if (section === 'packs') {
      navigate('/dashboard');
    } else if (section === 'workshops') {
      navigate('/workshops');
    } else if (section === 'reviews') {
      navigate('/reviews');
    } else if (section === 'blogs') {
      navigate('/blogs');
    } else if (section === 'challenges') {
      // Already on challenges page
    } else {
      // Handle other sections
    }
  };

  // Mock data for challenges since we don't have an API endpoint yet
  const mockChallenges: Challenge[] = [
    {
      id: 1,
      title: "تحدي الأم الواعية - 30 يوم",
      description: "تحدي شامل لتطوير مهارات الأمومة الواعية خلال 30 يوماً من خلال أنشطة يومية وتمارين عملية",
      duration: "30 يوم",
      difficulty: "متوسط",
      participants: 156,
      reward: "شهادة إنجاز + استشارة مجانية",
      status: "active",
      start_date: "2024-01-01",
      end_date: "2024-01-31"
    },
    {
      id: 2,
      title: "تحدي إدارة الوقت للأمهات",
      description: "تعلمي كيفية تنظيم وقتك بفعالية بين المسؤوليات المختلفة من خلال تقنيات عملية مجربة",
      duration: "14 يوم",
      difficulty: "سهل",
      participants: 89,
      reward: "دليل تنظيم الوقت الشخصي",
      status: "upcoming",
      start_date: "2024-02-01",
      end_date: "2024-02-14"
    },
    {
      id: 3,
      title: "تحدي الذكاء العاطفي",
      description: "رحلة تطوير الذكاء العاطفي لفهم وإدارة المشاعر بطريقة صحية للأم والطفل",
      duration: "21 يوم",
      difficulty: "صعب",
      participants: 67,
      reward: "برنامج متقدم في الذكاء العاطفي",
      status: "active",
      start_date: "2024-01-15",
      end_date: "2024-02-05"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setChallenges(mockChallenges);
      setLoading(false);
    }, 1000);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'text-green-600 bg-green-100';
      case 'متوسط': return 'text-yellow-600 bg-yellow-100';
      case 'صعب': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'جاري الآن';
      case 'upcoming': return 'قريباً';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التحديات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">تحديات تطوير الذات</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">تحديات لتطوير مهاراتك الشخصية</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-pink-50 rounded-xl transition-colors duration-200"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard} 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout - Content + Sidebar Side by Side */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Content Area - Left Side */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-x-hidden overflow-y-auto">
            {/* Header Section */}
            <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Target className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">تحديات تطوير الذات</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                انضمي لتحدياتنا الشخصية وطوري مهاراتك كأم واعية
              </p>
            </div>

            {/* Challenges Grid */}
            {challenges.length > 0 ? (
              <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-8">
                {challenges.map((challenge, index) => (
                  <Card 
                    key={challenge.id} 
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      {/* Challenge Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(challenge.status)}`}>
                            {getStatusText(challenge.status)}
                          </span>
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">
                          {challenge.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {challenge.description}
                      </p>

                      {/* Challenge Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>المدة: {challenge.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>المشتركين: {challenge.participants}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>المكافأة: {challenge.reward}</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        className={`w-full ${
                          challenge.status === 'active' 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' 
                            : challenge.status === 'upcoming'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                        disabled={challenge.status === 'completed'}
                        onClick={() => {
                          const message = encodeURIComponent(`أريد الانضمام إلى ${challenge.title}`);
                          window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                        }}
                      >
                        {challenge.status === 'active' && (
                          <>
                            انضمي الآن
                            <CheckCircle className="w-4 h-4 mr-2" />
                          </>
                        )}
                        {challenge.status === 'upcoming' && (
                          <>
                            احجزي مكانك
                            <Calendar className="w-4 h-4 mr-2" />
                          </>
                        )}
                        {challenge.status === 'completed' && (
                          <>
                            التحدي مكتمل
                            <Trophy className="w-4 h-4 mr-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">لا توجد تحديات متاحة حاليًا</p>
                <p className="text-sm text-muted-foreground">سيتم إضافة تحديات جديدة قريباً</p>
              </div>
            )}

            {/* Call to Action */}
            <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8 max-w-2xl mx-auto">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    هل لديك فكرة لتحدي جديد؟
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    شاركينا أفكارك لتحديات جديدة تساعد الأمهات على التطوير والنمو
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-white" 
                    onClick={() => {
                      const message = encodeURIComponent("لدي فكرة لتحدي جديد أود مناقشتها معكم");
                      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                    }}
                  >
                    <Target className="w-4 h-4 ml-2" />
                    اقترحي تحدي جديد
                  </Button>
                </CardContent>
              </Card>
            </div>
        </main>

        {/* Sidebar - Right Side */}
        <UserSidebar 
          onSectionSelect={handleSectionSelect}
          isOpen={isMobile ? isSidebarOpen : true}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      {/* Floating WhatsApp */}
      <EnhancedFloatingWhatsApp />
    </div>
  );
};

export default Challenges;