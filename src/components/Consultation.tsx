
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar as CalendarIcon, CheckCircle, ArrowLeft, Clock, Phone, Users, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CustomCalendar from "./CustomCalendar";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
    // For POST/PUT/DELETE, try direct call first (production will work)
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

const Consultation = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [clientName, setClientName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availabilities, setAvailabilities] = useState<AvailabilityRecord[]>([]);

  useEffect(() => {
    // Fetch availabilities when component mounts to ensure calendar shows availability data
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      console.log('Consultation: Attempting to fetch availabilities');
      const data = await apiCall('consultation_availability.php');
      console.log('Consultation: Response data:', data);
      
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

  const handleBooking = async () => {
    if (!selectedDate || !clientName.trim()) {
      alert("الرجاء اختيار التاريخ وإدخال الاسم");
      return;
    }

    // Check if date still has available slots
    if (getRemainingSlots(selectedDate) === 0) {
      alert("عذراً، لا توجد مواعيد متاحة في هذا التاريخ");
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
        }),
      });

      if (!data.success) {
        alert(`خطأ في الحجز: ${data.message}`);
        return;
      }

      // If reservation was saved successfully, open WhatsApp
      const displayDate = format(selectedDate, "dd/MM/yyyy");
      const message = encodeURIComponent(
        `مرحباً، تم حجز موعد استشارة تربوية:\n\nالاسم: ${clientName}\nالتاريخ المطلوب: ${displayDate}\nرقم الحجز: #${data.id}\n\nشكراً لكم`
      );
      
      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
      
      // Refresh availabilities to update the calendar
      await fetchAvailabilities();
      
      setIsDialogOpen(false);
      setSelectedDate(undefined);
      setClientName("");
      
      alert("تم حجز الموعد بنجاح! سيتم التواصل معك قريباً");
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert("حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى");
    }
  };

  const benefits = ["استشارة شخصية مع خبيرة في التربية", "تقييم شامل لحالة الطفل", "خطة عملية مخصصة لحالتك", "متابعة ودعم مستمر"];
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  return (
    <section id="consultation" className="py-20 section-gradient" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              // Navigate back to dashboard - assuming this component will be used in a router context
              if (typeof window !== 'undefined' && window.history) {
                window.history.back();
              }
            }}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للقائمة
          </Button>
        </div>
        
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            إستشارات تربوية متخصصة
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl font-semibold text-primary mb-4">
              "حاج إستشارة تربوية"
            </p>
            <p className="text-lg text-muted-foreground">
              استشارة شخصية مع خبيرة التربية لحل التحديات مع أطفالك
            </p>
          </div>
        </div>

        <div className={`max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Simple Book Now Button */}
          <div className="text-center">
            <div className="card-elegant p-8">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">احجزي استشارتك الآن</h3>
              <p className="text-muted-foreground mb-6">
                احجزي موعد استشارة شخصية مع خبيرة التربية
              </p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-hero">
                    احجزي الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-auto my-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-right text-lg sm:text-xl">حجز موعد استشارة</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 sm:space-y-6 py-2">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-right block text-sm font-medium">الاسم</Label>
                      <Input
                        id="name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="أدخلي اسمك"
                        className="text-right h-11 text-base"
                      />
                    </div>

                    {/* Calendar */}
                    <div className="space-y-3">
                      <Label className="text-right block text-sm font-medium">اختاري تاريخ الموعد</Label>
                       <div className="border rounded-lg p-3 bg-card shadow-inner flex justify-center items-center">
                         <div className="max-w-sm">
                           <Calendar
                             mode="single"
                             selected={selectedDate}
                             onSelect={setSelectedDate}
                             disabled={isDateDisabled}
                             className="pointer-events-auto mx-auto bg-card text-card-foreground [&_.rdp-caption]:text-foreground [&_.rdp-head_cell]:text-foreground [&_.rdp-button]:text-foreground [&_.rdp-day]:font-medium"
                            dir="ltr"
                            style={{ direction: 'ltr' }}
                            modifiers={{
                              available: (date) => !isDateDisabled(date) && getRemainingSlots(date) > 0,
                              limited: (date) => !isDateDisabled(date) && getRemainingSlots(date) <= 2 && getRemainingSlots(date) > 0
                            }}
                            modifiersStyles={{
                              available: { backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: '600' },
                              limited: { backgroundColor: '#fef3c7', color: '#d97706', fontWeight: '600' }
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
                      onClick={handleBooking} 
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
          </div>

          {/* Benefits Section */}
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold text-foreground mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>ما تشمله الاستشارة</h3>
            <div className="space-y-4">
              <div className={`flex items-start gap-4 p-4 bg-white/50 rounded-lg transition-all duration-1000 hover:scale-105 hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">استشارة شخصية مخصصة</h4>
                  <p className="text-muted-foreground text-sm">جلسة فردية مع خبيرة التربية</p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 bg-white/50 rounded-lg transition-all duration-1000 hover:scale-105 hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: isVisible ? '750ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">45 دقيقة</h4>
                  <p className="text-muted-foreground text-sm">مناقشة مفصلة وحلول عملية</p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 bg-white/50 rounded-lg transition-all duration-1000 hover:scale-105 hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: isVisible ? '900ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">متابعة مجانية</h4>
                  <p className="text-muted-foreground text-sm">متابعة عبر واتساب خلال أسبوع</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultation;
