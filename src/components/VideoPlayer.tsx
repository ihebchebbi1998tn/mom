import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  videoId?: number;
  onUrlUpdate?: (newUrl: string) => void;
}

const VideoPlayer = ({ src, title, className = "", videoId, onUrlUpdate }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasUpdatedUrl, setHasUpdatedUrl] = useState(false);

  // Optimize video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set loading optimization attributes
    video.preload = "metadata"; // Only load metadata initially for faster start
    video.playsInline = true; // Better mobile performance
    
    const handleLoadStart = () => {
      setIsLoading(true);
      setLoadProgress(0);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setLoadProgress(Math.min(progress, 100));
        }
      }
    };

    const handleCanPlay = () => {
      setCanPlay(true);
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
      setIsBuffering(true);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setLoadProgress(100);
      // Auto-play when video is fully loaded
      if (video && !isPlaying) {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          console.log("Auto-play blocked by browser");
        });
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Show loading when user clicks play
        setIsLoading(true);
        videoRef.current.play().then(() => {
          // Video started playing successfully
          setIsLoading(false);
        }).catch((error) => {
          console.error("Video play failed:", error);
          setIsLoading(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Function to update video URL to cached version
  const updateVideoUrlToCached = async () => {
    if (!videoId || hasUpdatedUrl || !src.includes('proxy.php')) return;
    
    try {
      // Extract filename from proxy URL
      const urlParams = new URLSearchParams(src.split('?')[1]);
      const filename = urlParams.get('file');
      
      if (!filename) return;
      
      const response = await fetch('https://spadadibattaglia.com/mom/api/update_video_url.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          filename: filename
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setHasUpdatedUrl(true);
        console.log('Video URL updated to cached version:', result.new_url);
        if (onUrlUpdate) {
          onUrlUpdate(result.new_url);
        }
      }
    } catch (error) {
      console.error('Failed to update video URL:', error);
    }
  };

  // If cached file already exists, switch immediately (works on second/third views)
  useEffect(() => {
    const checkAndUpdateIfCached = async () => {
      if (!videoId || hasUpdatedUrl || !src.includes('proxy.php')) return;

      const params = new URLSearchParams(src.split('?')[1] || '');
      const filename = params.get('file');
      if (!filename) return;

      const cachedCheckUrl = `https://spadadibattaglia.com/mom/api/check_cached.php?file=${encodeURIComponent(filename)}`;
      try {
        const resp = await fetch(cachedCheckUrl);
        const data = await resp.json();
        if (data.success && data.exists) {
          await updateVideoUrlToCached();
        }
      } catch (e) {
        // Ignore errors
      }
    };

    checkAndUpdateIfCached();
  }, [src, videoId, hasUpdatedUrl]);

  // Update URL after video plays for 30 seconds or finishes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasUpdatedUrl) return;

    const handleTimeUpdate = () => {
      // Update URL after 30 seconds of playback or when video ends
      if ((currentTime > 30 || currentTime >= duration - 5) && !hasUpdatedUrl) {
        updateVideoUrlToCached();
      }
    };

    const handleEnded = () => {
      updateVideoUrlToCached();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentTime, duration, hasUpdatedUrl, videoId, src]);

  return (
    <div className={`relative group bg-black rounded-lg overflow-hidden max-w-2xl max-h-96 mx-auto ${className}`}>
      {title && (
        <div className="absolute top-4 left-4 z-20 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {title}
        </div>
      )}
      
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain max-h-96"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='20'%3E🎥%3C/text%3E%3C/svg%3E"
      />
      
      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={restart}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Cool Arabic Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="text-center text-white space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="text-lg font-bold">
                {isBuffering ? "🔄 جاري التخزين المؤقت..." :
                 loadProgress < 20 ? "🔄 جاري تحضير الفيديو..." :
                 loadProgress < 50 ? "📡 جاري تحميل البيانات..." :
                 loadProgress < 80 ? "⚡ تحميل سريع جاري..." :
                 "🎬 تجهيز الفيديو للعرض..."}
              </div>
            </div>
            
            <div className="w-64 space-y-2">
              <Progress value={loadProgress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-300">
                <span>تحميل: {Math.round(loadProgress)}%</span>
                <span>
                  {loadProgress < 25 ? "بدء التحميل" :
                   loadProgress < 50 ? "جاري المعالجة" :
                   loadProgress < 75 ? "تحميل متقدم" :
                   loadProgress < 95 ? "اكتمال قريب" :
                   "جاهز للتشغيل"}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 animate-pulse">
              💡 نستخدم تقنيات متطورة لضمان أسرع تحميل ممكن
            </div>
          </div>
        </div>
      )}
      
      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && canPlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full w-16 h-16 p-0"
          >
            <Play className="w-8 h-8 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;