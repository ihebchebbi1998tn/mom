import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface EnhancedAudioPlayerProps {
  src: string;
  title?: string;
}

const EnhancedAudioPlayer = ({ src, title }: EnhancedAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button with Cool Effects */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 overflow-hidden group ${
            isPlaying 
              ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
              : 'border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105'
          }`}
        >
          {/* Animated Background */}
          <div className={`absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity duration-300 ${
            isPlaying ? 'opacity-100' : 'group-hover:opacity-20'
          }`} />
          
          {/* Pulse Effect when Playing */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
          )}
          
          {/* Icon */}
          <div className="relative z-10">
            {isPlaying ? 
              <Pause className="h-5 w-5" /> : 
              <Play className="h-5 w-5 ml-0.5" />
            }
          </div>
        </Button>

        {/* Progress and Info */}
        <div className="flex-1 min-w-0">
          {/* Progress Bar */}
          <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary animate-pulse opacity-50 blur-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default EnhancedAudioPlayer;