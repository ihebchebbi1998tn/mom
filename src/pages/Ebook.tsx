import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, ArrowRight, Menu, BookOpen, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import mamanCircle from "@/assets/maman-attentionnee-circle.png";
const Ebook = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
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
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
          minutes: Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
          seconds: Math.floor(distance % (1000 * 60) / 1000)
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
  return <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleBackToDashboard} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2">
                <ArrowRight className="w-4 h-4" />
              </Button>
              {/* Mobile Menu Button */}
              {isMobile && <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-pink-50 rounded-xl transition-colors duration-200">
                  <Menu className="w-5 h-5" />
                </Button>}
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
        {!isMobile && <UserSidebar onSectionSelect={handleSectionSelect} isOpen={true} onToggle={() => {}} />}

        {/* Content Area */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-y-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            

            {/* Countdown Card */}
            <Card className="relative bg-white/90 backdrop-blur-md border-0 shadow-2xl p-4 sm:p-6 md:p-12 mb-8 overflow-hidden animate-scale-in">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative text-center space-y-6 sm:space-y-8">
                {/* Lock Icon */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      <img src={mamanCircle} alt="Maman Attentionnée" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Lock className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white drop-shadow-lg animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">الإطلاق خلال</h2>
                  <p className="text-slate-600 text-base sm:text-lg">استعدي لاكتشاف محتوى حصري ومميز</p>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-3xl mx-auto px-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 leading-none flex items-center justify-center min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3.5rem]">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        أيام
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 leading-none flex items-center justify-center min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3.5rem]">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        ساعات
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 leading-none flex items-center justify-center min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3.5rem]">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        دقائق
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-pink-100 transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 animate-pulse leading-none flex items-center justify-center min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3.5rem]">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        ثواني
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Message */}
                <div className="relative bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border-2 border-pink-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary animate-pulse" />
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">قريباً جداً</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base md:text-lg font-medium">
                    كتابي الإلكتروني الحصري سيكون متاحاً قريباً. ابقي على اتصال حتى لا يفوتك الإطلاق!
                  </p>
                </div>

                {/* Call to Action */}
                <div className="pt-4 sm:pt-6">
                  <p className="text-slate-600 mb-4 sm:mb-6 text-base sm:text-lg font-medium px-2">
                    في انتظار الإطلاق، استكشفي مواردنا الأخرى
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                    <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                      <BookOpen className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      عرض الدورات
                    </Button>
                    <Button onClick={() => navigate('/blogs')} variant="outline" className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                      قراءة المقالات
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>

        {/* Mobile Sidebar */}
        {isMobile && <UserSidebar onSectionSelect={handleSectionSelect} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}
      </div>

      <EnhancedFloatingWhatsApp />
    </div>;
};
export default Ebook;