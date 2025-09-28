import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowLeft, Clock, MessageSquare, MapPin } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import Footer from "@/components/Footer";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

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
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
}

const Workshops = () => {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const fetchWorkshops = async () => {
    try {
      // Try direct call first
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshops.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.workshops) {
        setWorkshops(data.workshops.filter((workshop: Workshop) => workshop.status === 'active'));
      }
    } catch (error) {
      console.error('Direct API call failed:', error);
      
      // For GET requests, try CORS proxy as fallback
      try {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://spadadibattaglia.com/mom/api/workshops.php'));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);
        if (data.success && data.workshops) {
          setWorkshops(data.workshops.filter((workshop: Workshop) => workshop.status === 'active'));
        }
      } catch (proxyError) {
        console.error('Proxy call also failed:', proxyError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الورش...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Sidebar */}
        <UserSidebar />
        
        <div className="flex flex-col min-h-screen">
          {/* Header - Full width on mobile, accounts for sidebar on desktop */}
          <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full md:mr-0 md:pr-[var(--sidebar-width)] transition-all duration-300">
            <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 lg:hidden">
                  <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">ورشات عملية ومكثفة</h1>
                    <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">ورش تدريبية متخصصة للأمهات</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden hover:bg-pink-50 rounded-xl p-2.5 transition-colors duration-200" />
                  <Button variant="ghost" onClick={handleBackToDashboard} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area - Properly spaced for desktop sidebar */}
          <main className="flex-1 w-full md:pr-[var(--sidebar-width)] px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-x-hidden">
            {/* Header Section */}
            <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ورشات</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ورش تدريبية متخصصة تقدم حلول عملية ومباشرة لأهم التحديات التي تواجه الأمهات
              </p>
            </div>

            {/* Workshops Grid */}
            {workshops.length > 0 ? (
              <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-8">
                {workshops.map((workshop, index) => (
                  <Card 
                    key={workshop.id} 
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      {/* Workshop Header */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                          {workshop.type}
                        </span>
                        <h3 
                          className={`text-xl font-bold text-primary mb-2 ${getTextAlignmentClasses(workshop.title)} ${getContainerDirection(workshop.title)}`}
                          dir={getTextDirection(workshop.title)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {workshop.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p 
                        className={`text-muted-foreground mb-4 leading-relaxed ${getTextAlignmentClasses(workshop.description)} ${getContainerDirection(workshop.description)}`}
                        dir={getTextDirection(workshop.description)}
                        style={{ unicodeBidi: 'plaintext' }}
                      >
                        {workshop.description}
                      </p>

                      {/* Workshop Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{workshop.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>الدفعة القادمة: {formatDate(workshop.next_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>مسجل: {workshop.enrolled_count}/{workshop.max_participants}</span>
                        </div>
                        {workshop.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{workshop.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Highlights */}
                      {workshop.highlights && workshop.highlights.length > 0 && (
                        <div className="mb-4">
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {workshop.highlights.slice(0, 2).map((highlight, index) => (
                              <li key={index}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CTA Button */}
                      <Button 
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full" 
                        onClick={() => {
                          const message = encodeURIComponent(`أريد التسجيل في ${workshop.title}`);
                          window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                        }}
                      >
                        احجزي مقعدك الآن
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">لا توجد ورش متاحة حاليًا</p>
                <p className="text-sm text-muted-foreground">سيتم إضافة ورش جديدة قريباً</p>
              </div>
            )}

            {/* Call to Action */}
            <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8 max-w-2xl mx-auto">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    لديك فكرة لورشة جديدة؟
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    نحن نستمع لاحتياجاتكم ونطور ورش جديدة باستمرار. شاركينا أفكارك واقتراحاتك
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-white" 
                    onClick={() => {
                      const message = encodeURIComponent("لدي اقتراح لورشة جديدة أود مناقشتها معكم");
                      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                    }}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    اقترحي ورشة جديدة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Footer - Full width on mobile, accounts for sidebar on desktop */}
          <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm w-full md:pr-[var(--sidebar-width)] transition-all duration-200">
            <Footer />
          </footer>
        </div>
        
        {/* Floating WhatsApp */}
        <EnhancedFloatingWhatsApp />
      </div>
    </SidebarProvider>
  );
};

export default Workshops;