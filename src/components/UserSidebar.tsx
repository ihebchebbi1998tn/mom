import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, BookOpen, Settings, User, Home, MessageCircle, Phone, Mail, Instagram, Facebook, X, LogOut, Star, Users, Trophy, ThumbsUp, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import CustomCalendar from "./CustomCalendar";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import oldLogo from "@/assets/maman-attentionnee-logo.png";

interface AvailabilityRecord {
  id: number;
  date: string;
  status: 'available' | 'full' | 'unavailable';
  max_reservations: number;
  current_reservations: number;
  notes: string;
}

// Helper function to handle API calls with CORS
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = 'https://spadadibattaglia.com/mom/api/';
  const fullUrl = baseUrl + endpoint;
  
  if (options.method && options.method !== 'GET') {
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error('CORS error: API call blocked. In production this will work.');
    }
  } else {
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

const navigationItems = [
  { title: "لوحة التحكم", url: "/dashboard", icon: BookOpen, badge: null },
  { 
    title: "الباقات التعليمية",
    icon: BookOpen,
    action: "packs",
    className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50"
  },
  {
    title: "الورشات التدريبية", 
    icon: Users,
    action: "workshops",
    className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50"
  },
  {
    title: "الاستشارات",
    icon: MessageCircle,
    action: "consultations", 
    className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50"
  },
  {
    title: "التحديات",
    icon: Trophy,
    action: "challenges",
    className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50"
  },
  {
    title: "الكتاب الإلكتروني",
    icon: BookOpen,
    action: "ebook",
    className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50"
  },
  {
    title: "المدوَّنات", 
    icon: BookOpen,
    action: "blogs",
    className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50"
  },
  { title: "التقييمات", url: "/reviews", icon: ThumbsUp, badge: null, className: "text-pink-600 hover:text-pink-700 hover:bg-pink-50" },
];

const contactItems = [
  {
    title: "واتساب",
    icon: AiOutlineWhatsApp,
    action: () => {
      const message = encodeURIComponent("السلام عليكم، أريد معرفة المزيد عن أكاديمية الأم");
      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
    },
    className: "text-green-600 hover:text-green-700 hover:bg-green-50"
  },
  {
    title: "الهاتف",
    icon: Phone,
    action: () => window.open('tel:+21652451892', '_self'),
    className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  }
];

interface UserSidebarProps {
  onSectionSelect?: (section: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function UserSidebar({ onSectionSelect, isOpen = false, onToggle }: UserSidebarProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  
  // Consultation booking state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [clientName, setClientName] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [availabilities, setAvailabilities] = useState<AvailabilityRecord[]>([]);

  // Fetch availabilities on component mount and when month changes
  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async (month?: number, year?: number) => {
    try {
      let endpoint = 'consultation_availability.php';
      if (month && year) {
        endpoint += `?month=${month}&year=${year}`;
      }
      
      console.log('[Calendar] Fetching availabilities from:', endpoint);
      const data = await apiCall(endpoint);
      console.log('[Calendar] Availability data:', data);
      
      if (data.success) {
        // Transform API data to match our interface
        const transformedData = data.data.map((item: any) => ({
          id: item.id,
          date: item.date,
          status: item.current_reservations >= (item.max_reservations || 3) 
            ? 'full' 
            : item.status || 'available',
          max_reservations: item.max_reservations || 3,
          current_reservations: item.current_reservations || 0,
          notes: item.notes || ''
        }));
        setAvailabilities(transformedData);
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;

  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const availability = availabilities.find(a => a.date === dateStr);
    
    if (availability?.status === 'unavailable') return true;
    if (availability?.status === 'full') return true;
    
    if (availability && availability.current_reservations >= (availability.max_reservations || 3)) {
      return true;
    }
    
    return false;
  };

  const handleBooking = async () => {
    if (!selectedDate || !clientName.trim()) {
      alert("الرجاء اختيار التاريخ وإدخال الاسم");
      return;
    }

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const data = await apiCall('reservations.php', {
        method: 'POST',
        body: JSON.stringify({
          date: formattedDate,
          client_name: clientName.trim(),
          status: 'pending'
        }),
      });

      if (!data.success) {
        alert(`خطأ في الحجز: ${data.message}`);
        return;
      }

      const displayDate = format(selectedDate, "dd/MM/yyyy");
      const message = encodeURIComponent(
        `مرحباً، تم حجز موعد استشارة تربوية:\n\nالاسم: ${clientName}\nالتاريخ المطلوب: ${displayDate}\nرقم الحجز: #${data.id}\n\nشكراً لكم`
      );
      
      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
      
      await fetchAvailabilities();
      
      setIsBookingOpen(false);
      setSelectedDate(undefined);
      setClientName("");
      
      alert("تم حجز الموعد بنجاح! سيتم التواصل معك قريباً");
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert("حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى");
    }
  };

  const handleSignOut = () => {
    // Use AuthContext logout to clear all user data
    logout();
    
    // Navigate to landing page
    navigate('/');
  };
  const handleBookingClick = () => {
    fetchAvailabilities();
    setIsBookingOpen(true);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Consultation Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">حجز موعد استشارة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-3">
              <Label htmlFor="consultation-date" className="text-right block">
                اختر التاريخ المناسب
              </Label>
              <div className="flex justify-center">
                <CustomCalendar
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Disable past dates
                    if (date < today) return true;
                    
                    // Check if date is available
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const availability = availabilities.find(av => av.date === dateStr);
                    
                    // If no specific availability record, check against default limit
                    if (!availability) {
                      const defaultConfig = availabilities.find(av => av.date === '0000-00-00');
                      return false; // Allow booking if no specific restriction
                    }
                    
                    return availability.status === 'unavailable' || 
                           availability.current_reservations >= availability.max_reservations;
                  }}
                  availabilities={availabilities}
                />
              </div>
              
              {selectedDate && (
                <p className="text-sm text-center text-green-600 font-medium">
                  التاريخ المختار: {format(selectedDate, 'dd/MM/yyyy')}
                </p>
              )}
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="client-name" className="text-right block">
                الاسم الكامل
              </Label>
              <Input
                id="client-name"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="text-right"
                dir="rtl"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBookingOpen(false);
                  setSelectedDate(undefined);
                  setClientName("");
                }}
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleBooking}
                disabled={!selectedDate || !clientName.trim()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                تأكيد الحجز
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        w-80 bg-gradient-to-b from-white to-slate-50/80 shadow-xl 
        ${isMobile ? 'border-r' : 'border-r'} border-slate-200/50 
        flex flex-col ${isMobile ? 'h-screen' : 'h-[calc(100vh-80px)]'} transition-transform duration-300 ease-in-out
        ${isMobile ? 'left-0 top-0 z-40' : 'z-10'}
        flex-shrink-0
      `}>
        {/* Professional Sidebar Header */}
        <div className="border-b border-slate-200/50 p-4 bg-gradient-to-r from-blue-50 to-purple-50/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
                alt="أكاديمية الأم" 
                className="w-10 h-10 rounded-xl object-contain shadow-lg bg-white p-1"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">مرحباً بك</h3>
                <p className="text-sm text-slate-600 font-medium">أكاديمية الأم</p>
              </div>
            </div>
            {/* Close button for mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="px-2 py-1 flex-1 flex flex-col overflow-y-auto overscroll-contain">
          {/* Enhanced Navigation */}
          <div className="py-2 flex-shrink-0">
            <div className="text-xs font-bold text-slate-700 px-2 mb-2 uppercase tracking-wider">
              التنقل الرئيسي
            </div>
            <div>
              <div className="space-y-0.5">
                {navigationItems.map((item, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        // Close sidebar on mobile when navigating
                        if (isMobile && onToggle) {
                          onToggle();
                        }
                        
                        if (item.url) {
                          navigate(item.url);
                        } else if (item.action) {
                          if (onSectionSelect) {
                            onSectionSelect(item.action);
                          } else {
                            // Handle navigation when no onSectionSelect is provided
                            switch (item.action) {
                              case 'packs':
                                navigate('/?tab=packs');
                                break;
                              case 'workshops':
                                navigate('/?tab=workshops');
                                break;
                              case 'consultations':
                                handleBookingClick();
                                break;
                              case 'challenges':
                                navigate('/challenges');
                                break;
                              case 'ebook':
                                navigate('/ebook');
                                break;
                              case 'blogs':
                                navigate('/blogs');
                                break;
                              default:
                                console.warn(`No navigation defined for action: ${item.action}`);
                            }
                          }
                        }
                      }}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 font-medium text-sm ${
                        item.url && isActive(item.url)
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md transform scale-[1.02]"
                          : item.className || "hover:bg-pink-50 text-slate-700 hover:text-pink-700"
                      }`}
                    >
                      <div className={`p-1 rounded-md ${
                        item.url && isActive(item.url) 
                          ? "bg-white/20" 
                          : "bg-white shadow-sm"
                      }`}>
                        <item.icon className="h-3 w-3 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between flex-1">
                        <span 
                          className={`font-semibold text-xs ${getTextAlignmentClasses(item.title)} ${getContainerDirection(item.title)}`}
                          dir={getTextDirection(item.title)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <div className="text-xs px-1.5 py-0.5 bg-white/90 text-pink-700 font-semibold rounded">
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="my-1 bg-slate-200 h-px" />

          {/* Enhanced Contact & Support */}
          <div className="py-1 flex-shrink-0" >
            <div className="text-xs font-bold text-slate-700 px-2 mb-2 uppercase tracking-wider">
              تواصل معنا
            </div>
            <div>
              <div className="space-y-0.5">
                {contactItems.map((contact, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        contact.action();
                        // Close sidebar on mobile after contact action
                        if (isMobile && onToggle) {
                          onToggle();
                        }
                      }}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 font-medium text-sm border border-transparent hover:shadow-sm ${contact.className} hover:bg-pink-50 hover:border-pink-200`}
                    >
                      <div className="p-1 bg-white rounded-md shadow-sm">
                        <contact.icon className="h-3 w-3 flex-shrink-0" />
                      </div>
                      <span 
                        className={`font-semibold text-xs ${getTextAlignmentClasses(contact.title)} ${getContainerDirection(contact.title)}`}
                        dir={getTextDirection(contact.title)}
                        style={{ unicodeBidi: 'plaintext' }}
                      >
                        {contact.title}
                      </span>
                    </button>
                  </div>
                ))}
                
                {/* Logout Button */}
                <div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      if (isMobile && onToggle) {
                        onToggle();
                      }
                    }}
                    className="flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-md hover:shadow-lg text-xs mt-2"
                  >
                    <div className="p-0.5 bg-white/20 rounded-md">
                      <LogOut className="w-3 h-3 flex-shrink-0" />
                    </div>
                    <span className="font-medium text-right text-xs">
                      تسجيل الخروج
                    </span>
                  </button>
                </div>
                
                {/* Made with love */}
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <p className="text-center text-xs text-slate-500">
                    تم تطوير التطبيق بحب من قبل 💕<br />
                    <span className="text-pink-600 font-medium" dir="ltr">@maman_attentionnee</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}