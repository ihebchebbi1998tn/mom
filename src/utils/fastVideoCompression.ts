// Ultra-aggressive video compression for maximum size reduction
export const smartCompressVideo = (
  file: File,
  onProgress?: (progress: number, info?: { originalSize: number; estimatedSize?: number; stage: string }) => void
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const fileSizeMB = file.size / (1024 * 1024);
    
    // Light compression only (15% reduction for 256MB limit)
    if (fileSizeMB <= 50) {
      onProgress?.(100, { 
        originalSize: file.size, 
        estimatedSize: file.size, 
        stage: "لا يحتاج ضغط - الحجم مناسب" 
      });
      resolve(file);
      return;
    }

      onProgress?.(0, { 
        originalSize: file.size, 
        stage: "بدء عملية الضغط الخفيف (15% فقط)..." 
      });

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    video.onloadedmetadata = () => {
      const { videoWidth, videoHeight, duration } = video;
      
      // Validate duration to prevent NaN
      if (!duration || duration <= 0 || isNaN(duration)) {
        reject(new Error('Invalid video duration'));
        return;
      }
      
      // Ultra-aggressive compression settings for maximum size reduction
      let targetWidth = videoWidth;
      let targetHeight = videoHeight;
      let framerate = 24; // Lower default framerate
      let targetBitrate = 800000; // Much more aggressive default: 800kbps
      
      onProgress?.(10, { 
        originalSize: file.size, 
        stage: "تحليل الفيديو - ضغط خفيف 15% فقط..." 
      });

      // Light compression (15% reduction as requested)
      const scale = Math.min(1920 / videoWidth, 1080 / videoHeight, 1);
      targetWidth = Math.floor(videoWidth * scale);
      targetHeight = Math.floor(videoHeight * scale);
      framerate = 30; // Keep good framerate
      
      // Calculate bitrate for only 15% reduction
      const originalBitrate = (fileSizeMB * 8 * 1024 * 1024) / duration; // bits per second
      targetBitrate = Math.max(1500000, originalBitrate * 0.85); // 85% of original (15% reduction)
      
      // Ensure dimensions are even numbers for better encoding
      targetWidth = Math.floor(targetWidth / 2) * 2;
      targetHeight = Math.floor(targetHeight / 2) * 2;
      
      // Calculate target size (only 15% compression)
      const estimatedSize = Math.floor(file.size * 0.85); // Target 85% of original size
      
      onProgress?.(20, { 
        originalSize: file.size, 
        estimatedSize,
        stage: "ضغط خفيف - هدف: 85% من الحجم الأصلي (توفير 15%)" 
      });
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const chunks: Blob[] = [];
      const stream = canvas.captureStream(framerate);
      
      // Use VP9 for best compression, fallback to VP8, then H264
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4;codecs=h264';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: targetBitrate,
        // Add additional optimization options
        ...(mimeType.includes('vp9') && {
          videoKeyFrameIntervalDuration: 5000, // Keyframe every 5 seconds
        })
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: mimeType });
        const actualSize = compressedBlob.size;
        
        onProgress?.(95, { 
          originalSize: file.size, 
          estimatedSize: actualSize,
          stage: "إنهاء الضغط الخفيف..." 
        });
        
        const compressedFile = new File([compressedBlob], file.name, {
          type: mimeType,
          lastModified: Date.now()
        });
        
        const compressionRatio = Math.round((actualSize / file.size) * 100);
        onProgress?.(100, { 
          originalSize: file.size, 
          estimatedSize: actualSize,
          stage: `ضغط خفيف مكتمل! توفير: ${100 - compressionRatio}%` 
        });
        
        resolve(compressedFile);
      };
      
      mediaRecorder.onerror = (event) => {
        reject(new Error('خطأ في تسجيل الفيديو: ' + event.error?.message));
      };
      
      mediaRecorder.start(50); // Collect data every 50ms for smoother progress
      
      let currentTime = 0;
      const frameInterval = 1000 / framerate;
      let processedFrames = 0;
      const totalFrames = Math.ceil(duration * framerate);
      
      const processFrame = () => {
        if (currentTime >= duration) {
          mediaRecorder.stop();
          return;
        }
        
        video.currentTime = Math.min(currentTime, duration - 0.1);
        
        video.onseeked = () => {
          // Optimize canvas rendering for speed
          ctx.imageSmoothingEnabled = false; // Disable for speed
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          
          processedFrames++;
          const progress = Math.min((processedFrames / totalFrames) * 75 + 20, 94); // 20-94% for processing
          onProgress?.(progress, { 
            originalSize: file.size, 
            estimatedSize,
            stage: `معالجة الفيديو... ${Math.round((processedFrames / totalFrames) * 100)}%` 
          });
          
          currentTime += frameInterval / 1000;
          
          // Use requestAnimationFrame for better performance instead of setTimeout
          if (currentTime < duration) {
            requestAnimationFrame(processFrame);
          } else {
            mediaRecorder.stop();
          }
        };
        
        video.onerror = () => {
          reject(new Error('خطأ في معالجة الإطار'));
        };
      };
      
      // Start processing with a small delay
      setTimeout(() => {
        processFrame();
      }, 100);
    };
    
    video.onerror = () => {
      reject(new Error('فشل في تحميل الفيديو'));
    };
    
    video.preload = 'metadata'; // Only load metadata for faster loading
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

// Backward compatibility
export const fastCompressVideo = smartCompressVideo;

// Image compression function
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    img.onload = () => {
      const { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;
      
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        newWidth = Math.floor(width * ratio);
        newHeight = Math.floor(height * ratio);
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // High quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Get video duration
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};