import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowLeft, Clock, MessageSquare, MapPin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
interface Workshop {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  next_date: string;
  enrolled_count: number;
  max_participants: number;
  location: string;
  highlights: string[];
  price: number;
  image_url?: string;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
}
const Workshops = () => {
  const {
    ref: sectionRef,
    isVisible
  } = useScrollAnimation();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchWorkshops();
  }, []);
  const fetchWorkshops = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshops.php');
      const data = await response.json();
      if (data.success && data.workshops) {
        // Filter only active workshops
        setWorkshops(data.workshops.filter((workshop: Workshop) => workshop.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <section id="workshops" className="py-20 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => {
          // Navigate back to dashboard - assuming this component will be used in a router context
          if (typeof window !== 'undefined' && window.history) {
            window.history.back();
          }
        }} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للقائمة
          </Button>
        </div>
        
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">ورشات</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ورش تدريبية متخصصة تقدم حلول عملية ومباشرة لأهم التحديات التي تواجه الأمهات
          </p>
        </div>

        {/* Workshops Grid */}
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {loading ? <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">جاري تحميل الورش...</p>
            </div> : workshops.length === 0 ? <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">لا توجد ورش متاحة حاليًا</p>
            </div> : workshops.map((workshop, index) => <div key={workshop.id} className={`card-elegant p-6 flex flex-col h-full transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{
          transitionDelay: isVisible ? `${300 + index * 150}ms` : '0ms'
        }}>
                {/* Workshop Header */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary-soft text-primary text-sm font-medium rounded-full mb-3">
                    {workshop.type}
                  </span>
                  <h3 className={`text-xl font-bold text-foreground mb-2 ${getTextAlignmentClasses(workshop.title)} ${getContainerDirection(workshop.title)}`} dir={getTextDirection(workshop.title)} style={{
              unicodeBidi: 'plaintext'
            }}>
                    {workshop.title}
                  </h3>
                </div>

                {/* Description */}
                <p className={`text-muted-foreground mb-4 leading-relaxed flex-grow ${getTextAlignmentClasses(workshop.description)} ${getContainerDirection(workshop.description)}`} dir={getTextDirection(workshop.description)} style={{
            unicodeBidi: 'plaintext'
          }}>
                  {workshop.description}
                </p>

                {/* Workshop Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{workshop.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>الدفعة القادمة: <span className="font-medium" dir="ltr">{formatDate(workshop.next_date)}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>مسجل: {workshop.enrolled_count}/{workshop.max_participants}</span>
                  </div>
                </div>

                {/* Highlights */}
                {workshop.highlights && workshop.highlights.length > 0 && <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">نقاط القوة:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {workshop.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
                    </ul>
                  </div>}

                {/* CTA Button */}
                <Button className="btn-hero w-full mt-auto" onClick={() => {
            const message = encodeURIComponent(`أريد التسجيل في ${workshop.title}`);
            window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
          }}>
                  احجزي مقعدك الآن
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </div>)}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <div className="card-elegant p-8 max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary-light/10">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              لديك فكرة لورشة جديدة؟
            </h3>
            <p className="text-muted-foreground mb-6">
              نحن نستمع لاحتياجاتكم ونطور ورش جديدة باستمرار. شاركينا أفكارك واقتراحاتك
            </p>
            <Button variant="outline" className="btn-outline" onClick={() => {
            const message = encodeURIComponent("لدي اقتراح لورشة جديدة أود مناقشتها معكم");
            window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
          }}>
              <MessageSquare className="w-4 h-4 ml-2" />
              اقترحي ورشة جديدة
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default Workshops;