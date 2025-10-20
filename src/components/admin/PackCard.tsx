import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, BookOpen, Users, Clock, Star, Package, PlayCircle } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: string;
  rating: number;
  image_url?: string;
  description?: string;
  status: string;
  created_at: string;
}

interface PackCardProps {
  pack: CoursePack;
  subPackCount: number;
  totalVideos: number;
  acceptedUsers: number;
  onSelect: (pack: CoursePack) => void;
  onEdit: (pack: CoursePack) => void;
  onDelete: (packId: number) => void;
  onLinkSubPacks?: () => void;
  isSelected?: boolean;
}

const PackCard = ({ pack, subPackCount, totalVideos, acceptedUsers, onSelect, onEdit, onDelete, onLinkSubPacks, isSelected }: PackCardProps) => {
  return (
    <Card 
      className={`card-elegant overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(pack)}
    >
      {/* Pack Image */}
      <div className="relative">
        {pack.image_url ? (
          <img 
            src={pack.image_url} 
            alt={pack.title}
            className="w-full h-48 object-contain bg-muted"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary">
          {pack.price}
        </div>
        <div className="absolute top-4 left-4">
          <Badge variant={pack.status === 'active' ? 'default' : 'secondary'}>
            {pack.status === 'active' ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <h3 
          className={`text-xl font-bold text-foreground mb-2 ${getTextAlignmentClasses(pack.title)} ${getContainerDirection(pack.title)}`}
          dir={getTextDirection(pack.title)}
          style={{ unicodeBidi: 'plaintext' }}
        >
          {pack.title}
        </h3>
        
        {pack.description && (
          <p 
            className={`text-muted-foreground text-sm mb-4 line-clamp-2 ${getTextAlignmentClasses(pack.description)} ${getContainerDirection(pack.description)}`}
            dir={getTextDirection(pack.description)}
            style={{ unicodeBidi: 'plaintext' }}
          >
            {pack.description}
          </p>
        )}
        
        {/* Pack Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {pack.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {pack.students} mamans
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {pack.rating}
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {subPackCount} chapitre
          </div>
        </div>

        {/* Content Overview */}
        <div className="space-y-2 mb-6">
          <div className="text-sm font-medium text-foreground mb-2">
            Contenu du pack :
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-primary-soft/20 rounded-lg p-3 text-center">
              <div className="font-bold text-primary text-lg">{subPackCount}</div>
              <div className="text-muted-foreground">chapitre</div>
            </div>
            <div className="bg-secondary-soft/20 rounded-lg p-3 text-center">
              <div className="font-bold text-secondary text-lg">{totalVideos}</div>
              <div className="text-muted-foreground">vidéo</div>
            </div>
            <div className="bg-green-100 rounded-lg p-3 text-center">
              <div className="font-bold text-green-600 text-lg">{acceptedUsers}</div>
              <div className="text-muted-foreground">maman</div>
            </div>
          </div>
        </div>

        {/* Modules Preview */}
        {pack.modules && (
          <div className="space-y-2 mb-6">
            <div className="text-sm font-medium text-foreground mb-2">
              Modules :
            </div>
            {pack.modules.split(',').map((module, idx) => (
              <div key={idx} className={`flex items-center gap-2 ${getContainerDirection(module.trim())}`}>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span 
                  className={`text-foreground text-sm ${getTextAlignmentClasses(module.trim())}`}
                  dir={getTextDirection(module.trim())}
                  style={{ unicodeBidi: 'plaintext' }}
                >
                  {module.trim()}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className="btn-hero flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(pack);
            }}
          >
            Voir le contenu
            <PlayCircle className="w-4 h-4 mr-2" />
          </Button>
          {onLinkSubPacks && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLinkSubPacks();
              }}
              title="Lier des chapitres"
            >
              <Package className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pack);
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
                  Êtes-vous sûr de vouloir supprimer le pack "
                  <span 
                    dir={getTextDirection(pack.title)}
                    style={{ unicodeBidi: 'plaintext' }}
                  >
                    {pack.title}
                  </span>
                  " ? Cette action supprimera également tous les sous-packs et vidéos associés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-center sm:justify-center gap-2">
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(pack.id)}
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

export default PackCard;