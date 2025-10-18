import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image, X, Loader2 } from "lucide-react";

interface AdminThumbnailUploadProps {
  onUploadComplete: (thumbnailUrl: string) => void;
  onUploadStart?: () => void;
  disabled?: boolean;
  currentThumbnail?: string;
}

const AdminThumbnailUpload = ({ onUploadComplete, onUploadStart, disabled, currentThumbnail }: AdminThumbnailUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(currentThumbnail || "");

  // Update thumbnail preview when currentThumbnail prop changes
  useEffect(() => {
    setThumbnailPreview(currentThumbnail || "");
  }, [currentThumbnail]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier incorrect",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Veuillez sélectionner une image de moins de 8 MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    onUploadStart?.();

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
        toast({ title: "Miniature téléchargée avec succès" });
      } else {
        throw new Error(data.message || 'Échec du téléchargement');
      }
    } catch (error) {
      toast({
        title: "Erreur de téléchargement d'image",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      setThumbnailPreview(currentThumbnail || "");
    } finally {
      setUploading(false);
    }
  };

  const clearThumbnail = () => {
    setThumbnailPreview("");
    onUploadComplete("");
  };

  return (
    <div className="space-y-3" dir="ltr">
      <Label>Miniature de la vidéo</Label>
      
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
                {uploading ? "Téléchargement en cours..." : "Cliquez pour sélectionner une miniature"}
              </p>
              <p className="text-xs mt-1">PNG, JPG, WEBP (Maximum: 8MB)</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden bg-muted/20">
          <img
            src={thumbnailPreview}
            alt="Aperçu de la miniature"
            className="w-full h-32 object-contain bg-muted/10"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
              onClick={() => document.getElementById('thumbnail-upload')?.click()}
              disabled={disabled || uploading}
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 shadow-sm"
              onClick={clearThumbnail}
              disabled={disabled || uploading}
            >
              <X className="w-4 h-4" />
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

export default AdminThumbnailUpload;
