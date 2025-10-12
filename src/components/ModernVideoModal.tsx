import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X, RotateCcw, Loader2, Minimize } from "lucide-react";

interface ModernVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  poster?: string;
  videoId?: string;
}

const ModernVideoModal = ({ isOpen, onClose, videoUrl, title, poster, videoId }: ModernVideoModalProps) => {
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
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        console.log('[Video] Metadata loaded, duration:', video.duration);
        setDuration(video.duration);
      }
      setIsLoading(false);
    };

    const handleDurationChange = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        console.log('[Video] Duration changed:', video.duration);
        setDuration(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isNaN(video.currentTime)) {
        setCurrentTime(video.currentTime);
      }
      // Also update duration if it wasn't set yet
      if ((!duration || duration === 0) && video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      // Mark video as watched when played
      if (videoId) {
        const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        if (!watchedVideos.includes(videoId)) {
          watchedVideos.push(videoId);
          localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
        }
      }
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('[Video] Can play - enough data loaded');
      // Ensure duration is set
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('[Video] Loading started:', videoUrl);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
      console.log('[Video] First frame loaded');
      // Set duration here as well as a fallback
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
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
    video.addEventListener('durationchange', handleDurationChange);
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

    // Force load metadata if video is ready
    if (video.readyState >= 1 && video.duration) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleDurationChange);
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
  }, [videoUrl, isOpen, videoId]);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0); // Reset duration when opening
      setShowControls(true);
      setIsLoading(true);
      setLoadProgress(0);
      
      // Instant auto-play when modal opens
      const video = videoRef.current;
      if (video) {
        // Load and play immediately
        video.load();
        video.play().catch(console.error);
      }
    }
  }, [isOpen, videoUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(console.error);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetControlsTimeout();
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
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;
    
    const time = parseFloat(e.target.value);
    if (!isNaN(time) && time >= 0 && time <= duration) {
      video.currentTime = time;
      setCurrentTime(time);
      console.log('[Seek] Setting time to:', time);
    }
    resetControlsTimeout();
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    setCurrentTime(0);
    // Start playing from beginning
    if (!isPlaying) {
      video.play().catch(console.error);
    }
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-modal-container');
    if (!document.fullscreenElement && container) {
      container.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    resetControlsTimeout();
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetControlsTimeout = () => {
    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Show controls
    setShowControls(true);
    
    // Set auto-hide timeout
    const timeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
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
             muted={false}
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
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
              {/* Progress Bar */}
            <div className="mb-3" dir="ltr">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime || 0}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={!duration || duration === 0}
                className="w-full h-1 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-lg [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-lg [&::-moz-range-track]:bg-transparent [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-lg [&::-moz-range-progress]:bg-pink-500"
                style={{
                  background: `linear-gradient(to right, rgb(236 72 153) 0%, rgb(236 72 153) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
              <style dangerouslySetInnerHTML={{__html: `
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: #ec4899;
                  cursor: grab;
                  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.6);
                  transition: transform 0.15s ease;
                  margin-top: -6.5px;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                  transform: scale(1.2);
                  box-shadow: 0 2px 12px rgba(236, 72, 153, 0.8);
                }
                input[type="range"]::-webkit-slider-thumb:active {
                  cursor: grabbing;
                  transform: scale(1.1);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: #ec4899;
                  cursor: grab;
                  border: none;
                  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.6);
                  transition: transform 0.15s ease;
                }
                input[type="range"]::-moz-range-thumb:hover {
                  transform: scale(1.2);
                  box-shadow: 0 2px 12px rgba(236, 72, 153, 0.8);
                }
                input[type="range"]::-moz-range-thumb:active {
                  cursor: grabbing;
                  transform: scale(1.1);
                }
              `}} />
              
              {/* Duration Display */}
              <div className="flex justify-between items-center mt-1.5 text-white text-xs font-medium">
                <span>{formatTime(currentTime || 0)}</span>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              {/* Left Side - Mute + Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
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
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hidden md:block"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              {/* Right Side - Play/Pause, Rewind, Time, Fullscreen */}
              <div className="flex items-center gap-2">
                {/* Time Display */}
                <span className="text-white text-xs font-medium hidden sm:block" dir="ltr">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                {/* Fullscreen Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                  title="ملء الشاشة"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                
                {/* Rewind Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    restart();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                  title="إعادة التشغيل"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                {/* Play/Pause Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePlay(e);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernVideoModal;