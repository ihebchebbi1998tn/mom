import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Clock, Eye, Heart, Share2, Calendar, Menu } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import oldLogo from "@/assets/maman-attentionnee-logo.png";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSectionSelect = (section: string) => {
    if (section === 'packs') {
      navigate('/dashboard');
    } else if (section === 'workshops') {
      navigate('/workshops');
    } else if (section === 'reviews') {
      navigate('/reviews');
    } else if (section === 'challenges') {
      navigate('/challenges');
    } else if (section === 'blogs') {
      // Already on blogs page
    } else {
      // Handle other sections
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/blogs.php?status=published');
      const data = await response.json();
      
      if (data.success && data.blogs) {
        setBlogPosts(data.blogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard} 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-pink-50 rounded-xl transition-colors duration-200"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-right">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">المدوَّنات والمقالات</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">مقالات ونصائح مفيدة للأمهات</p>
              </div>
              <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout - Sidebar + Content Side by Side (Desktop Only) */}
      <div className="flex h-[calc(100vh-80px)] w-full">
        {/* Sidebar - Left Side (Desktop Only) */}
        {!isMobile && (
          <UserSidebar 
            onSectionSelect={handleSectionSelect}
            isOpen={true}
            onToggle={() => {}}
          />
        )}

        {/* Content Area - Takes remaining space */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-y-auto overflow-x-hidden">
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
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=450&fit=crop';
                          }}
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

        </main>

        {/* Mobile Sidebar - Overlay */}
        {isMobile && (
          <UserSidebar 
            onSectionSelect={handleSectionSelect}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
      </div>
      
      {/* Floating WhatsApp */}
      <EnhancedFloatingWhatsApp />
    </div>
  );
};

export default Blogs;