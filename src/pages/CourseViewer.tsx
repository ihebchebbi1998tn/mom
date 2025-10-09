import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Clock, Eye, ChevronDown, ChevronRight, Lock } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { checkSubPackLock, recordFirstAccess } from "@/config/access_timing";

interface CoursePack {
  id: number;
  title: string;
  description?: string;
  modules: string;
  price: string;
  duration: string;
  students: string;
  rating: number;
}

interface SubPack {
  id: number;
  pack_id: number;
  title: string;
  description?: string;
  order_index: number;
  status: string;
}

interface Video {
  id: number;
  sub_pack_id: number;
  title: string;
  description?: string;
  video_url: string;
  duration?: string;
  order_index: number;
  views: number;
  status: string;
}

const CourseViewer = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [coursePack, setCoursePack] = useState<CoursePack | null>(null);
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [videos, setVideos] = useState<{[key: number]: Video[]}>({});
  const [expandedSubPacks, setExpandedSubPacks] = useState<{[key: number]: boolean}>({});
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [lockedSubPacks, setLockedSubPacks] = useState<{[key: number]: { isLocked: boolean; message?: string }}>({});
  
  // Mock user ID - in real app this would come from auth context
  const currentUserId = 1;

  useEffect(() => {
    if (packageId) {
      checkAccess();
    }
  }, [packageId]);

  useEffect(() => {
    if (hasAccess && packageId) {
      fetchCourseData();
      checkLockedSubPacks();
    }
  }, [hasAccess, packageId]);

  const checkLockedSubPacks = () => {
    if (!packageId) return;
    
    const packId = parseInt(packageId);
    const locks: {[key: number]: { isLocked: boolean; message?: string }} = {};
    
    // Check sub-pack 9 for pack 4
    if (packId === 4) {
      const lockStatus = checkSubPackLock(packId, 9);
      if (lockStatus.isLocked) {
        locks[9] = {
          isLocked: lockStatus.isLocked,
          message: lockStatus.message
        };
      }
    }
    
    setLockedSubPacks(locks);
  };

  const checkAccess = async () => {
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/check_access.php?user_id=${currentUserId}&pack_id=${packageId}`);
      const data = await response.json();
      
      if (data.success && data.has_access) {
        setHasAccess(true);
      } else {
        toast({
          title: "الوصول غير متاح",
          description: "ليس لديك صلاحية للوصول لهذه الدورة",
          variant: "destructive"
        });
        navigate('/courses');
      }
    } catch (error) {
      toast({
        title: "خطأ في التحقق من الصلاحيات",
        description: "تعذر التحقق من صلاحية الوصول",
        variant: "destructive"
      });
      navigate('/courses');
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course pack details
      const packResponse = await fetch(`https://spadadibattaglia.com/mom/api/course_packs.php?id=${packageId}`);
      const packData = await packResponse.json();
      
      if (packData.success && packData.data) {
        setCoursePack(packData.data);
        
        // Fetch sub packs
        const subPacksResponse = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?pack_id=${packageId}`);
        const subPacksData = await subPacksResponse.json();
        
        if (subPacksData.success && subPacksData.data) {
          const activeSubPacks = subPacksData.data.filter((sp: SubPack) => sp.status === 'active');
          setSubPacks(activeSubPacks);
          
          // Fetch videos for each sub pack
          const videosPromises = activeSubPacks.map(async (subPack: SubPack) => {
            const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPack.id}`);
            const videosData = await videosResponse.json();
            
            if (videosData.success && videosData.data) {
              return {
                subPackId: subPack.id,
                videos: videosData.data.filter((v: Video) => v.status === 'active')
              };
            }
            return { subPackId: subPack.id, videos: [] };
          });
          
          const videosResults = await Promise.all(videosPromises);
          const videosMap = videosResults.reduce((acc, { subPackId, videos }) => {
            acc[subPackId] = videos;
            return acc;
          }, {} as {[key: number]: Video[]});
          
          setVideos(videosMap);
        }
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "تعذر تحميل محتوى الدورة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubPack = (subPackId: number) => {
    // Check if this sub-pack is locked
    if (lockedSubPacks[subPackId]?.isLocked) {
      toast({
        title: "Capsule verrouillée",
        description: lockedSubPacks[subPackId].message,
        variant: "destructive"
      });
      return;
    }
    
    // Record first access for pack 4
    if (packageId && parseInt(packageId) === 4) {
      recordFirstAccess(4);
      // Recheck locks after recording first access
      setTimeout(() => checkLockedSubPacks(), 100);
    }
    
    setExpandedSubPacks(prev => ({
      ...prev,
      [subPackId]: !prev[subPackId]
    }));
  };

  const handleVideoSelect = (video: Video) => {
    // Check if the sub-pack this video belongs to is locked
    if (lockedSubPacks[video.sub_pack_id]?.isLocked) {
      toast({
        title: "Capsule verrouillée",
        description: lockedSubPacks[video.sub_pack_id].message,
        variant: "destructive"
      });
      return;
    }
    
    // Record first access for pack 4
    if (packageId && parseInt(packageId) === 4) {
      recordFirstAccess(4);
      // Recheck locks after recording first access
      setTimeout(() => checkLockedSubPacks(), 100);
    }
    
    setSelectedVideo(video);
    
    // Update video views (optional)
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
          <p className="text-muted-foreground mb-6">ليس لديك صلاحية للوصول لهذه الدورة</p>
          <Button onClick={() => navigate('/courses')} className="btn-hero">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للدورات
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
          <p className="text-muted-foreground">جاري تحميل محتوى الدورة...</p>
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
              onClick={() => navigate('/courses')}
              className="btn-outline"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
          
          {coursePack && (
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {coursePack.title}
              </h1>
              {coursePack.description && (
                <p className="text-muted-foreground mb-4">{coursePack.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{coursePack.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{coursePack.students}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-elegant p-6 sticky top-4">
              <h3 className="text-xl font-bold text-foreground mb-6">محتوى الدورة</h3>
              
              <div className="space-y-4">
                {subPacks.map((subPack) => {
                  const subPackVideos = videos[subPack.id] || [];
                  const isExpanded = expandedSubPacks[subPack.id];
                  const isLocked = lockedSubPacks[subPack.id]?.isLocked;
                  
                  return (
                    <div key={subPack.id} className={`border border-border rounded-lg overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
                      <button
                        onClick={() => toggleSubPack(subPack.id)}
                        className="w-full p-4 bg-muted/50 hover:bg-muted/70 transition-colors flex items-center justify-between text-right"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{subPack.title}</h4>
                            {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {subPackVideos.length} فيديو
                          </p>
                          {isLocked && lockedSubPacks[subPack.id].message && (
                            <p className="text-xs text-destructive mt-1" dir="ltr">
                              {lockedSubPacks[subPack.id].message}
                            </p>
                          )}
                        </div>
                        {isExpanded ? 
                          <ChevronDown className="w-5 h-5 text-muted-foreground" /> :
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        }
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t border-border">
                          {subPackVideos.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              لا توجد فيديوهات متاحة
                            </div>
                          ) : (
                            subPackVideos.map((video) => (
                              <button
                                key={video.id}
                                onClick={() => handleVideoSelect(video)}
                                className={`w-full p-4 text-right hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
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
                      )}
                    </div>
                  );
                })}
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
                      // Update the selected video URL in state
                      setSelectedVideo(prev => prev ? {...prev, video_url: newUrl} : null);
                      // Update the video in videos state as well
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

export default CourseViewer;