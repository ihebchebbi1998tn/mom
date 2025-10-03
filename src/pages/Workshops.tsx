import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Users, ArrowLeft, Clock, MessageSquare, MapPin, Menu, CheckCircle, AlertCircle, Loader2, Upload, Eye } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import ReceiptUpload from "@/components/ReceiptUpload";

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

interface WorkshopRequest {
  id: string;
  user_id: string;
  workshop_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes?: string;
  created_at: string;
  admin_response_date?: string;
  recu_link?: string;
}

const Workshops = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [workshopRequests, setWorkshopRequests] = useState<WorkshopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState<{[key: number]: number}>({});
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');
  const [isViewReceiptModalOpen, setIsViewReceiptModalOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentUserId = user?.id || null;

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSectionSelect = (section: string) => {
    if (section === 'packs') {
      navigate('/dashboard');
    } else if (section === 'reviews') {
      navigate('/reviews');
    } else if (section === 'challenges') {
      navigate('/challenges');
    } else if (section === 'blogs') {
      navigate('/blogs');
    } else if (section === 'workshops') {
      // Already on workshops page
    } else {
      // Handle other sections
    }
  };

  const fetchWorkshops = async () => {
    try {
      // Try direct call first
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshops.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.workshops) {
        setWorkshops(data.workshops.filter((workshop: Workshop) => workshop.status === 'active'));
      }
    } catch (error) {
      console.error('Direct API call failed:', error);
      
      // For GET requests, try CORS proxy as fallback
      try {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://spadadibattaglia.com/mom/api/workshops.php'));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);
        if (data.success && data.workshops) {
          setWorkshops(data.workshops.filter((workshop: Workshop) => workshop.status === 'active'));
        }
      } catch (proxyError) {
        console.error('Proxy call also failed:', proxyError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
    if (currentUserId) {
      fetchWorkshopRequests();
    }
  }, [currentUserId]);

  const fetchWorkshopRequests = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/workshop_requests.php?user_id=${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        const requests = data.data || [];
        setWorkshopRequests(requests);
        
        // Map workshop IDs to request IDs for pending requests
        const uploadMap: {[key: number]: number} = {};
        requests.forEach((request: any) => {
          if (request.status === 'pending') {
            uploadMap[request.workshop_id] = request.id;
          }
        });
        setShowReceiptUpload(uploadMap);
      }
    } catch (error) {
      console.error('Error fetching workshop requests:', error);
    }
  };

  const getWorkshopRequestStatus = (workshopId: number) => {
    const request = workshopRequests.find(req => Number(req.workshop_id) === workshopId);
    return request?.status || null;
  };

  const getWorkshopRequest = (workshopId: number) => {
    return workshopRequests.find(req => Number(req.workshop_id) === workshopId);
  };

  const handleWorkshopRequest = async (workshopId: number) => {
    setActionLoading(String(workshopId));
    try {
      const uid = Number(currentUserId);
      const wid = Number(workshopId);
      
      if (!uid || !wid) {
        throw new Error('Invalid user_id or workshop_id');
      }

      const formData = new FormData();
      formData.append('user_id', String(uid));
      formData.append('workshop_id', String(wid));

      const response = await fetch('https://spadadibattaglia.com/mom/api/workshop_requests.php', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (data.success) {
        toast({ title: 'تم إرسال طلب التسجيل', description: 'سيتم مراجعة طلبك من قبل الإدارة قريباً' });
        
        // Show receipt upload option
        setShowReceiptUpload(prev => ({
          ...prev,
          [workshopId]: data.data.id
        }));
        
        fetchWorkshopRequests();
      } else {
        throw new Error(data.message || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('Workshop request error:', error);
      toast({
        title: 'خطأ في الاتصال',
        description: error?.message || 'تعذر الاتصال بالخادم',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReceiptUploadComplete = (imageUrl: string) => {
    fetchWorkshopRequests();
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsViewReceiptModalOpen(true);
  };

  const handleAccessWorkshop = (workshopId: number) => {
    navigate(`/workshop/${workshopId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الورش...</p>
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
              <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy - أكاديمية الأم" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">ورشات عملية ومكثفة</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">ورش تدريبية متخصصة للأمهات</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard} 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout - Content + Sidebar Side by Side */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Content Area - Left Side */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 transition-all duration-200 overflow-x-hidden overflow-y-auto">
            {/* Header Section */}
            <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ورشات</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ورش تدريبية متخصصة تقدم حلول عملية ومباشرة لأهم التحديات التي تواجه الأمهات
              </p>
            </div>

            {/* Workshops Grid */}
            {workshops.length > 0 ? (
              <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-8">
                {workshops.map((workshop, index) => (
                  <Card 
                    key={workshop.id} 
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      {/* Workshop Header */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                          {workshop.type}
                        </span>
                        <h3 
                          className={`text-xl font-bold text-primary mb-2 ${getTextAlignmentClasses(workshop.title)} ${getContainerDirection(workshop.title)}`}
                          dir={getTextDirection(workshop.title)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {workshop.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p 
                        className={`text-muted-foreground mb-4 leading-relaxed ${getTextAlignmentClasses(workshop.description)} ${getContainerDirection(workshop.description)}`}
                        dir={getTextDirection(workshop.description)}
                        style={{ unicodeBidi: 'plaintext' }}
                      >
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
                          <span>الدفعة القادمة: {formatDate(workshop.next_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>مسجل: {workshop.enrolled_count}/{workshop.max_participants}</span>
                        </div>
                        {workshop.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{workshop.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Highlights */}
                      {workshop.highlights && workshop.highlights.length > 0 && (
                        <div className="mb-4">
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {workshop.highlights.slice(0, 2).map((highlight, index) => (
                              <li key={index}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Status Badge and Actions */}
                      {(() => {
                        const requestStatus = getWorkshopRequestStatus(workshop.id);
                        const request = getWorkshopRequest(workshop.id);
                        const hasUploadedReceipt = request && request.recu_link;

                        if (requestStatus === 'accepted') {
                          return (
                            <div className="space-y-2">
                              <Badge className="w-full bg-green-100 text-green-700 hover:bg-green-100 justify-center py-2">
                                <CheckCircle className="w-4 h-4 ml-2" />
                                مقبول - يمكنك الوصول للمحتوى
                              </Badge>
                              <Button 
                                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full"
                                onClick={() => handleAccessWorkshop(workshop.id)}
                              >
                                الدخول إلى الورشة
                                <ArrowLeft className="w-4 h-4 mr-2" />
                              </Button>
                            </div>
                          );
                        }

                        if (requestStatus === 'pending') {
                          return (
                            <div className="space-y-2">
                              <Badge className="w-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100 justify-center py-2">
                                <AlertCircle className="w-4 h-4 ml-2" />
                                قيد المراجعة
                              </Badge>
                              
                              {/* Receipt Upload Zone - Show directly when no receipt */}
                              {!hasUploadedReceipt && showReceiptUpload[workshop.id] && (
                                <ReceiptUpload 
                                  requestId={showReceiptUpload[workshop.id]}
                                  onUploadComplete={handleReceiptUploadComplete}
                                  apiEndpoint="workshop_requests"
                                />
                              )}
                              
                              {/* View Uploaded Receipt Button */}
                              {hasUploadedReceipt && (
                                <Button 
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleViewReceipt(request!.recu_link)}
                                >
                                  <Eye className="w-4 h-4 ml-2" />
                                  عرض الإيصال المرفوع
                                </Button>
                              )}
                            </div>
                          );
                        }

                        if (requestStatus === 'rejected') {
                          return (
                            <Badge className="w-full bg-red-100 text-red-700 hover:bg-red-100 justify-center py-2">
                              <AlertCircle className="w-4 h-4 ml-2" />
                              مرفوض - {request?.admin_notes || 'يرجى التواصل مع الإدارة'}
                            </Badge>
                          );
                        }

                        // No request yet
                        return (
                          <Button 
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full"
                            onClick={() => handleWorkshopRequest(workshop.id)}
                            disabled={actionLoading === String(workshop.id)}
                          >
                            {actionLoading === String(workshop.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                جاري الإرسال...
                              </>
                            ) : (
                              <>
                                اطلبي الورشة الآن
                                <ArrowLeft className="w-4 h-4 mr-2" />
                              </>
                            )}
                          </Button>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">لا توجد ورش متاحة حاليًا</p>
                <p className="text-sm text-muted-foreground">سيتم إضافة ورش جديدة قريباً</p>
              </div>
            )}

            {/* Call to Action */}
            <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8 max-w-2xl mx-auto">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    لديك فكرة لورشة جديدة؟
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    نحن نستمع لاحتياجاتكم ونطور ورش جديدة باستمرار. شاركينا أفكارك واقتراحاتك
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-white" 
                    onClick={() => {
                      const message = encodeURIComponent("لدي اقتراح لورشة جديدة أود مناقشتها معكم");
                      window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                    }}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    اقترحي ورشة جديدة
                  </Button>
                </CardContent>
              </Card>
            </div>
        </main>

        {/* Sidebar - Right Side */}
        <UserSidebar 
          onSectionSelect={handleSectionSelect}
          isOpen={isMobile ? isSidebarOpen : true}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      {/* Floating WhatsApp */}
      <EnhancedFloatingWhatsApp />

      {/* View Receipt Modal */}
      <Dialog open={isViewReceiptModalOpen} onOpenChange={setIsViewReceiptModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-right">إيصال الدفع</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img 
              src={selectedReceiptUrl} 
              alt="Receipt" 
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workshops;