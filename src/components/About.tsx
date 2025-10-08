import { Card } from "@/components/ui/card";
import { Star, Clock, Trophy, Users2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import motherChildrenBackground from "@/assets/mother-children-background.png";

const About = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  const features = [
    {
      icon: Star,
      title: "محتوى عالي الجودة",
      description: "دورات متخصصة تناسب احتياجات الأمهات"
    },
    {
      icon: Clock,
      title: "مرونة في التعلم",
      description: "تعلمي في الوقت المناسب لك"
    },
    {
      icon: Trophy,
      title: "متابعة شخصية",
      description: "متابعة مستمرة مع كل أم لضمان تحقيق النتائج"
    },
    {
      icon: Users2,
      title: "مجتمع داعم",
      description: "مجتمع من الأمهات لتبادل الخبرات"
    }
  ];

  return (
    <section id="about" className="relative py-16 md:py-24 overflow-hidden" ref={sectionRef}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-white to-rose-50/30"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section with Image */}
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Content Side */}
          <div className="order-2 lg:order-1 text-center lg:text-right">
            <div className="relative inline-block mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 relative">
                تعرفي على{" "}
                <span className="text-pink-500 relative">
                  أكاديمية الأم
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full"></div>
                </span>
              </h2>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-8 text-primary/40 text-2xl">✨</div>
              <div className="absolute -bottom-4 -left-6 text-secondary/40 text-xl">💖</div>
            </div>
            <h3 className="text-xl md:text-2xl text-pink-500 font-semibold mb-6 text-right" style={{ wordSpacing: 'normal', whiteSpace: 'normal' }}>
              نساعدك على الإستمتاع بحياتك&nbsp;و&nbsp;أمومتك
            </h3>
            <div className="text-right space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p className="mb-4 text-yellow-400 font-semibold">
                هدفنا:"أسرة متوازنة.. طفل متوازن"
              </p>
              <p className="mb-4">
                أكاديمية الأم هي منصة تدريبية إلكترونية ساعدت ألاف الأمهات للوصول لأفضل نسخة منهم.. ولتربية أطفال مسؤولين.. واثقين.. ناجحين..وخاصة سويين نفسياً ❤️
              </p>
              <p className="mb-4">
                نقدم من خلال هذه المنصة دورات و ورشات مدفوعة.. يمكنك الإشتراك بها و مشاهدتها كفيديوات مسجلة وفق الوقت المناسب لك.
              </p>
            </div>
          </div>

          {/* Image Side */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative group">
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-700 group-hover:scale-105">
                <img 
                  src={motherChildrenBackground} 
                  alt="مروى الأمير - مؤسسة أكاديمية الأم"
                  className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover object-center"
                  loading="lazy"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-secondary to-accent rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 -left-6 w-4 h-4 bg-gradient-to-br from-accent to-primary rounded-full shadow-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>

        {/* Mobile Feature Cards */}
        <div className={`lg:hidden grid grid-cols-2 gap-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => (
            <Card key={index} className="group relative bg-white/70 backdrop-blur-sm border-0 shadow-lg p-4 text-center transition-all duration-500 hover:scale-105 rounded-2xl overflow-hidden">
              {/* Card decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon container */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <feature.icon className="w-6 h-6 text-white relative z-10" />
              </div>
              
              <h3 className="text-sm font-bold text-foreground mb-2 relative z-10">
                {feature.title}
              </h3>
              
              <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;