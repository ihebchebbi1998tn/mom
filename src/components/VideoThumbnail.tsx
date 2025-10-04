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
    // Only generate from video if no thumbnail URL and component is in view
    if (thumbnailUrl || !videoUrl || !isInView) return;

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
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    };

    const handleLoadedData = () => {
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
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
  }, [videoUrl, thumbnailUrl, isInView]);

  // Prioritize thumbnailUrl, then generated, then placeholder
  const displayThumbnail = thumbnailUrl || generatedThumbnail;

  return (
    <div ref={containerRef} className="w-full h-full">
      {displayThumbnail ? (
        <img 
          src={displayThumbnail} 
          alt={alt} 
          className={className}
          loading="lazy"
        />
      ) : (
        <div className={`${className} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse`}>
          <PlayCircle className="w-16 h-16 text-white opacity-50" />
        </div>
      )}

      {/* Hidden video and canvas for thumbnail generation - only if no thumbnail URL */}
      {!thumbnailUrl && videoUrl && isInView && (
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
