import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import oldLogo from "@/assets/maman-attentionnee-logo.png";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete(), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  // Generate random hearts
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    size: Math.random() * 0.5 + 0.5,
    duration: Math.random() * 2 + 3,
  }));

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Hearts Background */}
      <div className="absolute inset-0">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.animationDelay}s`,
              animationDuration: `${heart.duration}s`,
              transform: `scale(${heart.size})`,
            }}
          >
            <div
              className="animate-heart-fall text-pink-300/40"
              style={{
                animationDelay: `${heart.animationDelay}s`,
                animationDuration: `${heart.duration}s`,
              }}
            >
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Pulsing Circle Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full animate-ping opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full animate-pulse"></div>
          
          {/* Logo Circle */}
          <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-pink-200/50">
            <img 
              src="/lovable-uploads/134a7f12-f652-4af0-b56a-5fef2c8109bb.png" 
              alt="أكاديمية الأم" 
              className="w-20 h-20 object-contain animate-pulse"
            />
          </div>
          
          {/* Rotating Border */}
          <div className="absolute -inset-2 rounded-full animate-spin opacity-60"
               style={{ 
                 background: 'conic-gradient(from 0deg, transparent, #f472b6, transparent)',
                 padding: '2px'
               }}>
            <div className="w-full h-full bg-transparent rounded-full"></div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4 animate-pulse">
          أكاديمية الأم
        </h1>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-pink-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading Text */}
        <p className="text-pink-600 text-sm animate-pulse">
          {progress < 30 ? 'جاري التحميل...' : 
           progress < 70 ? 'تحضير المحتوى...' : 
           progress < 100 ? 'تقريباً انتهينا...' : 'مرحباً بك!'}
        </p>

        {/* Loading Hearts Animation */}
        <div className="flex gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className="w-4 h-4 text-pink-400 fill-current animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;