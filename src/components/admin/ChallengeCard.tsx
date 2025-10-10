import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Trash2, Video, Calendar, Users, Trophy } from "lucide-react";
import { getTextDirection, getTextAlignmentClasses, getContainerDirection } from "@/utils/textAlignment";

interface Challenge {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  participants: number;
  reward: string;
  status: 'active' | 'upcoming' | 'completed';
  start_date: string;
  end_date: string;
  price: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onEdit: (challenge: Challenge) => void;
  onDelete: (id: number) => void;
  onManageVideos: (challenge: Challenge) => void;
  onManageSubPacks?: (challenge: Challenge) => void;
}

const ChallengeCard = ({ challenge, onEdit, onDelete, onManageVideos, onManageSubPacks }: ChallengeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-100 text-green-700';
      case 'متوسط': return 'bg-yellow-100 text-yellow-700';
      case 'صعب': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'upcoming': return 'À venir';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
    <Card className="card-elegant overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-2">
            <Badge className={getStatusColor(challenge.status)} dir="ltr">
              {getStatusText(challenge.status)}
            </Badge>
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
          </div>
        </div>

        <h3 
          className={`text-xl font-bold text-foreground mb-2 ${getTextAlignmentClasses(challenge.title)} ${getContainerDirection(challenge.title)}`}
          dir={getTextDirection(challenge.title)}
          style={{ unicodeBidi: 'plaintext' }}
        >
          {challenge.title}
        </h3>
        <p 
          className={`text-sm text-muted-foreground mb-4 line-clamp-2 ${getTextAlignmentClasses(challenge.description)} ${getContainerDirection(challenge.description)}`}
          dir={getTextDirection(challenge.description)}
          style={{ unicodeBidi: 'plaintext' }}
        >
          {challenge.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="ltr">
            <Calendar className="w-4 h-4" />
            <span>Durée: {challenge.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="ltr">
            <Users className="w-4 h-4" />
            <span>Participants: {challenge.participants}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="ltr">
            <Trophy className="w-4 h-4" />
            <span>Prix: {challenge.price}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageVideos(challenge)}
            className="flex-1"
            dir="ltr"
          >
            <Video className="w-4 h-4 mr-2" />
            Capsules
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(challenge)}
            dir="ltr"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="ltr">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce challenge ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(challenge.id)} className="bg-destructive text-destructive-foreground">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
