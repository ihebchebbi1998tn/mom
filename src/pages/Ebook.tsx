import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, ArrowRight, Menu, BookOpen, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const Ebook = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Set launch date (example: January 1, 2026)
  const launchDate = new Date('2026-01-01T00:00:00');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSectionSelect = (section: string) => {
    if (section === 'packs') {
      navigate('/dashboard');
    } else if (section === 'workshops') {
      navigate('/workshops');
    } else if (section === 'challenges') {
      navigate('/challenges');
    } else if (section === 'blogs') {
      navigate('/blogs');
    } else if (section === 'reviews') {
      navigate('/reviews');
    } else if (section === 'ebook') {
      // Already on ebook page
    } else {
      toast({
        title: "Bientôt disponible",
        description: "Cette section est en cours de développement"
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard} 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
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
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-right">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">كتابي الإلكتروني</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">قريباً جداً</p>
              </div>
              <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)] w-full">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <UserSidebar 
            onSectionSelect={handleSectionSelect}
            isOpen={true}
            onToggle={() => {}}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-y-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-full">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </div>
              <div className="relative inline-block mb-4">
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  كتابي الإلكتروني قريباً
                </h1>
              </div>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                دليل شامل لمرافقتك في رحلة الأمومة بخبرة واهتمام
              </p>
            </div>

            {/* Countdown Card */}
            <Card className="relative bg-white/90 backdrop-blur-md border-0 shadow-2xl p-8 md:p-12 mb-8 overflow-hidden animate-scale-in">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative text-center space-y-8">
                {/* Lock Icon */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-100 via-purple-50 to-purple-100 p-10 rounded-full border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                      <Lock className="w-24 h-24 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">الإطلاق خلال</h2>
                  <p className="text-slate-600 text-lg">استعدي لاكتشاف محتوى حصري ومميز</p>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6 rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {timeLeft.days}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        أيام
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6 rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {timeLeft.hours}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        ساعات
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6 rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {timeLeft.minutes}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        دقائق
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6 rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-pulse">
                        {timeLeft.seconds}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        ثواني
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Message */}
                <div className="relative bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border-2 border-pink-200 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-7 h-7 text-primary animate-pulse" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">قريباً جداً</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-base md:text-lg font-medium">
                    كتابي الإلكتروني الحصري سيكون متاحاً قريباً. ابقي على اتصال حتى لا يفوتك الإطلاق!
                  </p>
                </div>

                {/* Call to Action */}
                <div className="pt-6">
                  <p className="text-slate-600 mb-6 text-lg font-medium">
                    في انتظار الإطلاق، استكشفي مواردنا الأخرى
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <BookOpen className="ml-2 w-5 h-5" />
                      عرض الدورات
                    </Button>
                    <Button 
                      onClick={() => navigate('/blogs')}
                      variant="outline"
                      className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      قراءة المقالات
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>

        {/* Mobile Sidebar */}
        {isMobile && (
          <UserSidebar 
            onSectionSelect={handleSectionSelect}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
      </div>

      <EnhancedFloatingWhatsApp />
    </div>
  );
};

export default Ebook;
