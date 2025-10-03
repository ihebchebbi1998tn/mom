import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PlayCircle } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ModernVideoModal from "@/components/ModernVideoModal";

interface Video {
  id: string;
  workshop_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
}

const WorkshopViewer = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string, poster?: string} | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    if (workshopId && user?.id) {
      checkAccessAndFetchVideos();
    }
  }, [workshopId, user?.id]);

  const checkAccessAndFetchVideos = async () => {
    try {
      // Check if user has accepted request
      const requestResponse = await fetch(`https://spadadibattaglia.com/mom/api/workshop_requests.php?user_id=${user?.id}&workshop_id=${workshopId}`);
      const requestData = await requestResponse.json();
      
      const hasAccess = requestData.success && requestData.data?.some((req: any) => req.status === 'accepted');
      
      if (!hasAccess) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية للوصول لهذه الورشة",
          variant: "destructive"
        });
        navigate('/workshops');
        return;
      }

      // Fetch videos
      const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/workshop_videos.php?workshop_id=${workshopId}&user_access=true`);
      const videosData = await videosResponse.json();
      
      if (videosData.success) {
        setVideos(videosData.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل محتوى الورشة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo({
      url: video.video_url,
      title: video.title,
      poster: video.thumbnail_url
    });
    setIsVideoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/workshops')}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">محتوى الورشة</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleVideoClick(video)}>
              <CardContent className="p-4">
                <div className="relative mb-3">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-40 object-cover rounded" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                {video.description && <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ModernVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
        poster={selectedVideo?.poster}
      />
    </div>
  );
};

export default WorkshopViewer;
