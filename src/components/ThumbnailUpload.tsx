import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image, X, Loader2 } from "lucide-react";

interface ThumbnailUploadProps {
  onUploadComplete: (thumbnailUrl: string) => void;
  disabled?: boolean;
  currentThumbnail?: string;
}

const ThumbnailUpload = ({ onUploadComplete, disabled, currentThumbnail }: ThumbnailUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(currentThumbnail || "");

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

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يرجى اختيار صورة أقل من 8 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      // Upload to PHP API
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('https://spadadibattaglia.com/mom/api/upload_image.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success && data.image_url) {
        onUploadComplete(data.image_url);
        setThumbnailPreview(data.image_url);
        toast({ title: "تم رفع الصورة المصغرة بنجاح" });
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: "خطأ في رفع الصورة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      setThumbnailPreview(currentThumbnail || "");
      setUploading(false);
    }
  };

  const clearThumbnail = () => {
    setThumbnailPreview("");
    onUploadComplete("");
  };

  return (
    <div className="space-y-3">
      <Label>الصورة المصغرة للفيديو</Label>
      
      {!thumbnailPreview ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="thumbnail-upload"
            disabled={disabled || uploading}
          />
          <label
            htmlFor="thumbnail-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">
                {uploading ? "جاري رفع الصورة..." : "انقر لاختيار صورة مصغرة"}
              </p>
              <p className="text-xs mt-1">PNG, JPG, WEBP (الحد الأقصى: 8MB)</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden bg-muted/20">
          <img
            src={thumbnailPreview}
            alt="Thumbnail preview"
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById('thumbnail-upload')?.click()}
              disabled={disabled || uploading}
            >
              <Image className="w-4 h-4 ml-1" />
              تغيير
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearThumbnail}
              disabled={disabled || uploading}
            >
              <X className="w-4 h-4 ml-1" />
              حذف
            </Button>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="thumbnail-upload"
            disabled={disabled || uploading}
          />
        </div>
      )}
    </div>
  );
};

export default ThumbnailUpload;