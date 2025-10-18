import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Play, Clock, Eye } from "lucide-react";
import VideoPlayer from "../VideoPlayer";
import { useState } from "react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

interface Video {
  id: number;
  sub_pack_id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  order_index: number;
  views: number;
  status: string;
}

interface VideoCardProps {
  video: Video;
  index: number;
  onEdit: (video: Video) => void;
  onDelete: (videoId: number) => void;
}

const VideoCard = ({ video, index, onEdit, onDelete }: VideoCardProps) => {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <>
      <Card className="card-elegant overflow-hidden group">
        <div className="relative">
          {video.thumbnail_url ? (
            <div className="relative w-full h-48 overflow-hidden">
              <img 
                src={video.thumbnail_url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {video.duration}
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge variant={video.status === 'active' ? 'default' : 'secondary'}>
              {video.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-2">
            <h3 
              className={`text-lg font-bold text-foreground ${getTextAlignmentClasses(video.title)} ${getContainerDirection(video.title)}`}
              dir={getTextDirection(video.title)}
              style={{ unicodeBidi: 'plaintext' }}
            >
              {video.title}
            </h3>
          </div>
          
          {video.description && (
            <p 
              className={`text-muted-foreground text-sm mb-4 ${getTextAlignmentClasses(video.description)} ${getContainerDirection(video.description)}`}
              dir={getTextDirection(video.description)}
              style={{ unicodeBidi: 'plaintext' }}
            >
              {video.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {video.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {video.duration}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views} vues
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="btn-hero flex-1"
              onClick={() => setShowPlayer(true)}
            >
              Voir Vidéo
              <Play className="w-4 h-4 mr-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(video)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="ltr">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer cette vidéo "
                    <span 
                      dir={getTextDirection(video.title)}
                      style={{ unicodeBidi: 'plaintext' }}
                    >
                      {video.title}
                    </span>
                    " ? Cette action est irréversible et supprimera définitivement la vidéo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-center sm:justify-center gap-2">
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(video.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>

      {showPlayer && (
        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
          <DialogContent className="max-w-4xl">
            <VideoPlayer
              src={video.video_url}
              title={video.title}
              className="w-full"
              videoId={video.id}
              onUrlUpdate={(newUrl) => {
                console.log('Video URL updated in admin:', newUrl);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default VideoCard;