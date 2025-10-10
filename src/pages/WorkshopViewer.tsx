import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Clock, Eye, Loader2, Lock } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/VideoPlayer";

interface Workshop {
  id: number;
  title: string;
  description?: string;
}

interface Video {
  id: number;
  workshop_id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
  views: number;
  status: string;
}

const WorkshopViewer = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (workshopId && user?.id) {
      checkAccess();
    }
  }, [workshopId, user?.id]);

  useEffect(() => {
    if (hasAccess && workshopId) {
      fetchWorkshopData();
    }
  }, [hasAccess, workshopId]);

  const checkAccess = async () => {
    try {
      const accessResponse = await fetch(`https://spadadibattaglia.com/mom/api/check_workshop_access.php?user_id=${user?.id}&workshop_id=${workshopId}`);
      const accessData = await accessResponse.json();
      
      if (!accessData.success || !accessData.hasAccess) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية للوصول لهذه الورشة",
          variant: "destructive"
        });
        navigate('/workshops');
        return;
      }
      
      if (accessData.accessType === 'pack') {
        toast({
          title: "تم الوصول عبر الباك",
          description: `لديك وصول لهذه الورشة عبر ${accessData.packName}`,
        });
      }
      
      setHasAccess(true);
    } catch (error) {
      console.error('Error checking access:', error);
      toast({
        title: "خطأ",
        description: "فشل التحقق من صلاحية الوصول",
        variant: "destructive"
      });
      navigate('/workshops');
    }
  };

  const fetchWorkshopData = async () => {
    try {
      setLoading(true);
      
      // Fetch workshop details
      const workshopResponse = await fetch(`https://spadadibattaglia.com/mom/api/workshops.php?id=${workshopId}`);
      const workshopData = await workshopResponse.json();
      
      if (workshopData.success && workshopData.workshops) {
        setWorkshop(workshopData.workshops[0]);
      }

      // Fetch workshop videos
      const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/workshop_videos.php?workshop_id=${workshopId}&user_access=true`);
      const videosData = await videosResponse.json();
      
      if (videosData.success) {
        const activeVideos = (videosData.data || []).filter((v: Video) => v.status === 'active');
        setVideos(activeVideos);
      }
    } catch (error) {
      console.error('Error loading workshop content:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل محتوى الورشة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    
    // Update video views
    fetch(`https://spadadibattaglia.com/mom/api/workshop_videos.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: video.id,
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
          <p className="text-muted-foreground mb-6">ليس لديك صلاحية للوصول لهذه الورشة</p>
          <Button onClick={() => navigate('/workshops')} className="btn-hero">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للورش
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
          <p className="text-muted-foreground">جاري تحميل محتوى الورشة...</p>
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
              onClick={() => navigate('/workshops')}
              className="btn-outline"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
          
          {workshop && (
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {workshop.title}
              </h1>
              {workshop.description && (
                <p className="text-muted-foreground mb-4">{workshop.description}</p>
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
              <h3 className="text-xl font-bold text-foreground mb-6">فيديوهات الورشة</h3>
              
              <div className="space-y-2">
                {videos.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    لا توجد فيديوهات متاحة
                  </div>
                ) : (
                  videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={`w-full p-4 text-right hover:bg-muted/50 transition-colors rounded-lg border border-border ${
                        selectedVideo?.id === video.id ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground text-sm">{video.title}</h5>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            {video.duration && <span>{video.duration}</span>}
                            <span>{video.views} مشاهدة</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
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
                      setVideos(prev => prev.map(video => 
                        video.id === selectedVideo.id ? {...video, video_url: newUrl} : video
                      ));
                    }}
                  />
                </Card>
                
                <Card className="card-elegant p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {selectedVideo.title}
                  </h2>
                  
                  {selectedVideo.description && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">
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

export default WorkshopViewer;
