// Client-side UploadThing configuration with speed optimizations
const UPLOADTHING_TOKEN = 'eyJhcGlLZXkiOiJza19saXZlXzdjYzZhYjRjNjZjODU1MGVlMThkZThkN2MzYTBiNzYyZWViYTNmMjMyMTE1Y2Q3YWY1YzkxNTBhYmFlMzU2MWIiLCJhcHBJZCI6IjEzdnlob2J3NnEiLCJyZWdpb25zIjpbInNlYTEiXX0=';

// Speed optimization constants
const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks for better performance
const MAX_RETRIES = 3;
const TIMEOUT_MS = 1800000; // 30 minutes timeout for large files
const CONNECTION_TIMEOUT_MS = 300000; // 5 minutes for initial connection

interface UploadStats {
  startTime: number;
  totalSize: number;
  uploadedSize: number;
  speed: number;
  eta: number;
}

export const uploadToUploadThing = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  console.group('🚀 UploadThing Upload Started');
  console.log('📁 File Details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  const stats: UploadStats = {
    startTime: Date.now(),
    totalSize: file.size,
    uploadedSize: 0,
    speed: 0,
    eta: 0
  };

  // For large files, use chunked upload strategy
  if (file.size > 50 * 1024 * 1024) { // 50MB+
    console.log('📦 Large file detected, using optimized chunked upload');
    return uploadLargeFile(file, onProgress, stats);
  }

  return uploadSmallFile(file, onProgress, stats);
};

