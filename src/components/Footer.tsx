import { Instagram, Facebook } from "lucide-react";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { FaTiktok } from "react-icons/fa";
import oldLogo from "@/assets/maman-attentionnee-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <img 
                src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
                alt="MomAcademy - أكاديمية الأم" 
                className="h-32 md:h-24 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-white/90 mb-6 max-w-md leading-relaxed">
              أكاديمية الأم - منصة تعليمية متخصصة تقدم دورات احترافية ونصائح عملية للأمهات لتطوير مهاراتهن في التربية وإدارة الحياة الأسرية
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#courses" 
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const offeringsSection = document.getElementById('offerings');
                    if (offeringsSection) {
                      offeringsSection.scrollIntoView({ behavior: 'smooth' });
                      setTimeout(() => {
                        const tabTrigger = document.querySelector(`[value="courses"]`) as HTMLElement;
                        if (tabTrigger) tabTrigger.click();
                      }, 500);
                    }
                  }}
                >
                  الدورات
                </a>
              </li>
              <li>
                <a 
                  href="#workshops" 
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const offeringsSection = document.getElementById('offerings');
                    if (offeringsSection) {
                      offeringsSection.scrollIntoView({ behavior: 'smooth' });
                      setTimeout(() => {
                        const tabTrigger = document.querySelector(`[value="workshops"]`) as HTMLElement;
                        if (tabTrigger) tabTrigger.click();
                      }, 500);
                    }
                  }}
                >
                  الورشات
                </a>
              </li>
              <li>
                <a 
                  href="#packs" 
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const offeringsSection = document.getElementById('offerings');
                    if (offeringsSection) {
                      offeringsSection.scrollIntoView({ behavior: 'smooth' });
                      setTimeout(() => {
                        const tabTrigger = document.querySelector(`[value="packs"]`) as HTMLElement;
                        if (tabTrigger) tabTrigger.click();
                      }, 500);
                    }
                  }}
                >
                  الباقات
                </a>
              </li>
              <li><a href="#consultation" className="text-white/80 hover:text-white transition-colors">الاستشارات</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6">تواصلي معنا</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AiOutlineWhatsApp className="w-5 h-5 text-white/80" />
                <span className="text-white/90">واتساب: <span dir="ltr" style={{ unicodeBidi: 'plaintext' }}>+216 52 451 892</span></span>
              </div>
              
              {/* Social Media Links */}
              <div className="flex items-center gap-4 mt-6">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="تابعونا على واتساب"
                >
                  <AiOutlineWhatsApp className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="تابعونا على انستغرام"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="تابعونا على فيسبوك"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="تابعونا على تيك توك"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex justify-center items-center">
          <p className="text-white/80 text-sm">
            © 2024 أكاديمية الأم. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;