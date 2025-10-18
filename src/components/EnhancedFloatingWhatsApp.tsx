import { AiOutlineWhatsApp } from "react-icons/ai";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

const EnhancedFloatingWhatsApp = () => {
  const [showPulse, setShowPulse] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("السلام عليكم، أريد معرفة المزيد عن أكاديمية الأم");
    const phoneNumber = "21652451892";
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Popup Indicator */}
      <div className={`absolute -top-16 right-0 bg-white rounded-xl shadow-lg px-4 py-3 transition-all duration-300 ${showPulse ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-sm font-medium text-foreground whitespace-nowrap">
          محتاجة أي مساعدة؟ تواصلي معي!
        </div>
        <div className="absolute bottom-0 right-6 transform translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
        </div>
      </div>

      <div className="relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -left-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 shadow-md transition-colors duration-200 z-10"
          aria-label="إغلاق"
        >
          <X className="w-3 h-3" />
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group hover:scale-105"
          aria-label="تواصلي معنا عبر واتساب"
        >
          {/* Pulse Animation Ring */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          
          <AiOutlineWhatsApp className="w-7 h-7 relative z-10" />
          
          {/* Professional tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-foreground text-background text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            تواصلي معنا
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default EnhancedFloatingWhatsApp;