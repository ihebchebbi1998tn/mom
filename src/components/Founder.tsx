import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Award, Heart, Users, GraduationCap } from "lucide-react";
import founderImage from "@/assets/hero-mother-daughter-floral.png";

const Founder = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  const credentials = [
    {
      icon: Award,
      text: "مدربة معتمدة"
    },
    {
      icon: Heart,
      text: "مستشارة تربوية و أسرية"
    },
    {
      icon: GraduationCap,
      text: "خريجة دبلوم علم النفس التربوي (تعديل سلوك الطفل)"
    },
    {
      icon: GraduationCap,
      text: "متحصلة على دبلوم في الصحة النفسية"
    }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden" ref={sectionRef}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-white to-rose-50/50"></div>
      <div className="absolute top-10 right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              تعرفي على{" "}
              <span className="text-pink-500 relative inline-block">
                مروى الأمير
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full"></div>
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-pink-500 font-semibold mt-4">
              مؤسسة أكاديمية الأم
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Photo Side */}
            <div className="order-1 lg:order-2">
              <div className="relative group">
                {/* Photo container */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-700 group-hover:scale-105">
                  <img 
                    src={founderImage} 
                    alt="مروى الأمير - مؤسسة أكاديمية الأم"
                    className="w-full h-[350px] md:h-[420px] lg:h-[500px] object-cover object-center"
                    loading="lazy"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-secondary to-accent rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>

            {/* Text Side */}
            <div className="order-2 lg:order-1 text-right space-y-6">
              {/* Credentials with icons */}
              <div className="space-y-4">
                {credentials.map((credential, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <credential.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-foreground flex-1 pt-2">
                      {credential.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Impact Statement */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl shadow-lg border border-pink-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-foreground leading-relaxed flex-1 pt-1">
                    ساعدت ألاف الأمهات من جميع انحاء العالم للوصول للتوازن النفسي و الأسري و لتربية أطفال سويين نفسياً
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Founder;
