import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  Target, 
  FileText, 
  Star 
} from "lucide-react";

interface MobileLandingProps {
  onSectionSelect: (section: string) => void;
}

const MobileLanding: React.FC<MobileLandingProps> = ({ onSectionSelect }) => {
  const [visibleButtons, setVisibleButtons] = useState<number>(0);

  const sections = [
    {
      id: 'packs',
      title: 'الباقات التعليمية',
      icon: BookOpen,
      description: 'اكتشفي باقاتنا المتنوعة',
      delay: 0
    },
    {
      id: 'workshops',
      title: 'الورشات',
      icon: Calendar,
      description: 'ورشات تفاعلية مباشرة',
      delay: 100
    },
    {
      id: 'consultations',
      title: 'الاستشارات',
      icon: MessageCircle,
      description: 'استشارات شخصية مخصصة',
      delay: 200
    },
    {
      id: 'challenges',
      title: 'التحديات',
      icon: Target,
      description: 'تحديات تطوير الذات',
      delay: 300
    },
    {
      id: 'blogs',
      title: 'المدوَّنات',
      icon: FileText,
      description: 'مقالات ونصائح مفيدة',
      delay: 400
    },
    {
      id: 'reviews',
      title: 'التقييمات',
      icon: Star,
      description: 'آراء وتجارب العملاء',
      delay: 500
    }
  ];

  useEffect(() => {
    sections.forEach((_, index) => {
      setTimeout(() => {
        setVisibleButtons(prev => prev + 1);
      }, sections[index].delay);
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <img 
            src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
            alt="أكاديمية الأم" 
            className="w-12 h-12 object-contain brightness-0 invert"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          مرحباً بك في أكاديمية الأم
        </h1>
        <p className="text-slate-600 leading-relaxed">
          اختاري القسم الذي تريدين استكشافه
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          const isVisible = index < visibleButtons;
          
          return (
            <div
              key={section.id}
              className={`transform transition-all duration-500 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-8 opacity-0'
              }`}
            >
              <Button
                onClick={() => onSectionSelect(section.id)}
                className="w-full h-20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6"
                variant="default"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-white">{section.title}</h3>
                      <p className="text-sm text-white/80">{section.description}</p>
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center space-y-2">
        <div className="text-xs text-slate-400">
          <div>تم تطوير التطبيق بحب من قبل</div>
          <a 
            href="https://instagram.com/maman_attentionnee" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600 font-medium transition-colors duration-200 underline decoration-pink-300 hover:decoration-pink-500"
            dir="ltr"
          >
            @maman_attentionnee ❤️
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileLanding;