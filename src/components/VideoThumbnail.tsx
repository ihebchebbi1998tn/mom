import React, { useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface VideoThumbnailProps {
  videoUrl: string;
  thumbnailUrl?: string;
  alt: string;
  className?: string;
  priority?: boolean; // For above-the-fold thumbnails
}

const VideoThumbnail = ({ videoUrl, thumbnailUrl, alt, className, priority = false }: VideoThumbnailProps) => {
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(priority); // Priority images start visible
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cache key for localStorage
  const getCacheKey = (url: string) => `video-thumb-${btoa(url).substring(0, 50)}`;

  // Check cache on mount
  useEffect(() => {
    if (!videoUrl) return;
    
    try {
      const cacheKey = getCacheKey(videoUrl);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setGeneratedThumbnail(cached);
      }
    } catch (error) {
      console.error('Error reading thumbnail cache:', error);
    }
  }, [videoUrl]);

  // Lazy load: only generate thumbnail when in viewport
  useEffect(() => {
    if (!containerRef.current || priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { 
        rootMargin: priority ? '0px' : '400px', // Much larger margin for earlier preloading
        threshold: 0.01
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    // Skip if already have cached thumbnail or not in view
    if (!videoUrl || !isInView || generatedThumbnail) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const generateThumbnail = () => {
      try {
        // Optimize canvas size for faster processing (max 480px width for speed)
        const maxWidth = 480;
        const scale = Math.min(1, maxWidth / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false }); // Faster without alpha
        if (ctx) {
          ctx.imageSmoothingEnabled = false; // Faster rendering
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Lower quality for faster generation
          setGeneratedThumbnail(dataUrl);
          setIsLoading(false);
          
          // Cache the thumbnail
          try {
            const cacheKey = getCacheKey(videoUrl);
            localStorage.setItem(cacheKey, dataUrl);
          } catch (cacheError) {
            console.warn('Could not cache thumbnail:', cacheError);
            // Clear old cache if storage is full
            if (cacheError instanceof Error && cacheError.name === 'QuotaExceededError') {
              try {
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('video-thumb-')) {
                    localStorage.removeItem(key);
                  }
                });
              } catch {}
            }
          }
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    const handleLoadedData = () => {
      // Seek to first frame immediately
      video.currentTime = 0;
    };

    const handleSeeked = () => {
      generateThumbnail();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl, thumbnailUrl, isInView, generatedThumbnail]);

  // Always use generated thumbnail from video first frame
  const displayThumbnail = generatedThumbnail;

  return (
    <div ref={containerRef} className="w-full h-full pointer-events-none">
      {displayThumbnail ? (
        <img 
          src={displayThumbnail} 
          alt={alt} 
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          draggable={false}
          onLoad={() => setIsLoading(false)}
          decoding="async"
        />
      ) : hasError ? (
        <div className={`${className} bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center`}>
          <PlayCircle className="w-16 h-16 text-white opacity-50" />
        </div>
      ) : (
        <div className={`${className} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-3">
            <PlayCircle className="w-16 h-16 text-white opacity-50 animate-pulse" />
            <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/70 animate-[loading_1.5s_ease-in-out_infinite]" style={{
                animation: 'loading 1.5s ease-in-out infinite',
              }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden video and canvas for thumbnail generation from first frame */}
      {videoUrl && isInView && !generatedThumbnail && !hasError && (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            crossOrigin="anonymous"
            preload="metadata"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default VideoThumbnail;
