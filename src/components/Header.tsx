import { Button } from "@/components/ui/button";
import { Menu, Instagram, Facebook, UserCircle, X } from "lucide-react";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getTextDirection, getTextAlignmentClasses } from "@/utils/textAlignment";
import mamanLogo from "@/assets/mamanattention.png";
import oldLogo from "@/assets/maman-attentionnee-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToOfferings = (tab: string) => {
    const offeringsSection = document.getElementById('offerings');
    if (offeringsSection) {
      offeringsSection.scrollIntoView({ behavior: 'smooth' });
      // Wait for scroll to complete, then trigger tab change
      setTimeout(() => {
        const tabTrigger = document.querySelector(`[value="${tab}"]`) as HTMLElement;
        if (tabTrigger) {
          tabTrigger.click();
        }
      }, 500);
    }
  };

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (href === '#courses') {
      e?.preventDefault();
      scrollToOfferings('courses');
      setIsMenuOpen(false);
    } else if (href === '#workshops') {
      e?.preventDefault();
      scrollToOfferings('workshops');
      setIsMenuOpen(false);
    } else if (href === '#packs') {
      e?.preventDefault();
      scrollToOfferings('packs');
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(false);
    }
  };

  const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-.849-.849-1.304-1.95-1.255-3.044C16.503 1.103 16.743.928 17 .928h2.928c.257 0 .497.175.514.366.049 1.094-.406 2.195-1.255 3.044a6.228 6.228 0 01-1.137.966c-.146.106-.3.206-.443.258zM22.071 0H17c-.825 0-1.495.67-1.495 1.495v.433c0 .825.67 1.495 1.495 1.495h5.071c.825 0 1.495-.67 1.495-1.495V1.495C23.566.67 22.896 0 22.071 0z"/>
      <path d="M17.836 8.428c-.736 0-1.474-.146-2.17-.438-.371-.155-.728-.344-1.064-.567v8.154c0 4.137-3.35 7.487-7.487 7.487S0 19.714 0 15.577s3.35-7.487 7.487-7.487c.414 0 .75.336.75.75v3.375c0 .414-.336.75-.75.75-1.447 0-2.625 1.178-2.625 2.625s1.178 2.625 2.625 2.625 2.625-1.178 2.625-2.625V1.5c0-.414.336-.75.75-.75h3.375c.414 0 .75.336.75.75v2.218c.336.223.693.412 1.064.567.696.292 1.434.438 2.17.438.414 0 .75.336.75.75v2.205c0 .414-.336.75-.75.75z"/>
    </svg>
  );

  const openInstagram = () => {
    window.open('https://instagram.com/maman_attentionnee', '_blank');
  };

  const openFacebook = () => {
    window.open('https://facebook.com', '_blank');
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent("السلام عليكم، أريد معرفة المزيد عن أكاديمية الأم");
    window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Mobile Branding & Social Media Bar */}
      <div className="lg:hidden">
        {/* Branding Bar */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 border-b border-pink-200 py-2">
          <div className="flex justify-center items-center gap-2 px-4">
            <img 
              src={mamanLogo} 
              alt="أكاديمية الأم" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-xs font-medium text-pink-700">
              تطبيق من تصميم
            </span>
            <span className="text-xs font-bold text-pink-600" dir="ltr">
              @maman_attentionnee
            </span>
          </div>
        </div>
        
        {/* Social Media Icons */}
        <div className="bg-gradient-to-r from-white to-pink-50 border-b border-pink-200 py-2">
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
      </div>

      {/* Desktop Branding & Social Media Bar */}
      <div className="hidden lg:block">
        {/* Branding Bar */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 border-b border-pink-200 py-2">
          <div className="flex justify-center items-center gap-2 px-4">
            <img 
              src={mamanLogo} 
              alt="أكاديمية الأم" 
              className="w-7 h-7 object-contain"
            />
            <span className="text-xs font-medium text-pink-700">
              تطبيق من تصميم
            </span>
            <span className="text-xs font-bold text-pink-600" dir="ltr">
              @maman_attentionnee
            </span>
          </div>
        </div>
        
        {/* Social Media Icons */}
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200 py-3">
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
      </div>

      <header className="w-full bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between lg:justify-between">
            {/* Logo - Centered on mobile, left on desktop */}
            <div className="flex items-center lg:flex-none lg:flex-initial">
              {/* Mobile User Icon - Left Side */}
              <UserCircle 
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
              <a 
                href="#courses" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={(e) => handleNavClick('#courses', e)}
              >
                الدورات
              </a>
              <a 
                href="#workshops" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={(e) => handleNavClick('#workshops', e)}
              >
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
              {/* Mobile Menu Sidebar */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors order-first"
                    aria-label="القائمة الرئيسية"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0 bg-gradient-to-bl from-pink-50 via-rose-50/95 to-white border-l-2 border-pink-200">
                  <div className="p-4 h-full flex flex-col">
                    {/* Logo at Top */}
                    <div className="flex items-center justify-between mb-4 animate-fade-in">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-rose-200 rounded-xl flex items-center justify-center shadow-md">
                        <img 
                          src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
                          alt="أكاديمية الأم" 
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      
                      {/* Close Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMenuOpen(false)}
                        className="hover:bg-pink-100 transition-all duration-300 rounded-lg h-8 w-8"
                      >
                        <X className="h-4 w-4 text-pink-600" />
                      </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto">
                      <div className="flex flex-col space-y-1">
                        <a 
                          href="#home" 
                          className="text-gray-700 hover:text-pink-600 transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 text-right text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          الرئيسية
                        </a>
                        <a 
                          href="#about" 
                          className="text-gray-700 hover:text-pink-600 transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 text-right text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          عن المنصة
                        </a>
                        <a 
                          href="#courses" 
                          className="text-gray-700 hover:text-pink-600 transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 text-right text-sm"
                          onClick={(e) => handleNavClick('#courses', e)}
                        >
                          الدورات
                        </a>
                        <a 
                          href="#workshops" 
                          className="text-gray-700 hover:text-pink-600 transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 text-right text-sm"
                          onClick={(e) => handleNavClick('#workshops', e)}
                        >
                          ورشات
                        </a>
                        <a 
                          href="#consultation" 
                          className="text-gray-700 hover:text-pink-600 transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 text-right text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          الاستشارات
                        </a>
                        <a 
                          href="#testimonials" 
                          className="text-gray-700 hover:text-pink-600 transition-colors font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 text-right text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          آراء العملاء
                        </a>
                        <Button 
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full px-4 py-2 w-full mt-2 shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/auth');
                          }}
                        >
                          ابدئي رحلتك الآن
                        </Button>
                      </div>
                    </nav>

                    {/* Social Media Icons at Bottom */}
                    <div className="mt-auto pt-3 border-t border-pink-200">
                      <p className="text-xs text-gray-600 text-right mb-2 font-medium">
                        تواصلوا معنا
                      </p>
                      <div className="flex justify-center gap-2 mb-3">
                        <button
                          onClick={openInstagram}
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={openFacebook}
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300"
                          aria-label="Facebook"
                        >
                          <Facebook className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => window.open('https://www.tiktok.com/@maman_attentionnee', '_blank')}
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300"
                          aria-label="TikTok"
                        >
                          <TikTokIcon />
                        </button>
                        
                        <button
                          onClick={openWhatsApp}
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300"
                          aria-label="WhatsApp"
                        >
                          <AiOutlineWhatsApp className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Attribution */}
                      <div className="pt-2 border-t border-pink-200">
                        <p className="text-[10px] text-gray-500 leading-tight text-center">
                          <span 
                            dir={getTextDirection("تم إنشاء هذا التطبيق بواسطة")}
                            className={getTextAlignmentClasses("تم إنشاء هذا التطبيق بواسطة")}
                          >
                            تم إنشاء هذا التطبيق بواسطة
                          </span>
                          <br />
                          <span className="font-medium text-pink-600">
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
                </SheetContent>
              </Sheet>

              <Button 
                className="btn-hero rounded-full px-6 py-2 hidden sm:flex"
                onClick={() => navigate('/auth')}
              >
                ابدئي رحلتك الآن
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;