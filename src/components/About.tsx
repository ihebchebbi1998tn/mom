import { Card } from "@/components/ui/card";
import { Star, Clock, Trophy, Users2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

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
      title: "شهادات معتمدة",
      description: "شهادات إتمام معتمدة ومعترف بها"
    },
    {
      icon: Users2,
      title: "مجتمع داعم",
      description: "مجتمع من الأمهات لتبادل الخبرات"
    }
  ];

  return (
    <section id="about" className="relative py-24 overflow-hidden" ref={sectionRef}>
      {/* Background Image with Pink Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-top md:bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('/src/assets/mother-children-background.png')`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-pink-400/20 to-pink-600/25"></div>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-accent/15 to-primary/15 rounded-full blur-2xl"></div>
      
      {/* Floating Decorative Shapes */}
      <div className="absolute top-32 right-1/4 w-6 h-6 bg-primary/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-secondary/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-accent/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl mx-auto text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative inline-block mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 relative">
              لماذا{" "}
              <span className="text-pink-500 relative">
                أكاديمية الأم؟
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full"></div>
              </span>
            </h2>
            {/* Decorative stars around title */}
            <div className="absolute -top-4 -right-8 text-primary/40 text-2xl">✨</div>
            <div className="absolute -bottom-4 -left-6 text-secondary/40 text-xl">💖</div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            تطوير مهارات الأمهات مع الحفاظ على التوازن الأسري
          </p>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => (
            <Card key={index} className="group relative bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl p-4 md:p-8 text-center transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl md:rounded-3xl overflow-hidden">
              {/* Card decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon container with enhanced styling */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <feature.icon className="w-10 h-10 text-white relative z-10" />
                {/* Sparkle effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-6 relative z-10 text-center">
                {feature.title}
              </h3>
              
              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-primary to-secondary group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;