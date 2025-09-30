import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Eye, Clock, Users, Star, ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, Sparkles, BookOpen, Award, Target, FileImage } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReceiptUpload from "@/components/ReceiptUpload";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import motherChildrenHero from "@/assets/mother-children-hero.png";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: string;
  rating: number;
  image_url?: string;
  description?: string;
  status: string;
}

interface RequestStatus {
  has_access: boolean;
  status: string;
  request_date?: string;
  response_date?: string;
  message?: string;
  request_id?: number;
  recu_link?: string;
}

const CoursePacks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [coursePacks, setCoursePacks] = useState<CoursePack[]>([]);
  const [accessStatus, setAccessStatus] = useState<{[key: number]: RequestStatus}>({});
  const [loading, setLoading] = useState(true);
  const [requestingPurchase, setRequestingPurchase] = useState<{[key: number]: boolean}>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState<{[key: number]: number}>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Get current user from localStorage (like in dashboard)
  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };
  
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || null;

  useEffect(() => {
    fetchCoursePacks();
  }, []);

  useEffect(() => {
    if (coursePacks.length > 0) {
      checkAccessForAllPacks();
    }
  }, [coursePacks]);

  const fetchCoursePacks = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filter only active packs
        const activePacks = data.data.filter((pack: CoursePack) => pack.status === 'active');
        setCoursePacks(activePacks);
      } else {
        toast({
          title: "خطأ في تحميل الدورات",
          description: "تعذر تحميل قائمة الدورات التدريبية",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAccessForAllPacks = async () => {
    if (!currentUserId) return;
    
    const statusPromises = coursePacks.map(async (pack) => {
      try {
        const response = await fetch(`https://spadadibattaglia.com/mom/api/check_access.php?user_id=${currentUserId}&pack_id=${pack.id}`);
        const data = await response.json();
        
        // If there's a pending request, set up the receipt upload option
        if (data.request_id && data.status === 'pending') {
          setShowReceiptUpload(prev => ({
            ...prev,
            [pack.id]: data.request_id
          }));
        }
        
        return { packId: pack.id, status: data };
      } catch (error) {
        return { packId: pack.id, status: { has_access: false, status: 'error' } };
      }
    });

    const results = await Promise.all(statusPromises);
    const statusMap = results.reduce((acc, { packId, status }) => {
      acc[packId] = status;
      return acc;
    }, {} as {[key: number]: RequestStatus});

    setAccessStatus(statusMap);
  };

  const handlePurchaseClick = (packId: number) => {
    // Check if user is logged in
    if (!currentUser || !currentUserId) {
      // Redirect to auth page
      navigate('/auth');
      return;
    }

    // Show confirmation modal
    setSelectedPackId(packId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackId || !currentUserId) return;

    setRequestingPurchase(prev => ({ ...prev, [selectedPackId]: true }));
    setConfirmDialogOpen(false);

    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/requests.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUserId,
          pack_id: selectedPackId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "تم إرسال الطلب بنجاح",
          description: "سيتم مراجعة طلبك والرد عليك قريباً",
        });
        
        // Update access status and show receipt upload
        setAccessStatus(prev => ({
          ...prev,
          [selectedPackId]: { 
            has_access: false, 
            status: 'pending', 
            request_id: data.data.id 
          }
        }));
        
        // Show receipt upload option
        setShowReceiptUpload(prev => ({
          ...prev,
          [selectedPackId]: data.data.id
        }));
      } else {
        toast({
          title: "خطأ في الطلب",
          description: data.message || "تعذر إرسال طلب الشراء",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setRequestingPurchase(prev => ({ ...prev, [selectedPackId]: false }));
      setSelectedPackId(null);
    }
  };

  const handleViewPack = (packId: number) => {
    navigate(`/chapter/${packId}`);
  };

  const handleReceiptUpload = (packId: number) => {
    setSelectedPackId(packId);
    setUploadDialogOpen(true);
  };

  const handleReceiptUploadComplete = (imageUrl: string) => {
    if (!selectedPackId) return;
    
    // Update the access status to include the receipt link
    setAccessStatus(prev => ({
      ...prev,
      [selectedPackId]: {
        ...prev[selectedPackId],
        recu_link: imageUrl
      }
    }));
    
    setUploadDialogOpen(false);
    setSelectedPackId(null);
    
    toast({
      title: "تم رفع الإيصال بنجاح",
      description: "شكراً لك، سيتم مراجعة طلبك مع الإيصال قريباً",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد المراجعة';
      default:
        return '';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-[80vh] bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            {/* Beautiful animated loader */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-rose-400 animate-spin animation-delay-150"></div>
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-400 animate-spin animation-delay-300"></div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-500 animate-pulse" />
              <BookOpen className="absolute -bottom-2 -left-2 w-6 h-6 text-rose-500 animate-bounce" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                جاري تحميل الدورات المتخصصة
              </h2>
              <p className="text-slate-600 font-medium">نحضر لك أفضل الدورات التربوية...</p>
              
              {/* Loading progress bars */}
              <div className="space-y-2 w-64 mx-auto">
                <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 animate-loading-bar rounded-full"></div>
                </div>
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-loading-bar-delayed rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Smart grid layout logic for 8 packs
  const getGridLayout = (total: number) => {
    if (total <= 3) return "md:grid-cols-2 lg:grid-cols-3";
    if (total <= 6) return "md:grid-cols-2 lg:grid-cols-3";
    return "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
  };

  // Special centering logic for 8 packs (not divisible by 3)
  const getCenteringLogic = (index: number, total: number) => {
    if (total === 8) {
      // For 8 items: 3-3-2 layout, center the last 2
      if (index === 6) return 'xl:col-start-2'; // 7th item (index 6) starts at column 2
      if (index === 7) return ''; // 8th item (index 7) follows normally
    }
    // For any other count not divisible by 3, center the remaining items
    const remainder = total % 3;
    if (remainder !== 0) {
      const lastRowStart = total - remainder;
      if (index >= lastRowStart) {
        if (remainder === 1) {
          return 'xl:col-start-2'; // Single item centered
        } else if (remainder === 2 && index === lastRowStart) {
          return 'xl:col-start-2'; // First of two items starts at column 2
        }
      }
    }
    return '';
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ 
            backgroundImage: `url(${motherChildrenHero})`,
            backgroundPosition: 'center 80%'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 via-rose-400/30 to-purple-500/40"></div>
        
        <div className="container mx-auto px-4 py-16 relative">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للقائمة
            </Button>
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                باقات الدورات المتخصصة
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
              اكتشفي مجموعتنا الحصرية من الدورات التربوية المصممة خصيصاً لتمكين الأمهات 
              <br className="hidden sm:block" />
              وتطوير مهارات التربية الإيجابية مع أطفالهن
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-pink-100">
                <Target className="w-5 h-5 text-pink-500" />
                <span className="text-slate-700 font-medium">محتوى متخصص</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-rose-100">
                <Users className="w-5 h-5 text-rose-500" />
                <span className="text-slate-700 font-medium">مجتمع داعم</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className="text-slate-700 font-medium">شهادات معتمدة</span>
              </div>
            </div>
            
            <div className="text-sm text-slate-500 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              أكثر من 1000+ أم استفادت من دوراتنا
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {coursePacks.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-pink-100 shadow-lg">
              <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-pink-300" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">لا توجد دورات متاحة</h3>
              <p className="text-slate-600 leading-relaxed">
                سيتم إضافة دورات جديدة قريباً. تابعينا للحصول على آخر التحديثات
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Course Count */}
            <div className="text-center mb-12">
              <p className="text-slate-600 font-medium">
                عرض <span className="text-pink-600 font-bold">{coursePacks.length}</span> دورة متخصصة
              </p>
            </div>
            
            {/* Smart Grid Layout */}
            <div className={`grid grid-cols-1 ${getGridLayout(coursePacks.length)} gap-8 max-w-7xl mx-auto`}>
              {coursePacks.map((pack, index) => {
              const status = accessStatus[pack.id];
              const isRequesting = requestingPurchase[pack.id] || false;
              
              // Special styling for centering logic
              const centeringClass = getCenteringLogic(index, coursePacks.length);
              
              return (
                <Card 
                  key={pack.id} 
                  className={`bg-white/90 backdrop-blur-sm border border-pink-100 overflow-hidden group hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500 hover:-translate-y-2 animate-fade-in flex flex-col h-full ${centeringClass}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                    <img 
                      src={pack.image_url || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center'} 
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Status Badge */}
                    {status && status.status !== 'no_request' && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge 
                          variant={status.status === 'accepted' ? 'default' : status.status === 'pending' ? 'secondary' : 'destructive'} 
                          className="flex items-center gap-1 bg-white/90 backdrop-blur-sm"
                        >
                          {getStatusIcon(status.status)}
                          {getStatusText(status.status)}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Package Number */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {pack.id}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-pink-600 transition-colors leading-tight">
                        باقة {pack.title}
                      </h3>
                      {pack.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {pack.description}
                        </p>
                      )}
                      
                      {/* Modules */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pack.modules.split(',').slice(0, 2).map((module, moduleIndex) => (
                          <Badge key={moduleIndex} variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100">
                            {module.trim()}
                          </Badge>
                        ))}
                        {pack.modules.split(',').length > 2 && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            +{pack.modules.split(',').length - 2} وحدة أخرى
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-3 rounded-xl text-center border border-pink-100">
                        <Clock className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-700 block">{pack.duration}</span>
                        <span className="text-xs text-slate-500">مدة الدورة</span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl text-center border border-purple-100">
                        <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-700 block">{pack.students}</span>
                        <span className="text-xs text-slate-500">طالبة</span>
                      </div>
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-3 rounded-xl text-center border border-rose-100">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-xs font-semibold text-slate-700 mr-1">{pack.rating}</span>
                        </div>
                        <span className="text-xs text-slate-500">تقييم</span>
                      </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="space-y-3 mt-auto">
                      {/* Buy Button */}
                      <Button
                        onClick={() => handlePurchaseClick(pack.id)}
                        disabled={
                          isRequesting || 
                          (status && status.status === 'pending') ||
                          (status && status.has_access)
                        }
                        className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        {isRequesting ? 'جاري الإرسال...' : 
                         status?.has_access ? 'تم الشراء بنجاح' :
                         status?.status === 'pending' ? 'قيد المراجعة' : 'شراء الباقة الآن'}
                      </Button>

                      {/* Receipt Upload Button - Show for pending requests without receipt */}
                      {status?.status === 'pending' && !status?.recu_link && showReceiptUpload[pack.id] && (
                        <Button
                          onClick={() => handleReceiptUpload(pack.id)}
                          variant="outline"
                          className="w-full h-12 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 rounded-xl font-semibold transition-all duration-300"
                        >
                          <FileImage className="w-5 h-5 ml-2" />
                          رفع إيصال الدفع
                        </Button>
                      )}

                      {/* Receipt Status - Show if receipt was uploaded */}
                      {status?.status === 'pending' && status?.recu_link && (
                        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <span className="text-green-700 font-medium text-sm">تم رفع الإيصال بنجاح</span>
                        </div>
                      )}

                      {/* View Button */}
                      <Button
                        onClick={() => handleViewPack(pack.id)}
                        disabled={!status?.has_access}
                        variant="outline"
                        className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                          status?.has_access 
                            ? 'border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300' 
                            : 'border-slate-200 text-slate-400'
                        }`}
                      >
                        <Eye className="w-5 h-5 ml-2" />
                        {status?.has_access ? 'دخول الدورة' : 'معاينة المحتوى'}
                      </Button>
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
          </>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">هل تحتاجين استشارة شخصية؟</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            احجزي جلسة استشارة فردية مع خبيراتنا لتصميم خطة تربوية مخصصة لطفلك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/#consultation')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              احجزي استشارة
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-pink-200 text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-xl font-semibold"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
      
      {/* Purchase Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-slate-900 text-xl font-bold">
              تأكيد طلب الشراء
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                هل تريدين حقاً شراء هذه الباقة؟
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                سيتم إرسال طلب الشراء للمراجعة وسنتواصل معك قريباً لتأكيد العملية
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleConfirmPurchase}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold"
                disabled={selectedPackId ? requestingPurchase[selectedPackId] : false}
              >
                {selectedPackId && requestingPurchase[selectedPackId] ? 'جاري الإرسال...' : 'نعم، أريد الشراء'}
              </Button>
              <Button
                onClick={() => setConfirmDialogOpen(false)}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Receipt Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-slate-900 text-xl font-bold">
              رفع إيصال الدفع
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedPackId && showReceiptUpload[selectedPackId] && (
              <ReceiptUpload
                requestId={showReceiptUpload[selectedPackId]}
                onUploadComplete={handleReceiptUploadComplete}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
      <EnhancedFloatingWhatsApp />
    </div>
  );
};

export default CoursePacks;