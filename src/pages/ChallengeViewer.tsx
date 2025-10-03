import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Loader2 } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import ModernVideoModal from "@/components/ModernVideoModal";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  order_index: number;
}

const ChallengeViewer = () => {
  const { challengeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (challengeId && user?.id) {
      checkAccessAndFetchVideos();
    }
  }, [challengeId, user?.id]);

  const checkAccessAndFetchVideos = async () => {
    try {
      // Check if user has access to this challenge
      const accessResponse = await fetch(`https://spadadibattaglia.com/mom/api/challenge_requests.php?user_id=${user?.id}`);
      const accessData = await accessResponse.json();
      
      if (!accessData.success) {
        throw new Error('Failed to check access');
      }

      const request = accessData.data.find((req: any) => 
        String(req.challenge_id) === challengeId && req.status === 'accepted'
      );

      if (!request) {
        toast({
          title: 'غير مصرح بالوصول',
          description: 'ليس لديك صلاحية للوصول إلى هذا التحدي',
          variant: 'destructive',
        });
        navigate('/challenges');
        return;
      }

      // Fetch challenge videos
      const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/challenge_videos.php?challenge_id=${challengeId}&user_access=true`);
      const videosData = await videosResponse.json();
      
      if (videosData.success) {
        setVideos(videosData.videos || []);
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

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل محتوى التحدي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/challenges')}
          className="mb-6"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى التحديات
        </Button>

        <h1 className="text-3xl font-bold text-primary mb-8 text-center">محتوى التحدي</h1>

        {videos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleVideoClick(video)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center group">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-16 h-16 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-primary mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>الفيديو {video.order_index + 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">لا توجد فيديوهات متاحة حالياً</p>
          </div>
        )}
      </div>

      <ModernVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={selectedVideo?.video_url || ''}
        title={selectedVideo?.title || ''}
      />
    </div>
  );
};

export default ChallengeViewer;
