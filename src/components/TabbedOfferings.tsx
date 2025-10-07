import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Star, Users, ArrowLeft, Calendar, Clock, MessageSquare, CheckCircle, PlayCircle, Loader2, Play, Pause, RotateCcw, Maximize } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: string;
  rating: number;
  image_url: string | null;
  intro_video_url: string | null;
  description: string;
  status: string;
}

interface SubPack {
  id: number;
  pack_id: number;
  title: string;
  description: string;
  video_count: number;
  total_duration: string;
  price: number;
  banner_image_url: string | null;
  status: string;
  order_index: number;
}

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

const TabbedOfferings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  const [activeTab, setActiveTab] = useState("packs");
  const [coursePacks, setCoursePacks] = useState<CoursePack[]>([]);
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePacksCount, setVisiblePacksCount] = useState(isMobile ? 4 : 6);
  const [visibleSubPacksCount, setVisibleSubPacksCount] = useState(isMobile ? 4 : 6);
  const [hoveredPack, setHoveredPack] = useState<number | null>(null);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [visiblePackInView, setVisiblePackInView] = useState<number | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<{ [key: number]: boolean }>({});
  const [mutedVideos, setMutedVideos] = useState<{ [key: number]: boolean }>({});
  const [videoDurations, setVideoDurations] = useState<{ [key: number]: number }>({});
  const [videoCurrentTimes, setVideoCurrentTimes] = useState<{ [key: number]: number }>({});
  const [videoPaused, setVideoPaused] = useState<{ [key: number]: boolean }>({});
  const [showControls, setShowControls] = useState<{ [key: number]: boolean }>({});
  const [controlsTimeout, setControlsTimeout] = useState<{ [key: number]: NodeJS.Timeout | null }>({});
  const packRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const loadMoreCount = isMobile ? 4 : 6;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setVisiblePacksCount(isMobile ? 4 : 6);
  }, [isMobile]);

  // Desktop: hover behavior
  useEffect(() => {
    if (!isMobile && hoveredPack !== null) {
      const timer = setTimeout(() => {
        setPlayingVideo(hoveredPack);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (!isMobile) {
      setPlayingVideo(null);
    }
  }, [hoveredPack, isMobile]);

  // Mobile: play video for pack in viewport after 1.5 seconds
  useEffect(() => {
    if (isMobile && visiblePackInView !== null) {
      const timer = setTimeout(() => {
        setPlayingVideo(visiblePackInView);
      }, 1500);

      return () => clearTimeout(timer);
    } else if (isMobile && visiblePackInView === null) {
      setPlayingVideo(null);
    }
  }, [isMobile, visiblePackInView]);

  // Control video playback programmatically with optimized loading
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const packId = parseInt(key);
      const videoElement = videoRefs.current[packId];
      
      if (videoElement) {
        if (playingVideo === packId) {
          // Show loading spinner
          if (isMobile) {
            setLoadingVideos(prev => ({ ...prev, [packId]: true }));
          }
          
          // Always keep muted for reliable autoplay on mobile
          videoElement.muted = true;
          setMutedVideos(prev => ({ ...prev, [packId]: true }));
          
          // Show controls initially (they'll auto-hide if unmuted)
          setShowControls(prev => ({ ...prev, [packId]: true }));
          
          // Ensure video is loaded before playing
          if (videoElement.readyState >= 2) {
            videoElement.play().catch(err => console.log('Video play error:', err));
          } else {
            const handleCanPlay = () => {
              videoElement.play().catch(err => console.log('Video play error:', err));
              videoElement.removeEventListener('canplay', handleCanPlay);
            };
            videoElement.addEventListener('canplay', handleCanPlay);
          }
          
          const handlePlaying = () => {
            setLoadingVideos(prev => ({ ...prev, [packId]: false }));
          };
          
          const handleWaiting = () => {
            if (isMobile) {
              setLoadingVideos(prev => ({ ...prev, [packId]: true }));
            }
          };
          
          videoElement.addEventListener('playing', handlePlaying);
          videoElement.addEventListener('waiting', handleWaiting);
          
          return () => {
            videoElement.removeEventListener('playing', handlePlaying);
            videoElement.removeEventListener('waiting', handleWaiting);
          };
        } else {
          if (!videoElement.paused) {
            videoElement.pause();
          }
          videoElement.currentTime = 0;
          videoElement.muted = true;
          setLoadingVideos(prev => ({ ...prev, [packId]: false }));
          setMutedVideos(prev => ({ ...prev, [packId]: true }));
          setShowControls(prev => ({ ...prev, [packId]: true }));
          // Clear timeout when video stops
          if (controlsTimeout[packId]) {
            clearTimeout(controlsTimeout[packId]);
          }
        }
      }
    });
  }, [playingVideo, isMobile]);

  const resetControlsTimeout = (packId: number) => {
    // Clear existing timeout
    if (controlsTimeout[packId]) {
      clearTimeout(controlsTimeout[packId]);
    }
    
    // Show controls
    setShowControls(prev => ({ ...prev, [packId]: true }));
    
    // Only set auto-hide if video is unmuted
    if (mutedVideos[packId] === false) {
      const timeout = setTimeout(() => {
        setShowControls(prev => ({ ...prev, [packId]: false }));
      }, 2000);
      
      setControlsTimeout(prev => ({ ...prev, [packId]: timeout }));
    }
  };

  const toggleMute = (packId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[packId];
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setMutedVideos(prev => ({ ...prev, [packId]: videoElement.muted }));
      
      // If unmuting, start the auto-hide timer
      if (!videoElement.muted) {
        resetControlsTimeout(packId);
      } else {
        // If muting, always show controls
        if (controlsTimeout[packId]) {
          clearTimeout(controlsTimeout[packId]);
        }
        setShowControls(prev => ({ ...prev, [packId]: true }));
      }
    }
  };

  const togglePlayPause = (packId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[packId];
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setVideoPaused(prev => ({ ...prev, [packId]: false }));
      } else {
        videoElement.pause();
        setVideoPaused(prev => ({ ...prev, [packId]: true }));
      }
      resetControlsTimeout(packId);
    }
  };

  const rewindVideo = (packId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[packId];
    if (videoElement) {
      videoElement.currentTime = 0;
      setVideoCurrentTimes(prev => ({ ...prev, [packId]: 0 }));
      resetControlsTimeout(packId);
    }
  };

  const handleProgressChange = (packId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[packId];
    if (videoElement && videoDurations[packId]) {
      const time = parseFloat(e.target.value);
      videoElement.currentTime = time;
      setVideoCurrentTimes(prev => ({ ...prev, [packId]: time }));
      resetControlsTimeout(packId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = (packId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[packId];
    if (videoElement) {
      if (!document.fullscreenElement) {
        videoElement.requestFullscreen().catch(err => {
          console.log('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
      resetControlsTimeout(packId);
    }
  };

  const fetchData = async () => {
    try {
      const [packsResponse, subPacksResponse, workshopsResponse] = await Promise.all([
        fetch('https://spadadibattaglia.com/mom/api/course_packs.php'),
        fetch('https://spadadibattaglia.com/mom/api/sub_packs.php'),
        fetch('https://spadadibattaglia.com/mom/api/workshops.php')
      ]);

      const packsData = await packsResponse.json();
      const subPacksData = await subPacksResponse.json();
      const workshopsData = await workshopsResponse.json();

      if (packsData.success && packsData.data) {
        setCoursePacks(packsData.data.filter((pack: CoursePack) => pack.status === 'active'));
      }

      if (subPacksData.success && subPacksData.data) {
        setSubPacks(subPacksData.data.filter((subPack: SubPack) => subPack.status === 'active'));
      }

      if (workshopsData.success && workshopsData.workshops) {
        setWorkshops(workshopsData.workshops.filter((workshop: Workshop) => workshop.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const visiblePacks = coursePacks.slice(0, visiblePacksCount);
  const hasMorePacks = visiblePacksCount < coursePacks.length;

  const visibleSubPacks = subPacks.slice(0, visibleSubPacksCount);
  const hasMoreSubPacks = visibleSubPacksCount < subPacks.length;

  // Intersection observer for mobile viewport detection
  useEffect(() => {
    if (!isMobile) return;

    const observers: IntersectionObserver[] = [];

    visiblePacks.forEach((pack) => {
      const element = packRefs.current[pack.id];
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setVisiblePackInView(pack.id);
            } else if (visiblePackInView === pack.id) {
              setVisiblePackInView(null);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [isMobile, visiblePacks, visiblePackInView]);

  const loadMorePacks = () => {
    setVisiblePacksCount(prev => Math.min(prev + loadMoreCount, coursePacks.length));
  };

  const loadMoreSubPacks = () => {
    setVisibleSubPacksCount(prev => Math.min(prev + loadMoreCount, subPacks.length));
  };

  return (
    <section id="offerings" className="py-20 section-gradient" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-yellow-300 text-xl font-semibold mb-2">تعلمي الآن</p>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            عن نفسك وعن طفلك
          </h2>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-gray-100 p-1 rounded-full inline-flex gap-1">
              <TabsTrigger 
                value="packs" 
                className="rounded-full px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white transition-all duration-300"
              >
                الباقات
              </TabsTrigger>
              <TabsTrigger 
                value="courses" 
                className="rounded-full px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white transition-all duration-300"
              >
                الدورات
              </TabsTrigger>
              <TabsTrigger 
                value="workshops" 
                className="rounded-full px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white transition-all duration-300"
              >
                الورشات
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Packs Content */}
          <TabsContent value="packs">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">جاري تحميل الباقات...</p>
              </div>
            ) : coursePacks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد باقات متاحة حالياً</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {visiblePacks.map((pack, index) => (
                    <div 
                      key={pack.id}
                      ref={(el) => packRefs.current[pack.id] = el}
                      className={`group relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' }}
                      onMouseEnter={() => !isMobile && setHoveredPack(pack.id)}
                      onMouseLeave={() => !isMobile && setHoveredPack(null)}
                    >
                      <div className={`bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full ${
                        pack.title.includes('الذهني') 
                          ? 'border-2 border-yellow-400 relative before:absolute before:inset-0 before:rounded-xl before:p-[2px] before:bg-gradient-to-r before:from-yellow-300 before:via-amber-400 before:to-yellow-300 before:-z-10 before:animate-shimmer after:absolute after:inset-0 after:rounded-xl after:shadow-[0_0_20px_rgba(251,191,36,0.5)] after:-z-10 after:animate-pulse'
                          : 'border border-border/50'
                      }`}>
                        {/* Image/Video Section */}
                        <div className="relative h-48 overflow-hidden perspective-1000">
                          <div 
                            className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
                              playingVideo === pack.id && pack.intro_video_url 
                                ? 'rotate-y-180' 
                                : ''
                            }`}
                          >
                            {/* Front - Image */}
                            <div className="absolute inset-0 backface-hidden">
                              <img 
                                src={pack.image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center"} 
                                alt={pack.title}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              {/* Hover Indicator - Desktop Only */}
                              {!isMobile && pack.intro_video_url && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="flex items-center justify-center gap-2 text-white">
                                    <PlayCircle className="w-5 h-5 animate-pulse" />
                                    <span className="text-sm font-medium">مرر لمشاهدة الفيديو</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Back - Video */}
                            {pack.intro_video_url && (
                              <div className="absolute inset-0 backface-hidden rotate-y-180">
                                <video 
                                  ref={(el) => {
                                    videoRefs.current[pack.id] = el;
                                    if (el) {
                                      el.addEventListener('loadedmetadata', () => {
                                        setVideoDurations(prev => ({ ...prev, [pack.id]: el.duration }));
                                      });
                                      el.addEventListener('timeupdate', () => {
                                        setVideoCurrentTimes(prev => ({ ...prev, [pack.id]: el.currentTime }));
                                      });
                                    }
                                  }}
                                  src={pack.intro_video_url}
                                  className="w-full h-full object-contain cursor-pointer"
                                  muted={true}
                                  loop
                                  playsInline
                                  preload="metadata"
                                  style={{ contentVisibility: 'auto' }}
                                  onClick={() => resetControlsTimeout(pack.id)}
                                />
                                
                                {/* Video Controls Overlay */}
                                {playingVideo === pack.id && (
                                  <div 
                                    onMouseMove={() => resetControlsTimeout(pack.id)}
                                    onTouchStart={() => resetControlsTimeout(pack.id)}
                                    className="absolute inset-0 z-20"
                                  >
                                    {/* Floating text - Arabic instruction - smaller with pink background */}
                                    {mutedVideos[pack.id] !== false && showControls[pack.id] !== false && (
                                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 -ml-4 z-30 animate-bounce">
                                        <div className="bg-pink-500/80 text-white px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-lg">
                                          اضغط لتشغيل الصوت
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                                            <path d="M12 5v14m0 0l7-7m-7 7l-7-7" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Bottom Controls Bar - Show/Hide based on state */}
                                    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2 z-30 transition-opacity duration-300 ${showControls[pack.id] !== false ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                       {/* Progress Bar - Pink for passed, Gray for remaining */}
                                       <div className="mb-1.5" dir="ltr">
                                        <input
                                          type="range"
                                          min="0"
                                          max={videoDurations[pack.id] || 0}
                                          value={videoCurrentTimes[pack.id] || 0}
                                          onChange={(e) => handleProgressChange(pack.id, e)}
                                          className="w-full h-0.5 rounded-lg appearance-none cursor-pointer bg-gray-300/50 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-lg [&::-moz-range-track]:bg-gray-300/50 [&::-moz-range-progress]:h-0.5 [&::-moz-range-progress]:rounded-lg [&::-moz-range-progress]:bg-pink-500 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-pink-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                                          style={{
                                            background: `linear-gradient(to right, rgb(236 72 153) 0%, rgb(236 72 153) ${((videoCurrentTimes[pack.id] || 0) / (videoDurations[pack.id] || 1)) * 100}%, rgba(209, 213, 219, 0.5) ${((videoCurrentTimes[pack.id] || 0) / (videoDurations[pack.id] || 1)) * 100}%, rgba(209, 213, 219, 0.5) 100%)`
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      
                                       {/* Control Buttons - Reversed Order */}
                                       <div className="flex items-center justify-between gap-1.5">
                                         {/* Mute/Unmute Button - Now on Left */}
                                         <div className="relative flex items-center gap-1.5">
                                            {/* Text Indicator - only show when muted */}
                                            {mutedVideos[pack.id] !== false && (
                                              <span 
                                                onClick={(e) => toggleMute(pack.id, e)}
                                                className="text-pink-500 text-[10px] font-medium bg-pink-500/20 px-1.5 py-0.5 rounded animate-pulse whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-pink-500/30 transition-colors"
                                              >
                                                اضغط للصوت <span className="text-sm">◄</span>
                                              </span>
                                            )}
                                           
                                           <div className="relative">
                                             {/* Animated pulse rings - only show when muted */}
                                             {mutedVideos[pack.id] !== false && (
                                               <>
                                                 <div className="absolute inset-0 rounded-full bg-pink-500/50 animate-ping scale-125" />
                                                 <div className="absolute inset-0 rounded-full bg-yellow-400/40 animate-pulse scale-110" style={{ animationDelay: '0.3s' }} />
                                                 <div className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping scale-150" style={{ animationDelay: '0.6s' }} />
                                               </>
                                             )}
                                             
                                             <button
                                               onClick={(e) => toggleMute(pack.id, e)}
                                               className="relative bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200"
                                             >
                                            {mutedVideos[pack.id] !== false ? (
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                                                <line x1="23" y1="9" x2="17" y2="15"/>
                                                <line x1="17" y1="9" x2="23" y2="15"/>
                                              </svg>
                                            ) : (
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                                              </svg>
                                             )}
                                           </button>
                                           </div>
                                         </div>
                                        
                                        {/* Play/Pause, Rewind, and Time - Now on Right */}
                                        <div className="flex items-center gap-1.5">
                                          {/* Time Display - LTR */}
                                          <span className="text-white text-[10px] font-medium" dir="ltr">
                                            {formatTime(videoCurrentTimes[pack.id] || 0)} / {formatTime(videoDurations[pack.id] || 0)}
                                          </span>
                                          
                                          {/* Fullscreen Button */}
                                          <button
                                            onClick={(e) => toggleFullscreen(pack.id, e)}
                                            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200"
                                            title="ملء الشاشة"
                                          >
                                            <Maximize className="w-3.5 h-3.5" />
                                          </button>
                                          
                                          {/* Rewind Button */}
                                          <button
                                            onClick={(e) => rewindVideo(pack.id, e)}
                                            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                          </button>
                                          
                                          {/* Play/Pause Button */}
                                          <button
                                            onClick={(e) => togglePlayPause(pack.id, e)}
                                            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200"
                                          >
                                            {videoPaused[pack.id] ? (
                                              <Play className="w-3.5 h-3.5" />
                                            ) : (
                                              <Pause className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                        </div>
                                       </div>
                                     </div>
                                  </div>
                                 )}
                              </div>
                            )}
                          </div>
                          
                          {/* Loading Spinner - Mobile Only */}
                          {isMobile && loadingVideos[pack.id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                              <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Title */}
                          <h3 className="text-xl font-bold text-foreground mb-3 flex items-center justify-between gap-2">
                            <span>{pack.title}</span>
                            <span className="text-primary" dir="ltr">Pack</span>
                          </h3>
                          
                          {/* Video Badge - Desktop Only */}
                          {!isMobile && pack.intro_video_url && (
                            <div 
                              className="mb-3 flex items-center gap-2 text-primary text-sm bg-primary/10 rounded-lg px-3 py-2 border border-primary/20 cursor-pointer hover:bg-primary/20 hover:scale-105 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingVideo(pack.id);
                              }}
                              onMouseEnter={() => setPlayingVideo(pack.id)}
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span className="font-medium">شاهد الفيديو</span>
                            </div>
                          )}
                          
                          {/* Description - if available */}
                          {pack.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {pack.description}
                            </p>
                          )}

                          {/* Modules/Content */}
                          <div className="space-y-2 mb-4 flex-1">
                            {pack.modules && pack.modules.split(',').slice(0, 3).map((module, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{module.trim()}</span>
                              </div>
                            ))}
                            {pack.modules && pack.modules.split(',').length > 3 && (
                              <div className="text-sm text-primary font-medium">
                                <span dir="ltr">+{pack.modules.split(',').length - 3}</span> مواضيع أخرى
                              </div>
                            )}
                          </div>

                          {/* Button */}
                          <Button 
                            size="sm" 
                            className={`w-full hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                              pack.title.includes('الذهني')
                                ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-white font-bold hover:shadow-[0_0_30px_rgba(251,191,36,0.7)] border-2 border-yellow-300 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:animate-shimmer before:skew-x-12'
                                : 'btn-hero hover:shadow-[0_0_30px_rgba(233,30,99,0.5)] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-shimmer before:skew-x-12'
                            }`}
                            onClick={() => navigate(`/pack/${pack.id}`)}
                          >
                            للمزيد من التفاصيل
                            <ArrowLeft className="w-4 h-4 mr-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {hasMorePacks && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMorePacks} size="lg" className="btn-hero">
                      عرض المزيد من الباقات
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Courses Content - Showing SubPacks */}
          <TabsContent value="courses">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">جاري تحميل الدورات...</p>
              </div>
            ) : subPacks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد دورات متاحة حالياً</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {visibleSubPacks.map((subPack, index) => (
                    <div 
                      key={subPack.id} 
                      className={`group relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' }}
                    >
                      <div className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-border/50">
                        {/* Image Section - Less height */}
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={subPack.banner_image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center"} 
                            alt={subPack.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Title */}
                          <h3 className="text-xl font-bold text-foreground mb-3">{subPack.title}</h3>
                          
                          {/* Description */}
                          <p className="text-sm text-muted-foreground mb-4 flex-1">
                            {subPack.description}
                          </p>

                          {/* Button */}
                          <Button 
                            size="sm" 
                            className="btn-hero w-full hover:shadow-[0_0_30px_rgba(233,30,99,0.5)] hover:scale-105 transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-shimmer before:skew-x-12" 
                            onClick={() => navigate(`/course/${subPack.id}`)}
                          >
                            للمزيد من التفاصيل
                            <ArrowLeft className="w-4 h-4 mr-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {hasMoreSubPacks && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMoreSubPacks} size="lg" className="btn-hero">
                      عرض المزيد من الدورات
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Workshops Content */}
          <TabsContent value="workshops">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">جاري تحميل الورشات...</p>
              </div>
            ) : workshops.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد ورشات متاحة حالياً</p>
              </div>
            ) : (
              <>
                <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                  {workshops.map((workshop, index) => (
                  <div 
                      key={workshop.id} 
                      className={`card-elegant overflow-hidden flex flex-col h-full transition-all duration-1000 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: isVisible ? `${300 + index * 150}ms` : '0ms' }}
                    >
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={workshop.image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center"} 
                          alt={workshop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 
                          className={`text-xl font-bold text-foreground mb-3 ${getTextAlignmentClasses(workshop.title)} ${getContainerDirection(workshop.title)}`} 
                          dir={getTextDirection(workshop.title)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {workshop.title}
                        </h3>

                        <p 
                          className={`text-muted-foreground mb-4 leading-relaxed flex-grow ${getTextAlignmentClasses(workshop.description)} ${getContainerDirection(workshop.description)}`} 
                          dir={getTextDirection(workshop.description)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {workshop.description}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{workshop.duration}</span>
                          </div>
                        </div>

                        {workshop.highlights && workshop.highlights.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">نقاط القوة:</h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {workshop.highlights.map((highlight, idx) => (
                                <li key={idx}>{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Button 
                          className="btn-hero w-full mt-auto" 
                          onClick={() => {
                            const message = encodeURIComponent(`أريد التسجيل في ${workshop.title}`);
                            window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                          }}
                        >
                          احجزي مقعدك الآن
                          <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                  <div className="card-elegant p-8 max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary-light/10">
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      لديك فكرة لورشة جديدة؟
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      نحن نستمع لاحتياجاتكم ونطور ورش جديدة باستمرار. شاركينا أفكارك واقتراحاتك
                    </p>
                    <Button 
                      variant="outline" 
                      className="btn-outline" 
                      onClick={() => {
                        const message = encodeURIComponent("لدي اقتراح لورشة جديدة أود مناقشتها معكم");
                        window.open(`https://wa.me/21652451892?text=${message}`, '_blank');
                      }}
                    >
                      <MessageSquare className="w-4 h-4 ml-2" />
                      اقترحي ورشة جديدة
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default TabbedOfferings;