// Video compression utilities
export const compressVideo = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // Set canvas dimensions (compress by reducing resolution)
      const maxWidth = 1280;
      const maxHeight = 720;
      
      let { videoWidth: width, videoHeight: height } = video;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(canvas.captureStream(), {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1000000 // 1 Mbps for compression
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      };
      
      let currentTime = 0;
      const duration = video.duration;
      
      const processFrame = () => {
        if (currentTime >= duration) {
          mediaRecorder.stop();
          return;
        }
        
        video.currentTime = currentTime;
        ctx.drawImage(video, 0, 0, width, height);
        
        const progress = (currentTime / duration) * 100;
        onProgress?.(progress);
        
        currentTime += 0.1; // Process every 0.1 seconds
        requestAnimationFrame(processFrame);
      };
      
      video.onseeked = () => {
        if (currentTime === 0) {
          mediaRecorder.start();
          processFrame();
        }
      };
      
      video.currentTime = 0;
    };
    
    video.onerror = () => {
      reject(new Error('Video loading failed'));
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => reject(new Error('Cannot load video'));
    video.src = URL.createObjectURL(file);
  });
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};