// Optimized upload for small to medium files
const uploadSmallFile = async (
  file: File,
  onProgress?: (progress: number) => void,
  stats?: UploadStats
): Promise<string> => {
  console.log('⚡ Using direct upload for file size:', formatBytes(file.size));
  
  const formData = new FormData();
  formData.append('files', file);
  
  // Add route configuration
  formData.append('fileRouteConfig', JSON.stringify({
    routeId: 'videoUploader'
  }));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let retryCount = 0;

    const attemptUpload = () => {
      console.log(`📤 Upload attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
      
      // Progressive timeout based on file size and progress
      const baseTimeout = file.size > 100 * 1024 * 1024 ? TIMEOUT_MS : CONNECTION_TIMEOUT_MS;
      xhr.timeout = baseTimeout;
      
      // Dynamic timeout adjustment based on progress
      let lastProgressTime = Date.now();
      let progressStalled = false;
      
      xhr.ontimeout = () => {
        const uploadedPercent = stats ? (stats.uploadedSize / stats.totalSize) * 100 : 0;
        console.error('⏰ Upload timeout after', xhr.timeout / 1000, 'seconds');
        console.error('📊 Progress when timeout occurred:', uploadedPercent.toFixed(1) + '%');
        console.error('🐌 Upload speed at timeout:', stats ? formatBytes(stats.speed) + '/s' : 'unknown');
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          // Increase timeout for retries if we made some progress
          if (uploadedPercent > 5) {
            xhr.timeout = Math.min(TIMEOUT_MS, xhr.timeout * 1.5);
            console.log('⏰ Increasing timeout to', xhr.timeout / 1000, 'seconds for retry');
          }
          console.log('🔄 Retrying upload...');
          setTimeout(() => attemptUpload(), 1000 * retryCount);
        } else {
          const speedMBps = stats ? (stats.speed / (1024 * 1024)) : 0;
          const suggestion = speedMBps < 0.1 ? 
            ' Consider compressing the video or using a faster internet connection.' : 
            ' Server may be experiencing issues.';
          reject(new Error(`Upload timeout after ${baseTimeout / 1000}s. Average speed: ${speedMBps.toFixed(2)}MB/s.${suggestion}`));
        }
      };

      // Enhanced progress tracking with speed calculation and stall detection
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && stats) {
          const progress = (event.loaded / event.total) * 100;
          const currentTime = Date.now();
          const elapsed = (currentTime - stats.startTime) / 1000;
          
          // Only update if there's real progress to avoid spam
          if (event.loaded > stats.uploadedSize || currentTime - lastProgressTime > 5000) {
            lastProgressTime = currentTime;
            progressStalled = false;
          } else if (currentTime - lastProgressTime > 60000) { // 1 minute without progress
            progressStalled = true;
            console.warn('⚠️ Upload appears stalled. No progress for', Math.round((currentTime - lastProgressTime) / 1000), 'seconds');
          }
          
          stats.uploadedSize = event.loaded;
          stats.speed = event.loaded / elapsed; // bytes per second
          stats.eta = (event.total - event.loaded) / stats.speed;
          
          // Enhanced logging with less spam
          if (progress % 5 < 1 || progressStalled || stats.speed < 50 * 1024) { // Log every 5% or if issues
            const logData = {
              progress: `${progress.toFixed(1)}%`,
              uploaded: formatBytes(event.loaded),
              total: formatBytes(event.total),
              speed: formatBytes(stats.speed) + '/s',
              eta: `${stats.eta.toFixed(1)}s remaining`
            };
            
            if (progressStalled) {
              console.warn('🐌 Upload Progress (STALLED):', logData);
            } else if (stats.speed < 50 * 1024) { // Less than 50 KB/s
              console.warn('🐌 Upload Progress (SLOW):', logData);
            } else {
              console.log('📊 Upload Progress:', logData);
            }
          }
          
          onProgress?.(progress);
        }
      };

      xhr.onload = () => {
        const uploadTime = (Date.now() - (stats?.startTime || 0)) / 1000;
        console.log('🌐 Response Status:', xhr.status);
        console.log('📄 Response Headers:', xhr.getAllResponseHeaders());
        console.log('📝 Response Body:', xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✨ Parsed response:', response);
            
            // Strict validation: ensure we have a valid response with URL
            if (response && Array.isArray(response) && response.length > 0 && response[0] && 
                typeof response[0].url === 'string' && response[0].url.startsWith('http')) {
              
              console.log('✅ Upload completed successfully in', uploadTime.toFixed(2), 'seconds');
              console.log('📈 Average speed:', formatBytes((stats?.totalSize || 0) / uploadTime) + '/s');
              console.log('🎯 Server returned URL:', response[0].url);
              
              // Additional validation: check if URL looks like a valid UploadThing URL
              const url = response[0].url;
              if (!url.includes('uploadthing') && !url.includes('utfs.io')) {
                console.warn('⚠️ URL does not appear to be from UploadThing:', url);
              }
              
              console.groupEnd();
              resolve(response[0].url);
            } else {
              console.error('❌ Invalid or incomplete response:', response);
              console.error('❌ Expected: array with URL, got:', typeof response, response);
              reject(new Error('Upload failed: Invalid response format or missing URL'));
            }
          } catch (error) {
            console.error('❌ JSON Parse Error:', error);
            console.error('❌ Raw response:', xhr.responseText);
            reject(new Error('Upload failed: Unable to parse server response'));
          }
        } else {
          console.error('❌ HTTP Error:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          });
          
          if (retryCount < MAX_RETRIES && (xhr.status >= 500 || xhr.status === 0)) {
            retryCount++;
            console.log('🔄 Retrying due to server error...');
            setTimeout(() => attemptUpload(), 1000 * retryCount);
          } else {
            reject(new Error(`Upload failed with HTTP ${xhr.status}: ${xhr.responseText}`));
          }
        }
      };

      xhr.onerror = (error) => {
        console.error('🔥 Network Error:', error);
        console.error('📡 Connection Details:', {
          readyState: xhr.readyState,
          status: xhr.status,
          statusText: xhr.statusText
        });
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log('🔄 Retrying after network error...');
          setTimeout(() => attemptUpload(), 1000 * retryCount);
        } else {
          reject(new Error('Network error during upload after multiple retries'));
        }
      };

      // Optimized request configuration
      xhr.open('POST', `https://api.uploadthing.com/v6/uploadFiles`);
      xhr.setRequestHeader('X-Uploadthing-Api-Key', UPLOADTHING_TOKEN);
      
      // Remove browser-blocked headers and add safe optimizations
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      
      // Add timeout warning for large files
      const fileSize = file.size;
      const estimatedTime = fileSize / (1024 * 1024); // Rough estimate: 1MB per second
      if (estimatedTime > 300) { // 5+ minutes
        console.warn('⚠️ Large file detected. Estimated upload time:', Math.ceil(estimatedTime / 60), 'minutes');
        console.log('💡 Consider compressing the video or using a smaller file for better performance');
      }
      
      console.log('🚀 Starting XHR request...');
      xhr.send(formData);
    };

    attemptUpload();
  });
};

// Optimized upload for large files using chunked strategy
const uploadLargeFile = async (
  file: File,
  onProgress?: (progress: number) => void,
  stats?: UploadStats
): Promise<string> => {
  console.log('🎯 Large file upload strategy initiated');
  console.log('📊 File will be processed in', Math.ceil(file.size / CHUNK_SIZE), 'chunks');
  
  // For now, still use direct upload but with optimized settings
  // TODO: Implement true chunked upload when UploadThing supports it
  return uploadSmallFile(file, onProgress, stats);
};

// Utility function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};