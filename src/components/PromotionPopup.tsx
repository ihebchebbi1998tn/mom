import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Pack {
  id: number;
  title: string;
  image_url: string;
  price: string;
}

interface Promotion {
  id: number;
  pack_ids: number[];
  discount_percentage: number;
  end_date: string;
  is_active: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const PromotionPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [pack, setPack] = useState<Pack | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchPromotionData = async () => {
      try {
        // Fetch active promotions
        const promotionsResponse = await fetch("https://spadadibattaglia.com/mom/api/promotions.php");
        const promotionsData = await promotionsResponse.json();
        
        if (promotionsData.success && promotionsData.promotions?.length > 0) {
          const activePromotion = promotionsData.promotions.find((p: Promotion) => p.is_active);
          
          if (activePromotion) {
            setPromotion(activePromotion);
            
            // Fetch packs to get the image
            const packsResponse = await fetch("https://spadadibattaglia.com/mom/api/course_packs.php");
            const packsData = await packsResponse.json();
            
            if (packsData.success) {
              const relatedPack = packsData.data.find((p: Pack) => 
                activePromotion.pack_ids.includes(p.id)
              );
              
              if (relatedPack) {
                setPack(relatedPack);
                setIsOpen(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching promotion data:", error);
      }
    };

    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem("hasSeenPromotionPopup");
    if (!hasSeenPopup) {
      fetchPromotionData();
    }
  }, []);

  useEffect(() => {
    if (!promotion) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(promotion.end_date).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [promotion]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenPromotionPopup", "true");
  };

  if (!promotion || !pack) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20 max-h-[95vh] overflow-y-auto">
        <div className="relative">
          {/* Pack Image */}
          <div className="relative h-48 sm:h-64 overflow-hidden">
            <img
              src={pack.image_url}
              alt={pack.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Discount Badge */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-destructive text-destructive-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg animate-pulse">
            <span className="text-2xl sm:text-3xl font-bold" dir="ltr">-{Math.round(promotion.discount_percentage)}%</span>
            <span className="text-xs sm:text-sm block" dir="rtl">خصم</span>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold" dir="rtl">
                {pack.title} <span dir="ltr">Pack</span>
              </h3>
              <p className="text-lg sm:text-xl font-semibold text-primary" dir="rtl">
                عرض خاص محدود!
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-primary/20">
              <p className="text-center text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3" dir="rtl">
                ينتهي العرض خلال
              </p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{timeLeft.days}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground" dir="rtl">يوم</span>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{timeLeft.hours}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground" dir="rtl">ساعة</span>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{timeLeft.minutes}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground" dir="rtl">دقيقة</span>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{timeLeft.seconds}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground" dir="rtl">ثانية</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              className="w-full bg-primary text-primary-foreground py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              dir="rtl"
            >
              احصل على العرض الآن!
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
