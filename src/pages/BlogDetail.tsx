import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Clock, Eye, Heart, Share2, Calendar, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

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

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleBackToBlogs = () => {
    navigate('/blogs');
  };

  // Mock data - replace with actual API call
  const mockBlogPosts: BlogPost[] = [
    {
      id: 1,
      title: "كيفية التعامل مع نوبات غضب الطفل بطريقة إيجابية",
      excerpt: "نصائح عملية وفعالة للتعامل مع نوبات الغضب عند الأطفال وتحويلها إلى فرص تعليمية",
      content: `
# كيفية التعامل مع نوبات غضب الطفل بطريقة إيجابية

نوبات الغضب جزء طبيعي من نمو الطفل، خاصة في المراحل المبكرة. إليك بعض الاستراتيجيات الفعالة:

## 1. فهم أسباب نوبات الغضب
- الإحباط من عدم القدرة على التعبير
- التعب والجوع
- الحاجة إلى الانتباه
- التغيرات في الروتين

## 2. استراتيجيات التعامل
### قبل النوبة:
- راقبي العلامات المبكرة
- تأكدي من حصول الطفل على الراحة والطعام
- حافظي على روتين ثابت

### أثناء النوبة:
- ابقي هادئة ومتماسكة
- لا تحاولي التفاوض أو الجدال
- قدمي الحب والدعم دون الاستسلام للمطالب

### بعد النوبة:
- احتضني طفلك وأظهري الحب
- تحدثي معه عن مشاعره
- امدحيه عندما يهدأ

## 3. نصائح إضافية
- كوني قدوة في إدارة المشاعر
- علمي طفلك كلمات للتعبير عن مشاعره
- استخدمي تقنيات التهدئة مثل التنفس العميق

تذكري أن الصبر والثبات هما المفتاح للتعامل الناجح مع نوبات الغضب.
      `,
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
      content: "محتوى المقال الكامل عن أهمية اللعب...",
      category: "التطوير التربوي",
      author: "أ. فاطمة محمد",
      published_date: "2024-01-10",
      read_time: "7 دقائق",
      views: 980,
      likes: 67,
      featured_image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=300&fit=crop",
      status: 'published'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const post = mockBlogPosts.find(p => p.id === parseInt(id || '0'));
      setBlogPost(post || null);
      setLoading(false);
    }, 500);
  }, [id]);

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

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blogPost?.title || '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "تم النسخ",
          description: "تم نسخ رابط المقال إلى الحافظة"
        });
        setShareModalOpen(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShareModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">المقال غير موجود</h2>
          <Button onClick={handleBackToBlogs} className="btn-hero">
            العودة إلى المدونات
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <UserSidebar />
        
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full md:mr-0 md:pr-[var(--sidebar-width)] transition-all duration-300">
            <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 lg:hidden">
                  <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">المدونات</h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden hover:bg-pink-50 rounded-xl p-2.5 transition-colors duration-200" />
                  <Button variant="ghost" onClick={handleBackToBlogs} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full md:pr-[var(--sidebar-width)] px-4 md:px-8 py-6 lg:py-8 transition-all duration-200">
            <div className="max-w-4xl mx-auto">
              {/* Article Header */}
              <div className="mb-8">
                {blogPost.featured_image && (
                  <div className="aspect-video overflow-hidden rounded-xl mb-6">
                    <img 
                      src={blogPost.featured_image} 
                      alt={blogPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-start gap-2 mb-4">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(blogPost.category)}`}>
                    {blogPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="ltr">
                    <Calendar className="w-4 h-4" />
                    <span className="text-left">{formatDate(blogPost.published_date)}</span>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {blogPost.title}
                </h1>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 sm:pb-6 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" dir="ltr">
                      <Clock className="w-4 h-4" />
                      <span className="text-left">{blogPost.read_time}</span>
                    </div>
                    <div className="flex items-center gap-1" dir="ltr">
                      <Eye className="w-4 h-4" />
                      <span className="text-left">{blogPost.views}</span>
                    </div>
                    <div className="flex items-center gap-1" dir="ltr">
                      <Heart className="w-4 h-4" />
                      <span className="text-left">{blogPost.likes}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <span className="text-sm font-medium text-slate-600">{blogPost.author}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShareModalOpen(true)}
                      className="flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      مشاركة
                    </Button>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="prose prose-slate max-w-none text-right" dir="rtl">
                    <div className="whitespace-pre-line leading-relaxed text-slate-700">
                      {blogPost.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm w-full md:pr-[var(--sidebar-width)] transition-all duration-200">
            <Footer />
          </footer>
        </div>
        
        <EnhancedFloatingWhatsApp />

        {/* Share Modal */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">مشاركة المقال</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center p-4 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="w-5 h-5 text-pink-600" />
                فيسبوك
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center p-4 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="w-5 h-5 text-pink-500" />
                تويتر
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center p-4 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="w-5 h-5 text-pink-700" />
                لينكد إن
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center p-4 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                onClick={() => handleShare('copy')}
              >
                <Copy className="w-5 h-5 text-pink-600" />
                نسخ الرابط
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default BlogDetail;