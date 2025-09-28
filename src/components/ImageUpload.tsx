import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image, X, Loader2 } from "lucide-react";
import { compressImage } from "@/utils/fastVideoCompression";

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  disabled?: boolean;
  label?: string;
  currentImage?: string;
}

const ImageUpload = ({ onUploadComplete, disabled, label = "رفع صورة", currentImage }: ImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || "");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف صورة",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يرجى اختيار صورة أقل من 10 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setCompressing(true);
      setUploadProgress(0);

      // Compress image
      const compressedFile = await compressImage(selectedFile, 1200, 800, 0.8);
      
      setCompressing(false);
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', compressedFile);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              toast({
                title: "تم رفع الصورة بنجاح",
                description: "تم ضغط ورفع الصورة بنجاح"
              });
              onUploadComplete(response.image_url);
              resetUpload();
            } else {
              throw new Error(response.message || 'Upload failed');
            }
          } catch (error) {
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload request failed');
      };

      xhr.open('POST', 'https://spadadibattaglia.com/mom/api/upload_image.php');
      xhr.send(formData);

    } catch (error) {
      toast({
        title: "خطأ في رفع الصورة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading || compressing}
          />
          
          {!previewUrl ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading || compressing}
              className="w-full h-32 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  انقر لاختيار صورة
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  الحد الأقصى: 10 ميجابايت
                </p>
              </div>
            </Button>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreviewUrl("");
                      resetUpload();
                    }}
                    disabled={uploading || compressing}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  {selectedFile && (
                    <div className="mb-2">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {compressing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري ضغط الصورة...</span>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري رفع الصورة...</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress.toFixed(0)}% مكتمل
                      </p>
                    </div>
                  )}

                  {!compressing && !uploading && selectedFile && (
                    <Button
                      type="button"
                      onClick={handleUpload}
                      className="w-full btn-hero"
                      disabled={disabled}
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      رفع الصورة
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;