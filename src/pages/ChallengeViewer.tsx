import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Clock, Eye, Loader2, Lock } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import VideoPlayer from "@/components/VideoPlayer";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: number;
  title: string;
  description?: string;
}

interface SubPack {
  id: number;
  title: string;
  order_index: number;
}

interface Video {
  id: number;
  sub_pack_id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  available_at?: string;
  order_index: number;
  views: number;
  status: string;
}

const ChallengeViewer = () => {
  const { challengeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [videos, setVideos] = useState<{[key: number]: Video[]}>({});
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (challengeId && user?.id) {
      checkAccess();
    }
  }, [challengeId, user?.id]);

  useEffect(() => {
    if (hasAccess && challengeId) {
      fetchChallengeData();
    }
  }, [hasAccess, challengeId]);

  const checkAccess = async () => {
    try {
      // Admins have automatic access to everything
      if (user?.role === 'admin') {
        setHasAccess(true);
        return;
      }
      
      const accessResponse = await fetch(`https://spadadibattaglia.com/mom/api/check_challenge_access.php?user_id=${user?.id}&challenge_id=${challengeId}`);
      const accessData = await accessResponse.json();

      if (!accessData.success || !accessData.hasAccess) {
        toast({
          title: 'غير مصرح بالوصول',
          description: 'ليس لديك صلاحية للوصول إلى هذا التحدي',
          variant: 'destructive',
        });
        navigate('/challenges');
        return;
      }
      
      if (accessData.accessType === 'pack') {
        toast({
          title: 'تم الوصول عبر الباك',
          description: `لديك وصول لهذا التحدي عبر ${accessData.packName}`,
        });
      }
      
      setHasAccess(true);
    } catch (error) {
      console.error('Error checking access:', error);
      toast({
        title: 'خطأ',
        description: 'فشل التحقق من صلاحية الوصول',
        variant: 'destructive',
      });
      navigate('/challenges');
    }
  };

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      
      // Fetch challenge details
      const challengeResponse = await fetch(`https://spadadibattaglia.com/mom/api/challenges.php?id=${challengeId}`);
      const challengeData = await challengeResponse.json();
      
      if (challengeData.success && challengeData.challenges) {
        setChallenge(challengeData.challenges[0]);
      }

      // Fetch assigned sub-packs for this challenge
      const linksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?challenge_id=${challengeId}`);
      const linksData = await linksResponse.json();
      
      if (linksData.success && linksData.data) {
        const subPackIds = linksData.data.map((link: any) => link.sub_pack_id);
        
        // Fetch sub-pack details and videos
        const subPacksData: SubPack[] = [];
        const videosMap: {[key: number]: Video[]} = {};
        
        for (const subPackId of subPackIds) {
          // Fetch sub-pack details
          const subPackResponse = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?id=${subPackId}`);
          const subPackData = await subPackResponse.json();
          
          if (subPackData.success && subPackData.data) {
            subPacksData.push(subPackData.data);
            
            // Fetch videos for this sub-pack
            const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPackId}`);
            const videosData = await videosResponse.json();
            
            if (videosData.success && videosData.data) {
              // Filter by status AND available_at date
              const now = new Date();
              videosMap[subPackId] = videosData.data.filter((v: Video) => {
                if (v.status !== 'active') return false;
                // If available_at is set, only show if the time has passed
                if (v.available_at) {
                  const availableDate = new Date(v.available_at);
                  return availableDate <= now;
                }
                // If no available_at set, show immediately
                return true;
              });
            }
          }
        }
        
        setSubPacks(subPacksData.sort((a, b) => a.order_index - b.order_index));
        setVideos(videosMap);
      }
    } catch (error) {
      console.error('Error loading challenge content:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل محتوى التحدي',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    
    // Update video views
    fetch(`https://spadadibattaglia.com/mom/api/videos.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: video.id,
        sub_pack_id: video.sub_pack_id,
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        duration: video.duration,
        order_index: video.order_index,
        status: video.status,
        views: video.views + 1
      })
    }).catch(() => {
      // Ignore errors for view counting
    });
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-4">الوصول محظور</h2>
          <p className="text-muted-foreground mb-6">ليس لديك صلاحية للوصول لهذا التحدي</p>
          <Button onClick={() => navigate('/challenges')} className="btn-hero">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للتحديات
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل محتوى التحدي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/challenges')}
              className="btn-outline"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
          
          {challenge && (
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2" dir="rtl">
                {challenge.title}
              </h1>
              {challenge.description && (
                <p className="text-muted-foreground mb-4" dir="rtl">{challenge.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Videos Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-elegant p-6 sticky top-4">
              <h3 className="text-xl font-bold text-foreground mb-6">محتوى التحدي</h3>
              
              <div className="space-y-4">
                {subPacks.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    لا توجد كبسولات متاحة
                  </div>
                ) : (
                  subPacks.map((subPack) => {
                    const subPackVideos = videos[subPack.id] || [];
                    
                    return (
                      <div key={subPack.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="p-3 bg-muted/50">
                          <h4 className="font-semibold text-foreground text-sm" dir="rtl">{subPack.title}</h4>
                          <p className="text-xs text-muted-foreground">{subPackVideos.length} فيديو</p>
                        </div>
                        
                        <div className="divide-y divide-border">
                          {subPackVideos.length === 0 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              لا توجد فيديوهات متاحة حالياً
                            </div>
                          ) : (
                            subPackVideos.map((video) => (
                              <button
                                key={video.id}
                                onClick={() => handleVideoSelect(video)}
                                className={`w-full p-3 text-right hover:bg-muted/50 transition-colors ${
                                  selectedVideo?.id === video.id ? 'bg-primary/10' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Play className="w-3 h-3 text-primary flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-foreground text-xs truncate" dir="rtl">
                                      {video.title}
                                    </h5>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                      {video.duration && <span>{video.duration}</span>}
                                      <span>{video.views} مشاهدة</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Video Player Area */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <div className="space-y-6">
                <Card className="card-elegant overflow-hidden">
                  <VideoPlayer 
                    src={selectedVideo.video_url} 
                    title={selectedVideo.title}
                    className="w-full aspect-video"
                    videoId={selectedVideo.id}
                    onUrlUpdate={(newUrl) => {
                      setSelectedVideo(prev => prev ? {...prev, video_url: newUrl} : null);
                      setVideos(prev => ({
                        ...prev,
                        [selectedVideo.sub_pack_id]: (prev[selectedVideo.sub_pack_id] || []).map(video => 
                          video.id === selectedVideo.id ? {...video, video_url: newUrl} : video
                        )
                      }));
                    }}
                  />
                </Card>
                
                <Card className="card-elegant p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4" dir="rtl">
                    {selectedVideo.title}
                  </h2>
                  
                  {selectedVideo.description && (
                    <p className="text-muted-foreground mb-4 leading-relaxed" dir="rtl">
                      {selectedVideo.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {selectedVideo.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>المدة: {selectedVideo.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>المشاهدات: {selectedVideo.views}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="card-elegant p-12">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    اختاري فيديو للمشاهدة
                  </h3>
                  <p className="text-muted-foreground">
                    اختاري فيديو من القائمة الجانبية لبدء المشاهدة
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeViewer;
