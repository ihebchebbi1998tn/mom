import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTextAlignmentClasses, getTextDirection } from "@/utils/textAlignment";
import AdminVideoUpload from "@/components/admin/AdminVideoUpload";
import AdminThumbnailUpload from "@/components/admin/AdminThumbnailUpload";
import ModernVideoModal from "@/components/ModernVideoModal";

interface Video {
  id: number;
  workshop_id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface Workshop {
  id: number;
  title: string;
}

interface WorkshopVideosManagementProps {
  workshop: Workshop;
  onBack: () => void;
}

const WorkshopVideosManagement = ({ workshop, onBack }: WorkshopVideosManagementProps) => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoThumbnails, setVideoThumbnails] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    order_index: 0,
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchVideos();
  }, [workshop.id]);

  // Generate thumbnail from video first frame
  const generateThumbnail = (videoUrl: string, videoId: number) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.5; // Seek to 0.5s to get a good frame
    });
    
    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 480; // Set reasonable dimensions
        canvas.height = 270; // 16:9 aspect ratio
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Calculate dimensions to maintain aspect ratio
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;
          
          if (videoAspect > canvasAspect) {
            drawHeight = canvas.width / videoAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * videoAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          }
          
          // Fill with black background
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          setVideoThumbnails(prev => ({ ...prev, [videoId]: thumbnailUrl }));
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        // If CORS fails, use a placeholder
        setVideoThumbnails(prev => ({ ...prev, [videoId]: '' }));
      }
    });
    
    video.addEventListener('error', (e) => {
      console.error('Error loading video for thumbnail:', e);
      setVideoThumbnails(prev => ({ ...prev, [videoId]: '' }));
    });
  };

  useEffect(() => {
    videos.forEach(video => {
      if (video.video_url && !videoThumbnails[video.id]) {
        generateThumbnail(video.video_url, video.id);
      }
    });
  }, [videos]);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/workshop_videos.php?workshop_id=${workshop.id}`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data || []);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les vidéos",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      ...formData,
      workshop_id: workshop.id
    };

    try {
      const url = 'https://spadadibattaglia.com/mom/api/workshop_videos.php';
      const method = editingVideo ? 'PUT' : 'POST';
      const body = editingVideo ? { ...videoData, id: editingVideo.id } : videoData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: editingVideo ? "Mise à jour réussie" : "Création réussie",
          description: editingVideo ? "La vidéo a été mise à jour" : "La vidéo a été créée",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchVideos();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de sauvegarder la vidéo",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return;
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshop_videos.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Suppression réussie",
          description: "La vidéo a été supprimée",
        });
        fetchVideos();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de supprimer la vidéo",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration: video.duration || '',
      order_index: video.order_index,
      status: video.status
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      order_index: videos.length,
      status: 'active'
    });
  };

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Vidéos de l'Atelier</h2>
            <p className="text-sm text-muted-foreground" dir={getTextDirection(workshop.title)} style={{ unicodeBidi: 'plaintext' }}>
              {workshop.title}
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-hero" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ajouter une Vidéo</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="ltr">
            <DialogHeader>
              <DialogTitle className="text-left">
                {editingVideo ? "Modifier la Vidéo" : "Ajouter une Vidéo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de la Vidéo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la vidéo"
                  className={getTextAlignmentClasses(formData.title)}
                  dir={getTextDirection(formData.title)}
                  style={{ unicodeBidi: 'plaintext' }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la vidéo"
                  className={getTextAlignmentClasses(formData.description)}
                  dir={getTextDirection(formData.description)}
                  style={{ unicodeBidi: 'plaintext' }}
                />
              </div>

              <div>
                <Label>Vidéo *</Label>
                <AdminVideoUpload
                  onFileSelect={(file) => console.log('Video file selected:', file?.name)}
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, video_url: url }))}
                />
              </div>

              <div>
                <Label>Miniature</Label>
                <AdminThumbnailUpload
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                  currentThumbnail={formData.thumbnail_url}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Durée (ex: 15:30)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="15:30"
                  />
                </div>
                <div>
                  <Label htmlFor="order_index">Ordre</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="btn-hero flex-1">
                  {editingVideo ? "Mettre à Jour" : "Créer la Vidéo"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Chargement des vidéos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune vidéo enregistrée</p>
          </div>
        ) : (
          videos.map((video) => {
            // Always use generated thumbnail, not API thumbnail
            const thumbnailUrl = videoThumbnails[video.id];
            
            return (
              <Card key={video.id} className="card-elegant p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedVideo(video)}>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative group">
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Play className="w-12 h-12 text-primary/50 animate-pulse" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`font-bold text-foreground text-lg ${getTextAlignmentClasses(video.title)}`}
                          dir={getTextDirection(video.title)}
                          style={{ unicodeBidi: 'plaintext' }}>
                        {video.title}
                      </h3>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {video.description && (
                      <p className={`text-muted-foreground mb-2 ${getTextAlignmentClasses(video.description)}`}
                         dir={getTextDirection(video.description)}
                         style={{ unicodeBidi: 'plaintext' }}>
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {video.duration && (
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          {video.duration}
                        </span>
                      )}
                      <span>Ordre: {video.order_index}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <ModernVideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.video_url}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
};

export default WorkshopVideosManagement;
