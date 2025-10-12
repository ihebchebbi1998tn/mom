import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, ArrowLeft, CheckCircle, Menu, AlertCircle, Eye, Loader2, Play } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import ReceiptUpload from "@/components/ReceiptUpload";
interface SubPack {
  id: number;
  title: string;
  description: string;
  price: string;
  banner_image_url: string;
  video_count?: number;
}
interface SubPackRequest {
  id: string;
  user_id: string;
  sub_pack_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes: string | null;
  recu_link: string | null;
  created_at: string;
  admin_response_date: string | null;
  sub_pack_title: string;
}
const Challenges = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [subPackRequests, setSubPackRequests] = useState<SubPackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState<{
    [key: number]: number;
  }>({});
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');
  const [isViewReceiptModalOpen, setIsViewReceiptModalOpen] = useState(false);
  const {
    ref,
    isVisible
  } = useScrollAnimation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentUserId = user?.id || null;
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
    } else if (section === 'blogs') {
      navigate('/blogs');
    } else if (section === 'challenges') {
      // Already on challenges page
    }
  };
  const fetchSubPacks = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (data.success && data.data) {
        // Filter for IDs 9, 10, 11 and sort them
        const filteredPacks = data.data.filter((pack: SubPack) => [9, 10, 11].includes(pack.id)).sort((a: SubPack, b: SubPack) => a.id - b.id);
        setSubPacks(filteredPacks);
      }
    } catch (error) {
      console.error('Error fetching sub packs:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSubPackRequests = async () => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_pack_requests.php?user_id=${currentUserId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('[Challenges] Fetched sub pack requests:', data);
      if (data.success) {
        const requests = data.data || [];
        // Filter for requests related to sub_packs 9, 10, 11
        const filteredRequests = requests.filter((req: any) => [9, 10, 11].includes(Number(req.sub_pack_id)));
        setSubPackRequests(filteredRequests);

        // Map sub_pack IDs to request IDs for pending requests
        const uploadMap: {
          [key: number]: number;
        } = {};
        filteredRequests.forEach((request: any) => {
          if (request.status === 'pending') {
            uploadMap[Number(request.sub_pack_id)] = Number(request.id);
          }
        });
        console.log('[Challenges] Upload map:', uploadMap);
        setShowReceiptUpload(uploadMap);
      }
    } catch (error) {
      console.error('Error fetching sub pack requests:', error);
      setSubPackRequests([]);
      setShowReceiptUpload({});
    }
  };
  useEffect(() => {
    fetchSubPacks();
    if (currentUserId) {
      fetchSubPackRequests();
    }
  }, [currentUserId]);
  const getSubPackRequestStatus = (subPackId: number) => {
    const request = subPackRequests.find(req => Number(req.sub_pack_id) === subPackId);
    return request?.status || null;
  };
  const getSubPackRequest = (subPackId: number) => {
    return subPackRequests.find(req => Number(req.sub_pack_id) === subPackId);
  };

  // Check if user has requested a specific sub pack (accepted status)
  const hasAcceptedSubPack = (subPackId: number) => {
    return subPackRequests.some(req => Number(req.sub_pack_id) === subPackId && req.status === 'accepted');
  };

  // Check if prerequisites are met for a sub pack
  const checkPrerequisites = (subPackId: number): {
    allowed: boolean;
    message?: string;
  } => {
    if (subPackId === 9) {
      return {
        allowed: true
      };
    }
    if (subPackId === 10 || subPackId === 11) {
      if (!hasAcceptedSubPack(9)) {
        return {
          allowed: false,
          message: 'يجب إتمام الدورة الأولى قبل الانضمام لهذه الدورة'
        };
      }
      return {
        allowed: true
      };
    }
    return {
      allowed: true
    };
  };
  const handleSubPackRequest = async (subPackId: number) => {
    // Check prerequisites first
    const prerequisiteCheck = checkPrerequisites(subPackId);
    if (!prerequisiteCheck.allowed) {
      toast({
        title: 'الدورة مغلقة',
        description: prerequisiteCheck.message,
        variant: 'destructive'
      });
      return;
    }
    setActionLoading(String(subPackId));
    try {
      const uid = Number(currentUserId);
      const spid = Number(subPackId);
      if (!uid || !spid) {
        throw new Error('Invalid user_id or sub_pack_id');
      }
      const formData = new FormData();
      formData.append('user_id', String(uid));
      formData.append('sub_pack_id', String(spid));
      const response = await fetch('https://spadadibattaglia.com/mom/api/sub_pack_requests.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('[Challenges] Request response:', data);
      if (data.success) {
        toast({
          title: 'تم إرسال طلب الانضمام',
          description: 'سيتم مراجعة طلبك من قبل الإدارة قريباً'
        });
        await fetchSubPackRequests();
      } else {
        if (data.message && data.message.includes('بالفعل')) {
          await fetchSubPackRequests();
        }
        throw new Error(data.message || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('Sub pack request error:', error);
      toast({
        title: 'خطأ في الاتصال',
        description: error?.message || 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };
  const handleReceiptUploadComplete = (imageUrl: string) => {
    fetchSubPackRequests();
  };
  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsViewReceiptModalOpen(true);
  };
  const handleAccessSubPack = (subPackId: number) => {
    navigate(`/subpack/${subPackId}`);
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التحديات...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-30 shadow-lg shadow-pink-100/20 w-full transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleBackToDashboard} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              {/* Mobile Menu Button */}
              {isMobile && <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-pink-50 rounded-xl transition-colors duration-200">
                  <Menu className="w-5 h-5" />
                </Button>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-right">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">تحديات تطوير الذات</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">تحديات لتطوير مهاراتك الشخصية</p>
              </div>
              <img src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" alt="MomAcademy" className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] w-full">
        {/* Sidebar - Left Side (Desktop Only) */}
        {!isMobile && <UserSidebar onSectionSelect={handleSectionSelect} isOpen={true} onToggle={() => {}} />}

        {/* Content Area - Takes remaining space */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 overflow-y-auto overflow-x-hidden">
          <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">تحديات تطوير الذات</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              انضمي لدوراتنا التطويرية وطوري مهاراتك كأم واعية
            </p>
          </div>

          {subPacks.length > 0 ? <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-8">
              {subPacks.map((subPack, index) => {
            const requestStatus = getSubPackRequestStatus(subPack.id);
            const request = getSubPackRequest(subPack.id);
            const hasUploadedReceipt = request && request.recu_link;
            const prerequisiteCheck = checkPrerequisites(subPack.id);
            return <Card key={subPack.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
                    {/* Sub-Pack Banner Image */}
                    {subPack.banner_image_url ? <div className="relative h-48 overflow-hidden">
                        <img src={subPack.banner_image_url} alt={subPack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div> : <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                              <span className="font-bold text-xl">{index + 1}</span>
                            </div>
                            <Target className="w-6 h-6 opacity-75 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="text-xl lg:text-2xl font-bold leading-tight">{subPack.title}</h3>
                        </div>
                      </div>}
                    
                    <CardContent className="p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{subPack.title}</h3>
                      {subPack.description && <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          {subPack.description}
                        </p>}

                      {/* Request Status and Actions */}
                      <div className="space-y-2">
                        {user?.role === 'admin' ? <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full" onClick={() => handleAccessSubPack(subPack.id)}>
                              الدخول إلى الدورة
                              <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button> : requestStatus === 'accepted' ? <div className="space-y-2">
                            <Badge className="w-full bg-green-100 text-green-700 hover:bg-green-100 justify-center py-2">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              مقبول - يمكنك الوصول للمحتوى
                            </Badge>
                            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full" onClick={() => handleAccessSubPack(subPack.id)}>
                              الدخول إلى الدورة
                              <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                          </div> : requestStatus === 'pending' ? <div className="space-y-2">
                            <Badge className="w-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100 justify-center py-2">
                              <AlertCircle className="w-4 h-4 ml-2" />
                              قيد المراجعة
                            </Badge>
                            
                            {!hasUploadedReceipt && showReceiptUpload[subPack.id] && <ReceiptUpload requestId={showReceiptUpload[subPack.id]} onUploadComplete={handleReceiptUploadComplete} apiEndpoint="sub_pack_requests" />}
                            
                            {hasUploadedReceipt && <Button variant="outline" className="w-full" onClick={() => handleViewReceipt(request!.recu_link)}>
                                <Eye className="w-4 h-4 ml-2" />
                                عرض الإيصال المرفوع
                              </Button>}
                          </div> : requestStatus === 'rejected' ? <Badge className="w-full bg-red-100 text-red-700 hover:bg-red-100 justify-center py-2">
                            <AlertCircle className="w-4 h-4 ml-2" />
                            مرفوض - {request?.admin_notes || 'يرجى التواصل مع الإدارة'}
                          </Badge> : !prerequisiteCheck.allowed ? <div className="space-y-2">
                            <Badge className="w-full bg-gray-100 text-gray-700 hover:bg-gray-100 justify-center py-2">
                              <AlertCircle className="w-4 h-4 ml-2" />
                              مغلقة
                            </Badge>
                            <p className="text-xs text-muted-foreground text-center">
                              {prerequisiteCheck.message}
                            </p>
                          </div> : <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full" onClick={() => handleSubPackRequest(subPack.id)} disabled={actionLoading === String(subPack.id)}>
                            {actionLoading === String(subPack.id) ? <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                جاري الإرسال...
                              </> : <>
                                انضمي الآن
                                <CheckCircle className="w-4 h-4 mr-2" />
                              </>}
                          </Button>}
                      </div>
                    </CardContent>
                  </Card>;
          })}
            </div> : <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">لا توجد دورات متاحة حاليًا</p>
            </div>}

          {/* CTA */}
          <div className={`text-center mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            
          </div>
        </main>

        {/* Mobile Sidebar - Overlay */}
        {isMobile && <UserSidebar onSectionSelect={handleSectionSelect} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}
      </div>
      
      <EnhancedFloatingWhatsApp />

      {/* View Receipt Modal */}
      <Dialog open={isViewReceiptModalOpen} onOpenChange={setIsViewReceiptModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-right">إيصال الدفع</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img src={selectedReceiptUrl} alt="Receipt" className="max-w-full h-auto rounded-lg shadow-lg" style={{
            maxHeight: '70vh'
          }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Challenges;