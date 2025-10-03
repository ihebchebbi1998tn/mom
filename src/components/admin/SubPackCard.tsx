import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, PlayCircle, Video } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

interface SubPack {
  id: number;
  pack_id: number;
  title: string;
  description?: string;
  banner_image_url?: string;
  intro_video_url?: string;
  order_index: number;
  status: string;
}

interface SubPackCardProps {
  subPack: SubPack;
  videoCount: number;
  index: number;
  onSelect: (subPack: SubPack) => void;
  onEdit: (subPack: SubPack) => void;
  onDelete: (subPackId: number) => void;
  isSelected?: boolean;
  packImage?: string;
}

const SubPackCard = ({ subPack, videoCount, index, onSelect, onEdit, onDelete, isSelected, packImage }: SubPackCardProps) => {
  return (
    <Card 
      className={`card-elegant overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(subPack)}
    >
      <div className="relative h-32 overflow-hidden">
        {/* Background Image - Use banner_image_url if available, otherwise packImage */}
        {(subPack.banner_image_url || packImage) ? (
          <>
            <img 
              src={subPack.banner_image_url || packImage} 
              alt={subPack.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-primary/80"></div>
          </>
        ) : (
          /* Fallback gradient if no image */
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary"></div>
        )}
        
        {/* Content overlay */}
        <div className="relative p-6 text-white h-full flex flex-col justify-end">
          <div>
            <h3 
              className={`text-xl font-bold mb-2 ${getTextAlignmentClasses(subPack.title)} ${getContainerDirection(subPack.title)}`}
              dir={getTextDirection(subPack.title)}
              style={{ unicodeBidi: 'plaintext' }}
            >
              {subPack.title}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {subPack.description && (
          <p 
            className={`text-muted-foreground text-sm mb-4 ${getTextAlignmentClasses(subPack.description)} ${getContainerDirection(subPack.description)}`}
            dir={getTextDirection(subPack.description)}
            style={{ unicodeBidi: 'plaintext' }}
          >
            {subPack.description}
          </p>
        )}
        
        <div className="grid grid-cols-1 gap-2 text-sm mb-4">
          <div className="bg-secondary-soft/20 rounded-lg p-3 text-center">
            <div className="font-bold text-secondary text-lg">{videoCount}</div>
            <div className="text-muted-foreground">vidéo</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="btn-hero flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(subPack);
            }}
          >
            Voir videos
            <PlayCircle className="w-4 h-4 mr-2" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(subPack);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="ltr">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer le sous-pack "
                  <span 
                    dir={getTextDirection(subPack.title)}
                    style={{ unicodeBidi: 'plaintext' }}
                  >
                    {subPack.title}
                  </span>
                  " ? Cette action supprimera également toutes les vidéos associées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-center sm:justify-center gap-2">
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(subPack.id)}
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
  );
};

export default SubPackCard;