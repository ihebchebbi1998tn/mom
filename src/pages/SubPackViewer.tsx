import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ModernVideoModal from "@/components/ModernVideoModal";
import VideoThumbnail from "@/components/VideoThumbnail";
import VideoPrivacyModal from "@/components/VideoPrivacyModal";

interface SubPack {
  id: number;
  pack_id: number;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  intro_video_url: string | null;
  order_index: number;
  status: string;
}

interface Video {
  id: string;
  sub_pack_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
}

const SubPackViewer = () => {
  const { subPackId } = useParams<{ subPackId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subPack, setSubPack] = useState<SubPack | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    title: string;
    poster?: string;
    videoId?: string;
  } | null>(null);
  const [watchedVideosState, setWatchedVideosState] = useState<string[]>([]);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (subPackId) {
      checkAccessAndFetchData();
    }
  }, [subPackId]);

  useEffect(() => {
    // Load watched videos from localStorage
    const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
    setWatchedVideosState(watchedVideos);
    
    // Show privacy modal if not seen before
    const hasSeenPrivacyModal = localStorage.getItem('hasSeenVideoPrivacyModal');
    if (!hasSeenPrivacyModal) {
      setShowPrivacyModal(true);
    }
  }, []);

  const checkAccessAndFetchData = async () => {
    try {
      setLoading(true);
      
      // Admins have automatic access to everything
      if (user?.role === 'admin') {
        await fetchSubPackDetails();
        await fetchVideos();
        setLoading(false);
        return;
      }
      
      // Check if user has access to this sub-pack
      const response = await fetch(
        `https://spadadibattaglia.com/mom/api/sub_pack_requests.php?user_id=${user?.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        const hasAccess = data.data.some(
          (req: any) => 
            Number(req.sub_pack_id) === Number(subPackId) && 
            req.status === 'accepted'
        );
        
        if (!hasAccess) {
          toast({
            title: "الوصول غير متاح",
            description: "ليس لديك صلاحية للوصول لهذه الدورة",
            variant: "destructive"
          });
          navigate('/challenges');
          return;
        }
        
        // Fetch sub-pack details
        await fetchSubPackDetails();
        // Fetch videos
        await fetchVideos();
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast({
        title: "خطأ",
        description: "تعذر التحقق من الصلاحيات",
        variant: "destructive"
      });
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubPackDetails = async () => {
    try {
      const response = await fetch(
        `https://spadadibattaglia.com/mom/api/sub_packs.php?id=${subPackId}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setSubPack(data.data);
      }
    } catch (error) {
      console.error('Error fetching sub-pack details:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPackId}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo({
      url: video.video_url,
      title: video.title,
      poster: video.thumbnail_url,
      videoId: video.id
    });
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
    // Refresh watched videos state to update UI
    const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
    setWatchedVideosState(watchedVideos);
  };

  const isVideoWatched = (videoId: string) => {
    return watchedVideosState.includes(videoId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
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
                onClick={() => navigate('/challenges')} 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-md p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-right">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                  {subPack?.title || 'الدورة'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                  {videos.length} فيديو
                </p>
              </div>
              <img 
                src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
                alt="MomAcademy" 
                className="h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 md:px-8 py-6 lg:py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            فيديوهات {subPack?.title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            شاهدي جميع الفيديوهات التعليمية لهذا الفصل واستفيدي من المحتوى القيم
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد فيديوهات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {videos.map((video, index) => (
              <Card 
                key={video.id} 
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white"
              >
                <div 
                  className="relative overflow-hidden bg-white cursor-pointer" 
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Watched Overlay */}
                  {isVideoWatched(video.id) && (
                    <div className="absolute inset-0 bg-gray-900/40 z-10 flex items-center justify-center">
                      <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                        تمت المشاهدة
                      </div>
                    </div>
                  )}
                  
                  <VideoThumbnail 
                    videoUrl={video.video_url}
                    thumbnailUrl={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-80 object-contain group-hover:scale-105 transition-transform duration-500"
                    priority={index < 2}
                    videoId={video.id}
                  />
                  
                  {/* Video Number Badge */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {video.duration && (
                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                      {video.duration}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <Button 
                    onClick={() => handleVideoClick(video)} 
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    مشاهدة الفيديو
                    <PlayCircle className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Privacy Modal */}
      <VideoPrivacyModal 
        isOpen={showPrivacyModal} 
        onClose={() => {
          setShowPrivacyModal(false);
          localStorage.setItem('hasSeenVideoPrivacyModal', 'true');
        }} 
      />

      {/* Video Modal */}
      {selectedVideo && (
        <ModernVideoModal
          isOpen={isVideoModalOpen}
          onClose={handleCloseVideoModal}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          videoId={selectedVideo.videoId}
        />
      )}
    </div>
  );
};

export default SubPackViewer;
