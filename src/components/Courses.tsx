import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users, ArrowLeft } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: number;
  rating: number;
  image_url: string | null;
  description: string;
  status: string;
}

const Courses = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [coursePacks, setCoursePacks] = useState<CoursePack[]>([]);
  const [loading, setLoading] = useState(true);

  const initialCount = isMobile ? 4 : 6;
  const loadMoreCount = isMobile ? 4 : 6;

  useEffect(() => {
    const fetchCoursePacks = async () => {
      try {
        const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php');
        const data = await response.json();
        
        if (data.success && data.data) {
          setCoursePacks(data.data.filter((pack: CoursePack) => pack.status === 'active'));
        }
      } catch (error) {
        console.error('Error fetching course packs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursePacks();
  }, []);


  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [visibleCount, setVisibleCount] = useState(initialCount);
  
  // Update visible count when screen size changes
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [isMobile]);
  
  const visibleCourses = coursePacks.slice(0, visibleCount);
  const hasMore = visibleCount < coursePacks.length;
  
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + loadMoreCount, coursePacks.length));
  };

  return (
    <section id="courses" className="py-20 section-gradient" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            الدورات المتخصصة
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اختاري الباقة المناسبة وابدئي رحلة التطوير
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">جاري تحميل الباقات...</p>
          </div>
        )}

        {/* Course Packs Display */}
        {!loading && coursePacks.length > 0 && (
        <div className="mb-16">
          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {visibleCourses.map((course, index) => (
              <div 
                key={course.id} 
                className={`group relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ 
                  transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' 
                }}
              >
              {/* Book Cover */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 aspect-[3/4] overflow-hidden">
                {/* Book Image */}
                 <div className="absolute inset-0">
                  <img 
                    src={course.image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center"} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                {/* Book Spine Effect */}
                <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-b from-primary to-primary-light shadow-lg"></div>
                
                 {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-foreground" dir="ltr">{course.rating}</span>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-3 text-shadow">
                    {course.title}
                  </h3>
                  
                  {/* Modules Preview */}
                  <div className="space-y-1 mb-4 opacity-90">
                    {course.modules && course.modules.split(',').slice(0, 2).map((module, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <span>{module.trim()}</span>
                      </div>
                    ))}
                     {course.modules && course.modules.split(',').length > 2 && (
                      <div className="text-sm opacity-75">
                        <span dir="ltr">+{course.modules.split(',').length - 2}</span> مواضيع أخرى
                      </div>
                     )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center mb-4 text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span dir="ltr">{course.students}+</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Button size="sm" className="btn-hero w-full" onClick={() => navigate(`/pack/${course.id}`)}>
                        تفاصيل الباقة
                        <ArrowLeft className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={loadMore}
                size="lg"
                className="btn-hero"
              >
                عرض المزيد من الباقات
              </Button>
            </div>
          )}
        </div>
        )}

        {/* Empty State */}
        {!loading && coursePacks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد باقات متاحة حالياً</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Courses;