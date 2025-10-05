import React, { useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface VideoThumbnailProps {
  videoUrl: string;
  thumbnailUrl?: string;
  alt: string;
  className?: string;
}

const VideoThumbnail = ({ videoUrl, thumbnailUrl, alt, className }: VideoThumbnailProps) => {
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
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
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Skip if already have cached thumbnail or not in view
    if (!videoUrl || !isInView || generatedThumbnail) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const generateThumbnail = () => {
      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setGeneratedThumbnail(dataUrl);
          
          // Cache the thumbnail
          try {
            const cacheKey = getCacheKey(videoUrl);
            localStorage.setItem(cacheKey, dataUrl);
          } catch (cacheError) {
            console.warn('Could not cache thumbnail:', cacheError);
          }
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    };

    const handleLoadedData = () => {
      // Seek to first frame (0.1 seconds to ensure we get a valid frame)
      video.currentTime = 0.1;
    };

    const handleSeeked = () => {
      generateThumbnail();
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
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
          className={className}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className={`${className} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse`}>
          <PlayCircle className="w-16 h-16 text-white opacity-50" />
        </div>
      )}

      {/* Hidden video and canvas for thumbnail generation from first frame */}
      {videoUrl && isInView && !generatedThumbnail && (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            crossOrigin="anonymous"
            preload="metadata"
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default VideoThumbnail;
