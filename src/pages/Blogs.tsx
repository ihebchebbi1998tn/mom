import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Clock, Eye, Heart, Share2, Calendar } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import Footer from "@/components/Footer";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_date: string;
  read_time: string;
  views: number;
  likes: number;
  featured_image?: string;
  status: 'published' | 'draft';
}

const Blogs = () => {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Mock data for blog posts since we don't have an API endpoint yet
  const mockBlogPosts: BlogPost[] = [
    {
      id: 1,
      title: "كيفية التعامل مع نوبات غضب الطفل بطريقة إيجابية",
      excerpt: "نصائح عملية وفعالة للتعامل مع نوبات الغضب عند الأطفال وتحويلها إلى فرص تعليمية",
      content: "محتوى المقال الكامل...",
      category: "تربية الأطفال",
      author: "د. سارة أحمد",
      published_date: "2024-01-15",
      read_time: "5 دقائق",
      views: 1250,
      likes: 89,
      featured_image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=300&fit=crop",
      status: 'published'
    },
    {
      id: 2,
      title: "أهمية اللعب في تنمية شخصية الطفل",
      excerpt: "كيف يساهم اللعب في تطوير المهارات الاجتماعية والعقلية والجسدية لدى الأطفال",
      content: "محتوى المقال الكامل...",
      category: "التطوير التربوي",
      author: "أ. فاطمة محمد",
      published_date: "2024-01-10",
      read_time: "7 دقائق",
      views: 980,
      likes: 67,
      featured_image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=300&fit=crop",
      status: 'published'
    },
    {
      id: 3,
      title: "إدارة الوقت للأم العاملة: استراتيجيات عملية",
      excerpt: "كيفية تحقيق التوازن بين العمل والأمومة مع نصائح مجربة من خبراء التنمية البشرية",
      content: "محتوى المقال الكامل...",
      category: "تنظيم الوقت",
      author: "د. نورا حسن",
      published_date: "2024-01-05",
      read_time: "8 دقائق",
      views: 1450,
      likes: 112,
      featured_image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=300&fit=crop",
      status: 'published'
    },
    {
      id: 4,
      title: "تقوية الثقة بالنفس عند الأطفال",
      excerpt: "طرق عملية لبناء الثقة بالنفس عند الطفل منذ الصغر ومساعدته على تطوير شخصية قوية",
      content: "محتوى المقال الكامل...",
      category: "بناء الشخصية",
      author: "أ. ليلى عبدالله",
      published_date: "2024-01-01",
      read_time: "6 دقائق",
      views: 876,
      likes: 54,
      featured_image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=300&fit=crop",
      status: 'published'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBlogPosts(mockBlogPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'تربية الأطفال': 'text-blue-600 bg-blue-100',
      'التطوير التربوي': 'text-green-600 bg-green-100',
      'تنظيم الوقت': 'text-purple-600 bg-purple-100',
      'بناء الشخصية': 'text-orange-600 bg-orange-100'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المقالات...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Sidebar */}
        <UserSidebar />
        
        <div className="flex flex-col min-h-screen">
          {/* Header - Full width on mobile, accounts for sidebar on desktop */}
          <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full md:mr-0 md:pr-[var(--sidebar-width)] transition-all duration-300">
            <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 lg:hidden">
                  <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">المدوَّنات والمقالات</h1>
                    <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">مقالات ونصائح مفيدة للأمهات</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden hover:bg-pink-50 rounded-xl p-2.5 transition-colors duration-200" />
                  <Button variant="ghost" onClick={handleBackToDashboard} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area - Properly spaced for desktop sidebar */}
          <main className="flex-1 w-full md:pr-[var(--sidebar-width)] px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-x-hidden">
            {/* Header Section */}
            <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">المدوَّنات</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                مقالات ونصائح مفيدة لتطوير مهارات الأمومة والتربية
              </p>
            </div>

            {/* Blog Posts Grid */}
            {blogPosts.length > 0 ? (
              <div className="grid xl:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
                {blogPosts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Featured Image */}
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      {/* Category and Date */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="ltr">
                          <Calendar className="w-4 h-4" />
                          <span className="text-left">{formatDate(post.published_date)}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-primary mb-3 hover:text-primary/80 cursor-pointer transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground mb-4 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1" dir="ltr">
                            <Clock className="w-4 h-4" />
                            <span className="text-left">{post.read_time}</span>
                          </div>
                          <div className="flex items-center gap-1" dir="ltr">
                            <Eye className="w-4 h-4" />
                            <span className="text-left">{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1" dir="ltr">
                            <Heart className="w-4 h-4" />
                            <span className="text-left">{post.likes}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {post.author}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" 
                          onClick={() => navigate(`/blog/${post.id}`)}
                        >
                          اقرأ المقال
                          <FileText className="w-4 h-4 mr-2" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => navigate(`/blog/${post.id}`)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">لا توجد مقالات متاحة حاليًا</p>
                <p className="text-sm text-muted-foreground">سيتم إضافة مقالات جديدة قريباً</p>
              </div>
            )}

            {/* Newsletter Subscription */}
            <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8 max-w-2xl mx-auto">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    اشتركي في النشرة البريدية
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    احصلي على أحدث المقالات والنصائح التربوية مباشرة في بريدك الإلكتروني
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" 
                    onClick={() => {
                      const message = encodeURIComponent("أريد الاشتراك في النشرة البريدية لتلقي أحدث المقالات");
                      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                    }}
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    اشتركي الآن
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Footer - Full width on mobile, accounts for sidebar on desktop */}
          <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm w-full md:pr-[var(--sidebar-width)] transition-all duration-200">
            <Footer />
          </footer>
        </div>
        
        {/* Floating WhatsApp */}
        <EnhancedFloatingWhatsApp />
      </div>
    </SidebarProvider>
  );
};

export default Blogs;