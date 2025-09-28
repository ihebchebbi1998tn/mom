import { Button } from "@/components/ui/button";
import { Menu, X, Instagram, Facebook, UserPlus } from "lucide-react";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-.849-.849-1.304-1.95-1.255-3.044C16.503 1.103 16.743.928 17 .928h2.928c.257 0 .497.175.514.366.049 1.094-.406 2.195-1.255 3.044a6.228 6.228 0 01-1.137.966c-.146.106-.3.206-.443.258zM22.071 0H17c-.825 0-1.495.67-1.495 1.495v.433c0 .825.67 1.495 1.495 1.495h5.071c.825 0 1.495-.67 1.495-1.495V1.495C23.566.67 22.896 0 22.071 0z"/>
      <path d="M17.836 8.428c-.736 0-1.474-.146-2.17-.438-.371-.155-.728-.344-1.064-.567v8.154c0 4.137-3.35 7.487-7.487 7.487S0 19.714 0 15.577s3.35-7.487 7.487-7.487c.414 0 .75.336.75.75v3.375c0 .414-.336.75-.75.75-1.447 0-2.625 1.178-2.625 2.625s1.178 2.625 2.625 2.625 2.625-1.178 2.625-2.625V1.5c0-.414.336-.75.75-.75h3.375c.414 0 .75.336.75.75v2.218c.336.223.693.412 1.064.567.696.292 1.434.438 2.17.438.414 0 .75.336.75.75v2.205c0 .414-.336.75-.75.75z"/>
    </svg>
  );

  return (
    <>
      {/* Mobile Social Media Bar */}
      <div className="lg:hidden bg-gradient-to-r from-white to-pink-50 border-b border-pink-200 py-2">
        <div className="flex justify-center items-center gap-6 px-4">
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="TikTok"
          >
            <TikTokIcon />
          </a>
        </div>
      </div>

      {/* Desktop Social Media Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200 py-3">
        <div className="flex justify-center items-center gap-8 w-full px-4">
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="TikTok"
          >
            <TikTokIcon />
          </a>
          <a 
            href="#" 
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="WhatsApp"
          >
            <AiOutlineWhatsApp className="w-5 h-5" />
          </a>
        </div>
      </div>

      <header className="w-full bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between lg:justify-between">
            {/* Logo - Centered on mobile, left on desktop */}
            <div className="flex items-center lg:flex-none lg:flex-initial">
              {/* Mobile User Icon - Left Side */}
              <UserPlus 
                className="lg:hidden text-pink-500 w-6 h-6 cursor-pointer hover:text-pink-600 transition-colors mr-4"
                onClick={() => navigate('/auth')}
                aria-label="الحساب"
              />
              
              <div className="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-auto lg:transform-none">
                <button 
                  onClick={() => navigate('/')}
                  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <img 
                    src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
                    alt="MomAcademy - أكاديمية الأم" 
                    className="h-14 lg:h-16 w-auto cursor-pointer"
                  />
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
                الرئيسية
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
                عن المنصة
              </a>
              <a href="#courses" className="text-foreground hover:text-primary transition-colors font-medium">
                الدورات
              </a>
              <a href="#workshops" className="text-foreground hover:text-primary transition-colors font-medium">
                ورشات
              </a>
              <a href="#consultation" className="text-foreground hover:text-primary transition-colors font-medium">
                الاستشارات
              </a>
              <a href="#testimonials" className="text-foreground hover:text-primary transition-colors font-medium">
                آراء العملاء
              </a>
            </nav>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center gap-4 lg:flex-none">
              {/* Mobile Menu Button - Left */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors order-first"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="القائمة الرئيسية"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Button 
                className="btn-hero rounded-full px-6 py-2 hidden sm:flex"
                onClick={() => navigate('/auth')}
              >
                ابدئي رحلتك الآن
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#home" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  الرئيسية
                </a>
                <a 
                  href="#about" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  عن المنصة
                </a>
                <a 
                  href="#courses" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  الدورات
                </a>
                <a 
                  href="#workshops" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ورشات
                </a>
                <a 
                  href="#consultation" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  الاستشارات
                </a>
                <a 
                  href="#testimonials" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  آراء العملاء
                </a>
                <Button 
                  className="btn-hero rounded-full px-6 py-2 w-full sm:hidden"
                  onClick={() => navigate('/auth')}
                >
                  ابدئي رحلتك الآن
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;