import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AdminVideoUpload from "./AdminVideoUpload";
import AdminThumbnailUpload from "./AdminThumbnailUpload";
import { fastCompressVideo, getVideoDuration, formatDuration, formatFileSize } from "@/utils/fastVideoCompression";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import { Loader2, CalendarIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Video {
  id: number;
  sub_pack_id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  available_at?: string;
  views: number;
  status: string;
}

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subPackId: number;
  editingVideo?: Video | null;
}

const CreateVideoModal = ({ isOpen, onClose, onSuccess, subPackId, editingVideo }: CreateVideoModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>("");
  
  const [videoForm, setVideoForm] = useState({
    title: editingVideo?.title || "",
    description: editingVideo?.description || "",
    video_url: editingVideo?.video_url || "",
    thumbnail_url: editingVideo?.thumbnail_url || "",
    duration: editingVideo?.duration || "",
    available_at: editingVideo?.available_at || "",
    status: editingVideo?.status || "active"
  });

  // Update form when editingVideo changes to ensure all current information is loaded
  useEffect(() => {
    if (editingVideo) {
      setVideoForm({
        title: editingVideo.title || "",
        description: editingVideo.description || "",
        video_url: editingVideo.video_url || "",
        thumbnail_url: editingVideo.thumbnail_url || "",
        duration: editingVideo.duration || "",
        available_at: editingVideo.available_at || "",
        status: editingVideo.status || "active"
      });
      setSelectedDate(editingVideo.available_at ? new Date(editingVideo.available_at) : new Date());
      setSelectedTime(editingVideo.available_at ? format(new Date(editingVideo.available_at), "HH:mm") : "09:00");
    } else {
      // Reset form for new video creation
      setVideoForm({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        duration: "",
        available_at: "",
        status: "active"
      });
      setSelectedDate(new Date());
      setSelectedTime("09:00");
    }
  }, [editingVideo]);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    editingVideo?.available_at ? new Date(editingVideo.available_at) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState(
    editingVideo?.available_at 
      ? format(new Date(editingVideo.available_at), "HH:mm")
      : "09:00"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If a file is selected but not yet uploaded, upload now before creating/updating the DB record
    try {
      setLoading(true);

      if (selectedVideoFile && !uploadedVideoUrl && !editingVideo) {
        setUploadStage("Début du téléchargement...");
        setUploadProgress(0);

        const finalUrl: string = await new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append("file", selectedVideoFile);

          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
              const loadedMB = (event.loaded / (1024 * 1024)).toFixed(2);
              const totalMB = (event.total / (1024 * 1024)).toFixed(2);
              setUploadStage(`Progression du téléchargement: ${progress}% (${loadedMB}MB/${totalMB}MB)`);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                // Optional server logs
                if (response?.logs) {
                  try {
                    console.groupCollapsed("Upload logs");
                    (response.logs as string[]).forEach((l) => console.log(l));
                    console.groupEnd();
                  } catch {}
                }

                if (response.status === "success") {
                  const url = response.finalUrl || response.privateUrl;
                  if (!url) {
                    reject(new Error("Téléchargement réussi mais aucune URL retournée"));
                    return;
                  }
                  setUploadProgress(100);
                  setUploadStage(response.cached ? "Téléchargement et mise en cache réussis" : "Téléchargement réussi");
                  resolve(url);
                } else {
                  reject(new Error(response.message || "Échec du téléchargement"));
                }
              } catch (err) {
                reject(new Error("Échec du téléchargement: Format de réponse invalide"));
              }
            } else {
              reject(new Error(`Échec du téléchargement avec HTTP ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Erreur réseau pendant le téléchargement"));

          xhr.open("POST", "https://spadadibattaglia.com/mom/api/upload.php");
          xhr.send(formData);
        });

        setUploadedVideoUrl(finalUrl);
      }

      const url = 'https://spadadibattaglia.com/mom/api/videos.php';
      const method = editingVideo ? 'PUT' : 'POST';

      const finalVideoUrl = uploadedVideoUrl || videoForm.video_url; // if we just uploaded, uploadedVideoUrl is set

      if (!finalVideoUrl) {
        // Safety check
        toast({
          title: "Veuillez télécharger une vidéo ou saisir le lien de la vidéo",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Combine date and time for available_at
      const availableAt = selectedDate 
        ? `${format(selectedDate, "yyyy-MM-dd")} ${selectedTime}:00`
        : null;

      const body = editingVideo ? 
        { ...videoForm, video_url: finalVideoUrl, available_at: availableAt, id: editingVideo.id } : 
        { ...videoForm, video_url: finalVideoUrl, available_at: availableAt, sub_pack_id: subPackId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        toast({ 
          title: editingVideo ? "Vidéo mise à jour avec succès" : "Vidéo créée avec succès" 
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: editingVideo ? "Erreur de mise à jour de la vidéo" : "Erreur de création de la vidéo",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (url: string, fileName: string) => {
    setUploadedVideoUrl(url);
    setUploadStage("Téléchargement réussi !");
  };

  const handleFileSelect = (file: File, duration: string) => {
    setSelectedVideoFile(file);
    
    // Ensure we always get accurate duration from the video file
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const durationInSeconds = Math.floor(video.duration);
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      setVideoForm(prev => ({
        ...prev,
        duration: formattedDuration
      }));
      
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  };

  const handleThumbnailUpload = (thumbnailUrl: string) => {
    setVideoForm(prev => ({
      ...prev,
      thumbnail_url: thumbnailUrl
    }));
    setThumbnailUploading(false);
  };

  const handleThumbnailUploadStart = () => {
    setThumbnailUploading(true);
  };

  const handleUploadProgress = (progress: number, stage: string) => {
    setUploadProgress(progress);
    setUploadStage(stage);
  };

  const resetForm = () => {
    setVideoForm({
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      duration: "",
      available_at: "",
      status: "active"
    });
    setSelectedVideoFile(null);
    setUploadedVideoUrl("");
    setUploadProgress(0);
    setUploadStage("");
    setSelectedDate(new Date());
    setSelectedTime("09:00");
  };

  const handleClose = () => {
    onClose();
    if (!editingVideo) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-left">
            {editingVideo ? "Mettre à jour la vidéo" : "Ajouter une nouvelle vidéo"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
          <div>
            <Label htmlFor="title">Titre de la vidéo</Label>
            <Input
              id="title"
              value={videoForm.title}
              onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
              required
              className={getTextAlignmentClasses(videoForm.title)}
              dir={getTextDirection(videoForm.title)}
              style={{ unicodeBidi: 'plaintext' }}
            />
            </div>

            <div>
              <AdminThumbnailUpload
                onUploadComplete={handleThumbnailUpload}
                onUploadStart={handleThumbnailUploadStart}
                disabled={loading}
                currentThumbnail={videoForm.thumbnail_url}
              />
            </div>
            
            <div>
            <Label htmlFor="description">Description de la vidéo</Label>
            <Textarea
              id="description"
              value={videoForm.description}
              onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
              className={getTextAlignmentClasses(videoForm.description)}
              dir={getTextDirection(videoForm.description)}
              style={{ unicodeBidi: 'plaintext' }}
            />
          </div>

          {!editingVideo && (
            <div>
              <Label>Télécharger la vidéo</Label>
              <AdminVideoUpload
                onFileSelect={handleFileSelect}
                onUploadComplete={handleUploadComplete}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ou vous pouvez saisir le lien de la vidéo directement ci-dessous
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="video_url">Lien de la vidéo</Label>
            {videoForm.video_url && videoForm.video_url.includes('spadadibattaglia.com') ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-800">
                    Vidéo téléchargée: {(() => {
                      try {
                        const url = new URL(videoForm.video_url);
                        const params = new URLSearchParams(url.search);
                        return params.get('file') || url.pathname.split('/').pop() || 'Fichier vidéo';
                      } catch {
                        return videoForm.video_url.split('/').pop() || 'Fichier vidéo';
                      }
                    })()}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Fichier hébergé sur le serveur
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVideoForm({...videoForm, video_url: ""})}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            ) : (
              <Input
                id="video_url"
                value={videoForm.video_url}
                onChange={(e) => setVideoForm({...videoForm, video_url: e.target.value})}
                placeholder="https://example.com/video.mp4"
              />
            )}
          </div>
          
          <div>
            <Label htmlFor="duration">Durée de la vidéo (mm:ss)</Label>
            <Input
              id="duration"
              value={videoForm.duration}
              onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
              placeholder="10:30"
              readOnly={selectedVideoFile ? true : false}
              className={`${selectedVideoFile ? "bg-muted" : ""} ${getTextAlignmentClasses(videoForm.duration)}`}
              dir={getTextDirection(videoForm.duration)}
              style={{ unicodeBidi: 'plaintext' }}
            />
            {selectedVideoFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Durée calculée automatiquement à partir de la vidéo
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Date et heure de publication</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="publish-date" className="text-sm">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="publish-time" className="text-sm">Heure</Label>
                <Input
                  id="publish-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              La vidéo sera visible aux utilisateurs à partir de cette date et heure
            </p>
          </div>
          
          {uploadStage && (
            <div className="space-y-3 mt-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{uploadStage}</span>
              </div>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="h-3" />
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="btn-hero" disabled={loading || thumbnailUploading}>
              {thumbnailUploading ? "Téléchargement miniature..." : 
               loading ? "Sauvegarde en cours..." : 
               (editingVideo ? "Mettre à jour la vidéo" : "Créer la vidéo")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVideoModal;