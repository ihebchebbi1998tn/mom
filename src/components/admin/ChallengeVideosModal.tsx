import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video, Edit, Trash2, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTextAlignmentClasses, getTextDirection } from "@/utils/textAlignment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CreateVideoModal from "./CreateVideoModal";

interface Challenge {
  id: number;
  title: string;
}

interface VideoItem {
  id: number;
  sub_pack_id: number;
  sub_pack_title: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  available_at?: string;
  views: number;
  status: string;
}

interface ChallengeVideosModalProps {
  open: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const ChallengeVideosModal = ({ open, onClose, challenge }: ChallengeVideosModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchChallengeVideos();
    }
  }, [open, challenge.id]);

  const fetchChallengeVideos = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch pack_challenge_links to get pack_ids
      const linksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?challenge_id=${challenge.id}`);
      const linksData = await linksResponse.json();
      
      if (!linksData.success || !linksData.data || linksData.data.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }

      const packIds = linksData.data.map((link: any) => link.pack_id);
      
      // 2. Fetch sub-packs for each pack
      const allSubPacks = [];
      for (const packId of packIds) {
        try {
          const subPackLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php?pack_id=${packId}`);
          const subPackLinksData = await subPackLinksResponse.json();
          
          if (subPackLinksData.success && subPackLinksData.data) {
            allSubPacks.push(...subPackLinksData.data);
          }
        } catch (error) {
          console.error(`Failed to fetch sub-packs for pack ${packId}:`, error);
        }
      }

      // 3. Fetch videos for each sub-pack
      const allVideos: VideoItem[] = [];
      for (const subPack of allSubPacks) {
        try {
          // The API returns sub-pack data where 'id' is the sub_pack_id
          const subPackId = subPack.id;
          const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPackId}`);
          const videosData = await videosResponse.json();
          
          if (videosData.success && videosData.data) {
            const videosWithSubPackInfo = videosData.data
              .filter((v: any) => v.status === 'active')
              .map((v: any) => ({
                ...v,
                sub_pack_title: subPack.title || 'Sans titre'
              }));
            allVideos.push(...videosWithSubPackInfo);
          }
        } catch (error) {
          console.error(`Failed to fetch videos for sub-pack ${subPack.id}:`, error);
        }
      }
      
      setVideos(allVideos);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les vidéos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = (video: VideoItem) => {
    setEditingVideo(video);
    setIsEditModalOpen(true);
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/videos.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: videoId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: "Vidéo supprimée avec succès"
        });
        fetchChallengeVideos();
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vidéo",
        variant: "destructive"
      });
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingVideo(null);
  };

  const handleEditSuccess = () => {
    fetchChallengeVideos();
    handleEditModalClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh]" dir="ltr">
          <DialogHeader>
            <DialogTitle>
              Vidéos du Challenge - <span dir="rtl">{challenge.title}</span>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Aucune vidéo trouvée. Veuillez d'abord assigner des capsules à ce challenge.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="w-4 h-4" />
                <span>{videos.length} vidéo(s) trouvée(s)</span>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border"
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={video.thumbnail_url || video.video_url}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                        <div className="w-32 h-20 bg-muted rounded hidden items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                            <Package className="w-3 h-3" />
                            <span
                              className={getTextAlignmentClasses(video.sub_pack_title)}
                              dir={getTextDirection(video.sub_pack_title)}
                              style={{ unicodeBidi: 'plaintext' }}
                            >
                              {video.sub_pack_title}
                            </span>
                          </Badge>
                        </div>
                        <h4
                          className={`text-sm font-semibold text-foreground mb-1 ${getTextAlignmentClasses(video.title)}`}
                          dir={getTextDirection(video.title)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {video.title}
                        </h4>
                        {video.description && (
                          <p
                            className={`text-xs text-muted-foreground line-clamp-2 mb-2 ${getTextAlignmentClasses(video.description)}`}
                            dir={getTextDirection(video.description)}
                            style={{ unicodeBidi: 'plaintext' }}
                          >
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {video.duration && <span>Durée: {video.duration}</span>}
                          <span>Vues: {video.views}</span>
                          {video.available_at && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              📅 {new Date(video.available_at).toLocaleString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVideo(video)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="ltr">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVideo(video.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Video Modal */}
      {editingVideo && (
        <CreateVideoModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSuccess={handleEditSuccess}
          subPackId={editingVideo.sub_pack_id}
          editingVideo={editingVideo}
        />
      )}
    </>
  );
};

export default ChallengeVideosModal;
