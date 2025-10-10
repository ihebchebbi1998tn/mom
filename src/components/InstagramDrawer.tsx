import { useState, useEffect } from "react";
import { X, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTextDirection, getTextAlignmentClasses } from "@/utils/textAlignment";
import mamanLogo from "@/assets/mamanattention.png";

const InstagramDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      if (window.scrollY > 100 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const openInstagram = () => {
    window.open('https://instagram.com/maman_attentionnee', '_blank');
  };

  return (
    <>
      {/* Sticky Icon */}
      <div className={`fixed left-0 z-50 transition-all duration-300 ${isScrolled ? 'top-16 sm:top-20' : 'top-28 sm:top-36'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-white/90 backdrop-blur-sm border border-white/50 hover:border-white hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
        >
          <img 
            src={mamanLogo} 
            alt="Maman Attentionnée" 
            className="w-12 h-12 mx-auto object-contain group-hover:scale-110 transition-transform duration-300 -mt-1 sm:mt-0"
          />
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-background via-background/95 to-background/90 border-r border-yellow-500/20 shadow-2xl transform transition-all duration-500 ease-out pointer-events-auto ${
            isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}>
            <div className="p-6 h-full flex flex-col">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute left-4 top-4 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300"
              >
                <X className="h-4 w-4 text-yellow-500" />
              </Button>

              {/* Content */}
              <div className="mt-16 text-center flex-1 flex flex-col justify-center animate-scale-in">
                <div className="w-32 h-32 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img 
                    src={mamanLogo} 
                    alt="Maman Attentionnée" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-right bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                  تابعونا على إنستجرام
                </h3>
                <p className="text-muted-foreground mb-8 text-right leading-relaxed">
                  اكتشفوا نصائحنا اليومية للأمهات المتنبهات
                </p>
                
                <Button
                  onClick={openInstagram}
                  className="w-full bg-primary hover:bg-primary-light text-primary-foreground font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group mb-8"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Instagram 
                      size={20}
                      className="text-primary-foreground group-hover:scale-110 transition-transform duration-300"
                    />
                    <span 
                      dir={getTextDirection("@maman_attentionnee")}
                      className={getTextAlignmentClasses("@maman_attentionnee")}
                    >
                      @maman_attentionnee
                    </span>
                  </div>
                </Button>

                {/* Attribution */}
                <div className="mt-auto pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    <span 
                      dir={getTextDirection("تم إنشاء هذا التطبيق بواسطة")}
                      className={getTextAlignmentClasses("تم إنشاء هذا التطبيق بواسطة")}
                    >
                      تم إنشاء هذا التطبيق بواسطة
                    </span>
                    <br />
                    <span className="font-medium text-primary/80">
                      <span 
                        dir={getTextDirection("Marwa Lamir")}
                        className={getTextAlignmentClasses("Marwa Lamir")}
                      >
                        Marwa Lamir
                      </span>
                      {" "}
                      <span 
                        dir={getTextDirection("مروى الأمير")}
                        className={getTextAlignmentClasses("مروى الأمير")}
                      >
                        مروى الأمير
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstagramDrawer;