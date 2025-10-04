import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X, RotateCcw, Loader2 } from "lucide-react";

interface ModernVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  poster?: string;
}

const ModernVideoModal = ({ isOpen, onClose, videoUrl, title, poster }: ModernVideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  let hideControlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('[Video] Can play - enough data loaded');
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('[Video] Loading started:', videoUrl);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
      console.log('[Video] First frame loaded');
    };
    
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setLoadProgress((bufferedEnd / duration) * 100);
        }
      }
    };
    
    const handleError = (e: Event) => {
      console.error('[Video] Error loading:', e);
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
      setIsLoading(true);
      setLoadProgress(0);
      
      // Auto-play video when modal opens
      setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          video.play().catch(console.error);
        }
      }, 500);
    }
  }, [isOpen, videoUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const time = parseFloat(e.target.value);
    if (!isNaN(time)) {
      video.currentTime = time;
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    video.pause();
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-modal-container');
    if (!document.fullscreenElement && container) {
      container.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] h-auto p-0 bg-black border-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          مشغل فيديو لعرض {title}
        </DialogDescription>
        
         <div 
           className="video-modal-container relative w-full min-h-[300px] max-h-[calc(85vh-2rem)] flex items-center justify-center bg-black"
           onMouseMove={handleMouseMove}
           onMouseLeave={() => isPlaying && setShowControls(false)}
         >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className={`absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Video Title and URL */}
          <div className={`absolute top-4 left-4 z-40 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <h3 className="font-semibold text-sm md:text-base" dir="rtl">{title}</h3>
          </div>

          {/* Loading Indicator - Only show initially */}
          {isLoading && duration === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/50">
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
              <p className="text-white text-sm mb-2">جاري تحميل الفيديو...</p>
              {loadProgress > 0 && (
                <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-pink-500 h-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Buffering Indicator - Show during playback if buffering */}
          {isLoading && duration > 0 && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-black/70 rounded-full p-4">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            </div>
          )}

          {/* Video Element */}
           <video
             ref={videoRef}
             poster={poster}
             className="w-full h-auto max-h-[calc(85vh-8rem)] object-contain"
             preload="auto"
             playsInline
             disablePictureInPicture
             controlsList="nodownload nofullscreen"
             onContextMenu={(e) => e.preventDefault()}
             onClick={togglePlay}
             crossOrigin="anonymous"
             autoPlay
           >
             <source src={videoUrl} type={videoUrl.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
             <source src={videoUrl} type="video/mp4" />
             <source src={videoUrl} type="video/quicktime" />
             <source src={videoUrl} type="video/webm" />
             متصفحك لا يدعم تشغيل الفيديو
           </video>

          {/* Play Button Overlay - Only show when NOT playing */}
          {!isPlaying && duration > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="bg-pink-600/90 hover:bg-pink-700/90 text-white rounded-full w-20 h-20 p-0 backdrop-blur-sm transition-all duration-200"
              >
                <Play className="w-10 h-10 ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-white text-sm mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 z-50"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    restart();
                  }}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 z-50"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 z-50"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleVolumeChange(e);
                    }}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hidden md:block z-50"
                    style={{
                      background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernVideoModal;