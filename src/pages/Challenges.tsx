import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, ArrowLeft, Trophy, Users, Calendar, CheckCircle, Menu, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { UserSidebar } from "@/components/UserSidebar";
import EnhancedFloatingWhatsApp from "@/components/EnhancedFloatingWhatsApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import ReceiptUpload from "@/components/ReceiptUpload";

interface Challenge {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  participants: number;
  reward: string;
  status: 'active' | 'upcoming' | 'completed';
  start_date: string;
  end_date: string;
  price: string;
}

interface ChallengeRequest {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes: string | null;
  recu_link: string | null;
  created_at: string;
  admin_response_date: string | null;
  challenge_title: string;
}

const Challenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeRequests, setChallengeRequests] = useState<ChallengeRequest[]>([]);
  const [challengePackAccess, setChallengePackAccess] = useState<{[key: number]: {hasAccess: boolean, packName?: string}}>({});
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

  const fetchChallenges = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/challenges.php');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (data.success && data.challenges) {
        setChallenges(data.challenges.filter((c: Challenge) => c.status === 'active' || c.status === 'upcoming'));
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallengeRequests = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/challenge_requests.php?user_id=${currentUserId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Challenges] Fetched requests:', data);
      
      if (data.success) {
        const requests = data.data || [];
        setChallengeRequests(requests);
        
        // Map challenge IDs to request IDs for pending requests
        const uploadMap: {[key: number]: number} = {};
        requests.forEach((request: any) => {
          if (request.status === 'pending') {
            uploadMap[Number(request.challenge_id)] = Number(request.id);
          }
        });
        console.log('[Challenges] Upload map:', uploadMap);
        setShowReceiptUpload(uploadMap);
      }
    } catch (error) {
      console.error('Error fetching challenge requests:', error);
      // Silently fail - user might not have any requests yet
      setChallengeRequests([]);
      setShowReceiptUpload({});
    }
  };

  useEffect(() => {
    fetchChallenges();
    if (currentUserId) {
      fetchChallengeRequests();
    }
  }, [currentUserId]);

  // Check pack access for all challenges
  useEffect(() => {
    if (currentUserId && challenges.length > 0) {
      checkAllChallengePackAccess();
    }
  }, [currentUserId, challenges]);

  const checkAllChallengePackAccess = async () => {
    const accessMap: {[key: number]: {hasAccess: boolean, packName?: string}} = {};
    
    await Promise.all(
      challenges.map(async (challenge) => {
        try {
          const response = await fetch(`https://spadadibattaglia.com/mom/api/check_challenge_access.php?user_id=${currentUserId}&challenge_id=${challenge.id}`);
          const data = await response.json();
          
          if (data.success && data.hasAccess && data.accessType === 'pack') {
            accessMap[challenge.id] = {
              hasAccess: true,
              packName: data.packName
            };
          }
        } catch (error) {
          console.error(`Error checking pack access for challenge ${challenge.id}:`, error);
        }
      })
    );
    
    setChallengePackAccess(accessMap);
  };

  const getChallengeRequestStatus = (challengeId: number) => {
    const request = challengeRequests.find(req => Number(req.challenge_id) === challengeId);
    return request?.status || null;
  };

  const getChallengeRequest = (challengeId: number) => {
    return challengeRequests.find(req => Number(req.challenge_id) === challengeId);
  };

  // Check if user has requested a specific challenge (any status)
  const hasRequestedChallenge = (challengeId: number) => {
    return challengeRequests.some(req => Number(req.challenge_id) === challengeId);
  };

  // Check if prerequisites are met for a challenge
  const checkPrerequisites = (challengeId: number): { allowed: boolean; message?: string } => {
    if (challengeId === 1) {
      return { allowed: true };
    }
    
    if (challengeId === 2) {
      if (!hasRequestedChallenge(1)) {
        return { 
          allowed: false, 
          message: 'يجب طلب التحدي الأول قبل الانضمام لهذا التحدي' 
        };
      }
      return { allowed: true };
    }
    
    if (challengeId === 3) {
      if (!hasRequestedChallenge(1) || !hasRequestedChallenge(2)) {
        return { 
          allowed: false, 
          message: 'يجب طلب التحديات 1 و 2 قبل الانضمام لهذا التحدي' 
        };
      }
      return { allowed: true };
    }
    
    return { allowed: true };
  };

  const handleChallengeRequest = async (challengeId: number) => {
    // Check prerequisites first
    const prerequisiteCheck = checkPrerequisites(challengeId);
    if (!prerequisiteCheck.allowed) {
      toast({
        title: 'التحدي مغلق',
        description: prerequisiteCheck.message,
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(String(challengeId));
    setActionLoading(String(challengeId));
    try {
      const uid = Number(currentUserId);
      const cid = Number(challengeId);
      
      if (!uid || !cid) {
        throw new Error('Invalid user_id or challenge_id');
      }

      const formData = new FormData();
      formData.append('user_id', String(uid));
      formData.append('challenge_id', String(cid));

      const response = await fetch('https://spadadibattaglia.com/mom/api/challenge_requests.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Challenges] Request response:', data);

      if (data.success) {
        toast({ title: 'تم إرسال طلب الانضمام', description: 'سيتم مراجعة طلبك من قبل الإدارة قريباً' });
        
        // Refresh requests to show current state
        await fetchChallengeRequests();
      } else {
        // If duplicate request, refresh to show existing request state
        if (data.message && data.message.includes('بالفعل')) {
          await fetchChallengeRequests();
        }
        throw new Error(data.message || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('Challenge request error:', error);
      toast({
        title: 'خطأ في الاتصال',
        description: error?.message || 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReceiptUploadComplete = (imageUrl: string) => {
    fetchChallengeRequests();
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsViewReceiptModalOpen(true);
  };

  const handleAccessChallenge = (challengeId: number) => {
    navigate(`/challenge/${challengeId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-100 text-green-700';
      case 'متوسط': return 'bg-yellow-100 text-yellow-700';
      case 'صعب': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'جاري الآن';
      case 'upcoming': return 'قريباً';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التحديات...</p>
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
        {!isMobile && (
          <UserSidebar 
            onSectionSelect={handleSectionSelect}
            isOpen={true}
            onToggle={() => {}}
          />
        )}

        {/* Content Area - Takes remaining space */}
        <main className="flex-1 px-4 md:px-8 py-6 lg:py-8 overflow-y-auto overflow-x-hidden">
          <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">تحديات تطوير الذات</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              انضمي لتحدياتنا الشخصية وطوري مهاراتك كأم واعية
            </p>
          </div>

          {challenges.length > 0 ? (
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-8">
              {challenges.map((challenge, index) => {
                const requestStatus = getChallengeRequestStatus(challenge.id);
                const request = getChallengeRequest(challenge.id);
                const hasUploadedReceipt = request && request.recu_link;
                const prerequisiteCheck = checkPrerequisites(challenge.id);

                return (
                  <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getStatusColor(challenge.status)}>
                            {getStatusText(challenge.status)}
                          </Badge>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">{challenge.title}</h3>
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">{challenge.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>المدة: {challenge.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>المشتركين: {challenge.participants}</span>
                        </div>
                      </div>

                      {/* Request Status and Actions */}
                      <div className="space-y-2">
                        {requestStatus === 'accepted' ? (
                          <div className="space-y-2">
                            <Badge className="w-full bg-green-100 text-green-700 hover:bg-green-100 justify-center py-2">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              مقبول - يمكنك الوصول للمحتوى
                            </Badge>
                            <Button 
                              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full"
                              onClick={() => handleAccessChallenge(challenge.id)}
                            >
                              الدخول إلى التحدي
                              <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                          </div>
                        ) : challengePackAccess[challenge.id]?.hasAccess ? (
                          <div className="space-y-2">
                            <Badge className="w-full bg-purple-100 text-purple-700 hover:bg-purple-100 justify-center py-2">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              مفتوح عبر {challengePackAccess[challenge.id].packName}
                            </Badge>
                            <Button 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full"
                              onClick={() => handleAccessChallenge(challenge.id)}
                            >
                              الدخول إلى التحدي
                              <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                          </div>
                        ) : requestStatus === 'pending' ? (
                          <div className="space-y-2">
                            <Badge className="w-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100 justify-center py-2">
                              <AlertCircle className="w-4 h-4 ml-2" />
                              قيد المراجعة
                            </Badge>
                            
                            {!hasUploadedReceipt && showReceiptUpload[challenge.id] && (
                              <ReceiptUpload 
                                requestId={showReceiptUpload[challenge.id]}
                                onUploadComplete={handleReceiptUploadComplete}
                                apiEndpoint="challenge_requests"
                              />
                            )}
                            
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
                        ) : requestStatus === 'rejected' ? (
                          <Badge className="w-full bg-red-100 text-red-700 hover:bg-red-100 justify-center py-2">
                            <AlertCircle className="w-4 h-4 ml-2" />
                            مرفوض - {request?.admin_notes || 'يرجى التواصل مع الإدارة'}
                          </Badge>
                        ) : !prerequisiteCheck.allowed ? (
                          <div className="space-y-2">
                            <Badge className="w-full bg-gray-100 text-gray-700 hover:bg-gray-100 justify-center py-2">
                              <AlertCircle className="w-4 h-4 ml-2" />
                              مغلق
                            </Badge>
                            <p className="text-xs text-muted-foreground text-center">
                              {prerequisiteCheck.message}
                            </p>
                          </div>
                        ) : (
                          <Button 
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full"
                            onClick={() => handleChallengeRequest(challenge.id)}
                            disabled={actionLoading === String(challenge.id) || challenge.status !== 'active'}
                          >
                            {actionLoading === String(challenge.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                جاري الإرسال...
                              </>
                            ) : challenge.status === 'active' ? (
                              <>
                                انضمي الآن
                                <CheckCircle className="w-4 h-4 mr-2" />
                              </>
                            ) : (
                              <>
                                احجزي مكانك
                                <Calendar className="w-4 h-4 mr-2" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">لا توجد تحديات متاحة حاليًا</p>
            </div>
          )}

          {/* CTA */}
          <div className={`text-center mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8 max-w-2xl mx-auto">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-primary mb-4">هل لديك فكرة لتحدي جديد؟</h3>
                <p className="text-muted-foreground mb-6">شاركينا أفكارك لتحديات جديدة تساعد الأمهات على التطوير</p>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => window.open(`https://wa.me/21652451892?text=${encodeURIComponent("لدي فكرة لتحدي جديد")}`, '_blank')}
                >
                  <Target className="w-4 h-4 ml-2" />
                  اقترحي تحدي جديد
                </Button>
              </CardContent>
            </Card>
          </div>
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

export default Challenges;
