import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { BookOpen, Clock, Users, Star, ArrowLeft, ShoppingCart, CheckCircle, Loader2, Eye, PlayCircle, TrendingUp, Award, Target, Calendar, CalendarIcon, MessageSquare, Phone, LogOut, MapPin, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLanding from "@/components/MobileLanding";
import ModernVideoModal from "@/components/ModernVideoModal";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection, hasArabicCharacters, getNameDirection } from "@/utils/textAlignment";

interface CoursePack {
  id: string;
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

interface UserRequest {
  id: string;
  user_id: string;
  pack_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes?: string;
  created_at: string;
  admin_response_date?: string;
}

interface SubPack {
  id: string;
  pack_id: string;
  title: string;
  description?: string;
  order_index: number;
  status: string;
  videos?: Video[];
}

interface Video {
  id: string;
  sub_pack_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
}

interface Workshop {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  next_date: string;
  location: string;
  highlights: string[];
  price: number;
  image_url?: string;
  max_participants: number;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
}

interface AvailabilityRecord {
  id: number;
  date: string;
  status: 'available' | 'full' | 'unavailable';
  max_reservations: number;
  current_reservations: number;
  notes: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [coursePacks, setCoursePacks] = useState<CoursePack[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [currentView, setCurrentView] = useState<'packs' | 'subpacks' | 'videos' | 'workshops'>('packs');
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<CoursePack | null>(null);
  const [selectedSubPack, setSelectedSubPack] = useState<SubPack | null>(null);
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [packSubPacks, setPackSubPacks] = useState<{ [packId: string]: SubPack[]; }>({});
  const [showMobileLanding, setShowMobileLanding] = useState(true);

  // Consultation modal state
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [clientName, setClientName] = useState("");
  const [availabilities, setAvailabilities] = useState<AvailabilityRecord[]>([]);

  // Video modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string, poster?: string} | null>(null);

  // Get current user ID from auth context
  const currentUserId = user?.id || null;

  useEffect(() => {
    fetchCoursePacks();
    fetchWorkshops();
    fetchUserRequests();
    fetchAvailabilities();
  }, []);

  // Fetch sub-packs for each course pack to show in preview
  useEffect(() => {
    const fetchAllSubPacks = async () => {
      const subPacksData: { [packId: string]: SubPack[]; } = {};
      for (const pack of coursePacks) {
        try {
          const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?pack_id=${pack.id}`);
          const data = await response.json();
          if (data.success) {
            subPacksData[pack.id] = data.data;
          }
        } catch (error) {
          console.error(`Failed to fetch sub-packs for pack ${pack.id}:`, error);
        }
      }
      setPackSubPacks(subPacksData);
    };
    if (coursePacks.length > 0) {
      fetchAllSubPacks();
    }
  }, [coursePacks]);

  const fetchCoursePacks = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php');
      const data = await response.json();
      if (data.success) {
        setCoursePacks(data.data);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحميل الباقات",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshops.php');
      const data = await response.json();
      if (data.success && data.workshops) {
        // Filter only active workshops
        const activeWorkshops = data.workshops.filter((workshop: Workshop) => workshop.status === 'active');
        setWorkshops(activeWorkshops);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/requests.php?user_id=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setUserRequests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user requests:', error);
    }
  };

  // Video modal handlers
  const handleVideoClick = (video: Video) => {
    if (video.video_url.toLowerCase().endsWith('.mp4')) {
      setSelectedVideo({
        url: video.video_url,
        title: video.title,
        poster: video.thumbnail_url
      });
      setIsVideoModalOpen(true);
    } else {
      window.open(video.video_url, '_blank');
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const fetchSubPacks = async (packId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?pack_id=${packId}`);
      const data = await response.json();
      if (data.success) {
        setSubPacks(data.data);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحميل الفصول",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (subPackId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?id=${subPackId}`);
      const data = await response.json();
      if (data.success && data.data.videos) {
        setVideos(data.data.videos);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحميل الفيديوهات",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseRequest = async (packId: string) => {
    setActionLoading(packId);
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/requests.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUserId,
          pack_id: packId
        })
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "تم إرسال طلب الشراء",
          description: "سيتم مراجعة طلبك من قبل الإدارة قريباً"
        });

        // Refresh user requests
        fetchUserRequests();
      } else {
        toast({
          title: "خطأ",
          description: data.message || "فشل في إرسال طلب الشراء",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getPackRequestStatus = (packId: string) => {
    const request = userRequests.find(req => req.pack_id === packId);
    return request?.status || null;
  };

  const handlePackClick = (pack: CoursePack) => {
    const status = getPackRequestStatus(pack.id);
    if (status === 'accepted') {
      setSelectedPack(pack);
      setCurrentView('subpacks');
      fetchSubPacks(pack.id);
    } else if (status === 'pending') {
      toast({
        title: "طلب قيد المراجعة",
        description: "طلبك قيد المراجعة من قبل الإدارة"
      });
    } else {
      // Just show pack details instead of auto-requesting
      toast({
        title: "باقة غير مُفعلة",
        description: "اطلبي الباقة أولاً للوصول إلى المحتوى"
      });
    }
  };

  const handlePurchaseClick = (pack: CoursePack) => {
    handlePurchaseRequest(pack.id);
  };

  const handleSubPackClick = (subPack: SubPack) => {
    setSelectedSubPack(subPack);
    setCurrentView('videos');
    fetchVideos(subPack.id);
  };

  const handleBackToMain = () => {
    setCurrentView('packs');
    setSelectedPack(null);
    setSelectedSubPack(null);
    if (isMobile) {
      setShowMobileLanding(true);
    }
  };

  const handleBackToSubPacks = () => {
    setCurrentView('subpacks');
    setSelectedSubPack(null);
  };

  const handleSectionSelect = (section: string) => {
    if (section === 'packs') {
      if (isMobile) {
        setShowMobileLanding(false);
      }
      setCurrentView('packs');
    } else if (section === 'consultations') {
      setIsConsultationOpen(true);
    } else if (section === 'reviews') {
      navigate('/reviews');
  } else if (section === 'workshops') {
    navigate('/workshops');
  } else if (section === 'specialized-courses') {
      navigate('/specialized-courses');
    } else if (section === 'challenges') {
      navigate('/challenges');
    } else if (section === 'blogs') {
      navigate('/blogs');
    } else {
      // For other sections, you can navigate to different pages or show different content
      toast({
        title: "قريباً",
        description: "هذا القسم قيد التطوير"
      });
    }
  };

  const renderPackButton = (pack: CoursePack) => {
    const status = getPackRequestStatus(pack.id);
    const isLoading = actionLoading === pack.id;
    if (isLoading) {
      return <Button disabled className="btn-hero w-full rounded-full">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          جاري المعالجة...
        </Button>;
    }
    switch (status) {
      case 'accepted':
        return <Button onClick={() => handlePackClick(pack)} className="btn-hero w-full rounded-full">
            دخول للباقة
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>;
      case 'pending':
        return <Button variant="outline" className="w-full rounded-full border-yellow-500 text-yellow-600 hover:bg-yellow-50" disabled>
            <Clock className="w-4 h-4 mr-2" />
            قيد المراجعة
          </Button>;
      case 'rejected':
        return <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="btn-secondary w-full rounded-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                شراء مجدداً
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الشراء</AlertDialogTitle>
                <AlertDialogDescription>
                  هل ترغبين في إرسال طلب شراء هذه الباقة؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => handlePurchaseClick(pack)}>
                  نعم، تأكيد الطلب
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>;
      default:
        return <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="btn-secondary w-full rounded-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                شراء الآن
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الشراء</AlertDialogTitle>
                <AlertDialogDescription>
                  هل ترغبين في إرسال طلب شراء هذه الباقة؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => handlePurchaseClick(pack)}>
                  نعم، تأكيد الطلب
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>;
    }
  };

  // Helper function to handle API calls with CORS
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = 'https://spadadibattaglia.com/mom/api/';
    const fullUrl = baseUrl + endpoint;
    if (options.method && options.method !== 'GET') {
      // For POST/PUT/DELETE, try direct call first (production will work)
      try {
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        return await response.json();
      } catch (error) {
        // If direct call fails (CORS issue in development), show error
        throw new Error('CORS error: API call blocked. In production this will work.');
      }
    } else {
      // For GET requests, use CORS proxy
      try {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(fullUrl));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const proxyData = await response.json();
        return JSON.parse(proxyData.contents);
      } catch (error) {
        throw error;
      }
    }
  };

  const fetchAvailabilities = async () => {
    try {
      console.log('Dashboard: Attempting to fetch availabilities');
      const data = await apiCall('consultation_availability.php');
      console.log('Dashboard: Response data:', data);
      if (data.success) {
        setAvailabilities(data.data);
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true;
    const dateStr = format(date, 'yyyy-MM-dd');
    const availability = availabilities.find(a => a.date === dateStr);

    // Check if date is explicitly unavailable
    if (availability?.status === 'unavailable') return true;
    if (availability?.status === 'full') return true;

    // Check against specific availability settings or default
    const maxAllowed = availability?.max_reservations || 8; // Use default from backend
    const currentCount = availability?.current_reservations || 0;

    // Disable if reservations are full
    if (currentCount >= maxAllowed) {
      return true;
    }
    return false;
  };

  const getRemainingSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const availability = availabilities.find(a => a.date === dateStr);
    if (!availability) {
      return 8; // Default max reservations
    }
    const maxAllowed = availability.max_reservations || 8;
    const currentCount = availability.current_reservations || 0;
    return Math.max(0, maxAllowed - currentCount);
  };

  const handleConsultationBooking = async () => {
    if (!selectedDate || !clientName.trim()) {
      toast({
        title: "معلومات ناقصة",
        description: "الرجاء اختيار التاريخ وإدخال الاسم",
        variant: "destructive"
      });
      return;
    }

    // Check if date still has available slots
    if (getRemainingSlots(selectedDate) === 0) {
      toast({
        title: "لا توجد مواعيد متاحة",
        description: "عذراً، لا توجد مواعيد متاحة في هذا التاريخ",
        variant: "destructive"
      });
      return;
    }
    try {
      // Save reservation to database first
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const data = await apiCall('reservations.php', {
        method: 'POST',
        body: JSON.stringify({
          date: formattedDate,
          client_name: clientName.trim(),
          status: 'pending'
        })
      });
      if (!data.success) {
        toast({
          title: "خطأ في الحجز",
          description: data.message || "فشل في حجز الموعد",
          variant: "destructive"
        });
        return;
      }

      // If reservation was saved successfully, open WhatsApp
      const displayDate = format(selectedDate, "dd/MM/yyyy");
      const message = encodeURIComponent(`مرحباً، تم حجز موعد استشارة تربوية:\n\nالاسم: ${clientName}\nالتاريخ المطلوب: ${displayDate}\nرقم الحجز: #${data.id}\n\nشكراً لكم`);
      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');

      // Refresh availabilities to update the calendar
      await fetchAvailabilities();
      setIsConsultationOpen(false);
      setSelectedDate(undefined);
      setClientName("");
      toast({
        title: "تم الحجز بنجاح",
        description: "تم حجز الموعد بنجاح! سيتم التواصل معك قريباً"
      });
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast({
        title: "خطأ في الحجز",
        description: "حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-accent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header - Full Width */}
      <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
              <div className="flex-1 min-w-0">
                <h1 
                  className="text-base sm:text-lg font-semibold text-slate-800 truncate"
                  dir={getNameDirection(user?.name || "")}
                  style={{ 
                    textAlign: hasArabicCharacters(user?.name || "") ? 'right' : 'left',
                    unicodeBidi: 'plaintext' 
                  }}
                >
                  مرحباً {user?.name} 💕
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">أكاديمية الأم المتخصصة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              
              {/* Back Arrow - Show when not on main packs view */}
              {currentView !== 'packs' && !showMobileLanding && (
                <Button
                  size="sm"
                  onClick={currentView === 'videos' ? handleBackToSubPacks : handleBackToMain}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl p-2.5 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">عودة</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout - Content + Sidebar Side by Side */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Content Area - Left Side */}
        <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 lg:py-8 transition-all duration-200 overflow-x-hidden overflow-y-auto">
          {/* Mobile Landing Screen OR Desktop Content */}
          {isMobile && showMobileLanding ? (
            <MobileLanding onSectionSelect={handleSectionSelect} />
          ) : (
            <>
              {/* Professional Breadcrumb */}
              {!isMobile && currentView !== 'packs' && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-8 px-4 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-slate-200/50">
                  <button onClick={handleBackToMain} className="hover:text-slate-900 transition-colors font-medium">
                    الباقات التعليمية
                  </button>
                  {selectedPack && (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-900 font-medium">{selectedPack.title}</span>
                    </>
                  )}
                  {selectedSubPack && (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-900 font-medium">{selectedSubPack.title}</span>
                    </>
                  )}
                </div>
              )}

              {/* Course Packs View - Enhanced Professional Design */}
              {currentView === 'packs' && (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">الدورات المتخصصة</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      اختاري الباقة التعليمية التي تناسب احتياجاتك وابدئي رحلة التطوير والنمو المهني
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {coursePacks.map(pack => {
                      const packSubPacksList = packSubPacks[pack.id] || [];
                      const status = getPackRequestStatus(pack.id);
                      return (
                        <Card key={pack.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
                          {/* Enhanced Pack Image */}
                          <div className="relative overflow-hidden">
                            {pack.image_url ? (
                              <img src={pack.image_url} alt={pack.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                <BookOpen className="w-16 h-16 text-white" />
                              </div>
                            )}
                            
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                              {status === 'accepted' && (
                                <div className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  مُفعلة
                                </div>
                              )}
                              {status === 'pending' && (
                                <div className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  قيد المراجعة
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-6 lg:p-8">
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {pack.title}
                              </h3>
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-semibold text-yellow-700">{pack.rating}</span>
                              </div>
                            </div>
                            
                            {pack.description && (
                              <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                                {pack.description}
                              </p>
                            )}
                            
                            {/* Enhanced Stats */}
                            <div className="flex items-center justify-between text-sm text-slate-500 mb-6 p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{pack.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{pack.students}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{packSubPacksList.length} فصل</span>
                              </div>
                            </div>

                            {/* Enhanced Modules Preview */}
                            <div className="space-y-3 mb-6">
                              <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-500" />
                                محتوى الباقة:
                              </div>
                              <div className="space-y-2">
                                {packSubPacksList.slice(0, 3).map((subPack, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {idx + 1}
                                    </div>
                                    <span className="text-slate-700 text-sm font-medium">{subPack.title}</span>
                                  </div>
                                ))}
                                {packSubPacksList.length > 3 && (
                                  <div className="text-sm text-slate-500 text-center py-2">
                                    +{packSubPacksList.length - 3} فصول إضافية
                                  </div>
                                )}
                                {packSubPacksList.length === 0 && (
                                  <div className="text-slate-400 text-sm text-center py-4 italic">
                                    سيتم إضافة المحتوى قريباً
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {renderPackButton(pack)}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Enhanced Sub-Packs View */}
              {currentView === 'subpacks' && selectedPack && (
                <>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-4">
                      <BookOpen className="w-4 h-4" />
                      فصول الباقة
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                      فصول {selectedPack.title}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      اختاري الفصل الذي تريدين مشاهدة محتواه التعليمي
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {subPacks.map((subPack, index) => (
                      <Card key={subPack.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white" onClick={() => handleSubPackClick(subPack)}>
                        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-8 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                <span className="font-bold text-xl">{index + 1}</span>
                              </div>
                              <Eye className="w-6 h-6 opacity-75 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold leading-tight">{subPack.title}</h3>
                          </div>
                        </div>
                        
                        <div className="p-6 lg:p-8">
                          {subPack.description && (
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                              {subPack.description}
                            </p>
                          )}
                          
                          <Button className="btn-hero w-full h-12 font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02]">
                            مشاهدة المحتوى
                            <PlayCircle className="w-5 h-5 mr-2" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Enhanced Videos View */}
              {currentView === 'videos' && selectedSubPack && (
                <>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
                      <PlayCircle className="w-4 h-4" />
                      المحتوى التعليمي
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                      فيديوهات {selectedSubPack.title}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      شاهدي جميع الفيديوهات التعليمية لهذا الفصل واستفيدي من المحتوى القيم
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {videos.map((video, index) => (
                      <Card key={video.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white">
                        <div className="relative overflow-hidden">
                          {video.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title} 
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <PlayCircle className="w-16 h-16 text-white" />
                            </div>
                          )}
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <PlayCircle className="w-8 h-8 text-pink-600" />
                            </div>
                          </div>
                          
                          {/* Video Number Badge */}
                          <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            {index + 1}
                          </div>

                          {video.duration && (
                            <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                              {video.duration}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">
                            {video.title}
                          </h3>
                          
                          {video.description && (
                            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                          
                          <Button 
                            onClick={() => handleVideoClick(video)}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                          >
                            مشاهدة الفيديو
                            <PlayCircle className="w-4 h-4 mr-2" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Enhanced Workshops View */}
              {currentView === 'workshops' && (
                <>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                      <Users className="w-4 h-4" />
                      الورشات التدريبية
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">الورشات المتاحة</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      انضمي إلى ورشاتنا التفاعلية واكتسبي مهارات جديدة مع مجتمع من الأمهات المتميزات
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {workshops.map((workshop, index) => (
                      <Card key={workshop.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white">
                        <div className="relative overflow-hidden">
                          {workshop.image_url ? (
                            <img 
                              src={workshop.image_url} 
                              alt={workshop.title} 
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <Users className="w-16 h-16 text-white" />
                            </div>
                          )}
                          
                          {/* Workshop Type Badge */}
                          <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                            {workshop.type}
                          </div>
                        </div>
                        
                        <div className="p-6 lg:p-8 flex flex-col h-full">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                              {workshop.title}
                            </h3>
                            
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                              {workshop.description}
                            </p>
                            
                            {/* Workshop Details */}
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{workshop.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{format(new Date(workshop.next_date), 'dd/MM/yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{workshop.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Users className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">
                                  {workshop.max_participants} مشارك كحد أقصى
                                </span>
                              </div>
                            </div>

                            {/* Workshop Highlights */}
                            {workshop.highlights && workshop.highlights.length > 0 && (
                              <div className="space-y-2 mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  أبرز النقاط:
                                </h4>
                                <ul className="space-y-1">
                                  {workshop.highlights.slice(0, 3).map((highlight, idx) => (
                                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span>{highlight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Price Badge */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="text-lg font-bold text-slate-900">
                                {workshop.price > 0 ? `${workshop.price} د.ت` : 'مجاني'}
                              </div>
                              <div className="text-sm text-slate-500 font-medium">
                                ورشة {workshop.type}
                              </div>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <Button className="w-full mt-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => {
                            const message = encodeURIComponent(`أريد التسجيل في ${workshop.title}`);
                            window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                          }}>
                            احجزي مقعدك الآن
                            <ArrowLeft className="w-4 h-4 mr-2" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Video Modal */}
          {selectedVideo && (
            <ModernVideoModal
              isOpen={isVideoModalOpen}
              onClose={handleCloseVideoModal}
              videoUrl={selectedVideo.url}
              title={selectedVideo.title}
              poster={selectedVideo.poster}
            />
          )}
        </main>

        {/* Sidebar - Right Side */}
        <UserSidebar 
          onSectionSelect={handleSectionSelect}
          isOpen={isMobile ? isSidebarOpen : true}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Enhanced WhatsApp Widget */}
      <EnhancedFloatingWhatsApp />

      {/* Consultation Booking Dialog */}
      <Dialog open={isConsultationOpen} onOpenChange={setIsConsultationOpen}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-auto my-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-right text-lg sm:text-xl">حجز موعد استشارة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="consultation-name" className="text-right block text-sm font-medium">الاسم</Label>
              <Input 
                id="consultation-name" 
                value={clientName} 
                onChange={e => setClientName(e.target.value)} 
                placeholder="أدخلي اسمك" 
                className="text-right h-11 text-base" 
              />
            </div>

            {/* Calendar */}
            <div className="space-y-3">
              <Label className="text-right block text-sm font-medium">اختاري تاريخ الموعد</Label>
              <div className="border rounded-lg p-3 bg-card shadow-inner flex justify-center items-center">
                <div className="w-full max-w-sm mx-auto">
                  <CalendarComponent 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={setSelectedDate} 
                    disabled={isDateDisabled} 
                    className="w-full pointer-events-auto mx-auto bg-card text-card-foreground [&_.rdp-caption]:text-foreground [&_.rdp-head_cell]:text-foreground [&_.rdp-button]:text-foreground [&_.rdp-day]:font-medium" 
                    dir="ltr" 
                    style={{ direction: 'ltr' }} 
                    modifiers={{
                      available: date => !isDateDisabled(date) && getRemainingSlots(date) > 0,
                      limited: date => !isDateDisabled(date) && getRemainingSlots(date) <= 2 && getRemainingSlots(date) > 0
                    }} 
                    modifiersStyles={{
                      available: {
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        fontWeight: '600'
                      },
                      limited: {
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        fontWeight: '600'
                      }
                    }} 
                  />
                </div>
              </div>
              
              {selectedDate && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    التاريخ المختار: {format(selectedDate, 'dd/MM/yyyy')}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">
                      {getRemainingSlots(selectedDate)} مواعيد متاحة
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Button */}
            <Button 
              onClick={handleConsultationBooking} 
              disabled={!selectedDate || !clientName.trim() || getRemainingSlots(selectedDate || new Date()) === 0} 
              className="w-full btn-hero h-12 text-base"
            >
              {!selectedDate || !clientName.trim() 
                ? 'يرجى اختيار التاريخ وإدخال الاسم' 
                : getRemainingSlots(selectedDate || new Date()) === 0 
                  ? 'لا توجد مواعيد متاحة في هذا التاريخ' 
                  : 'تأكيد الحجز'
              }
              <CalendarIcon className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;