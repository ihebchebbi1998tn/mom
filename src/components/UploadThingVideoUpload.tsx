import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Video, X } from "lucide-react";
import { uploadToUploadThing } from "@/lib/uploadthing-client";
import { formatFileSize, getVideoDuration, formatDuration } from "@/utils/fastVideoCompression";
import { Progress } from "@/components/ui/progress";

interface UploadThingVideoUploadProps {
  onUploadComplete: (url: string, duration: string) => void;
  disabled?: boolean;
}

const UploadThingVideoUpload = ({ onUploadComplete, disabled }: UploadThingVideoUploadProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف فيديو",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 256MB for UploadThing)
    if (file.size > 256 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يرجى اختيار ملف أقل من 256 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentStage("🚀 بدء الرفع...");

    try {
      console.log('🎬 Starting video upload:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Upload with progress tracking
      const uploadedUrl = await uploadToUploadThing(selectedFile, (progress) => {
        setUploadProgress(progress);
        
        if (progress < 10) {
          setCurrentStage("🚀 بدء الرفع...");
        } else if (progress < 30) {
          setCurrentStage(`📤 جاري الرفع... ${Math.round(progress)}%`);
        } else if (progress < 70) {
          setCurrentStage(`⚡ رفع سريع... ${Math.round(progress)}%`);
        } else if (progress < 90) {
          setCurrentStage(`🔄 معالجة نهائية... ${Math.round(progress)}%`);
        } else if (progress < 100) {
          setCurrentStage(`✅ اكتمال الرفع... ${Math.round(progress)}%`);
        }
      });
      
      // Get video duration
      let duration = "";
      if (selectedFile) {
        try {
          const videoDuration = await getVideoDuration(selectedFile);
          duration = formatDuration(videoDuration);
        } catch (error) {
          console.warn('⚠️ Could not extract video duration:', error);
        }
      }
      
      setIsUploading(false);
      setUploadProgress(100);
      setCurrentStage("🎉 تم الرفع بنجاح!");
      
      onUploadComplete(uploadedUrl, duration);
      
      toast({
        title: "تم رفع الفيديو بنجاح",
        description: `تم رفع ${selectedFile.name} بنجاح`,
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      setIsUploading(false);
      setCurrentStage("❌ فشل في الرفع");
      
      toast({
        title: "خطأ في رفع الفيديو",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setCurrentStage("");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video-upload">اختيار فيديو</Label>
        <div className="mt-2">
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          {!selectedFile ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('video-upload')?.click()}
              disabled={disabled || isUploading}
              className="w-full h-24 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  انقر لاختيار ملف فيديو
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  الحد الأقصى: 256 ميجابايت • رفع مباشر بدون ضغط
                </p>
              </div>
            </Button>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      الحجم: {formatFileSize(selectedFile.size)} • رفع مباشر بدون ضغط
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={disabled || isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!isUploading && (
                <Button
                  onClick={handleUpload}
                  disabled={disabled}
                  className="w-full mt-2"
                >
                  رفع الفيديو
                </Button>
              )}

              {isUploading && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{currentStage}</span>
                    <span className="font-mono">{uploadProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3" />
                  
                  {/* Speed and ETA info (will be populated by enhanced logging) */}
                  <div className="text-xs text-muted-foreground text-center">
                    🚀 رفع محسن مع إعادة المحاولة التلقائية
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadThingVideoUpload;