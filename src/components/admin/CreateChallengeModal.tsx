import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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

interface CreateChallengeModalProps {
  open: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  isEditMode: boolean;
}

const CreateChallengeModal = ({ open, onClose, challenge, isEditMode }: CreateChallengeModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    difficulty: 'متوسط' as 'سهل' | 'متوسط' | 'صعب',
    participants: 0,
    reward: '',
    status: 'upcoming' as 'active' | 'upcoming' | 'completed',
    start_date: '',
    end_date: '',
    price: ''
  });

  useEffect(() => {
    if (challenge && isEditMode) {
      setFormData({
        title: challenge.title,
        description: challenge.description,
        duration: challenge.duration,
        difficulty: challenge.difficulty,
        participants: challenge.participants,
        reward: challenge.reward,
        status: challenge.status,
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        price: challenge.price
      });
    } else {
      setFormData({
        title: '',
        description: '',
        duration: '',
        difficulty: 'متوسط',
        participants: 0,
        reward: '',
        status: 'upcoming',
        start_date: '',
        end_date: '',
        price: ''
      });
    }
  }, [challenge, isEditMode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = 'https://spadadibattaglia.com/mom/api/challenges.php';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = isEditMode ? { ...formData, id: challenge?.id } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: isEditMode ? "Challenge mis à jour avec succès" : "Challenge créé avec succès"
        });
        onClose();
      } else {
        throw new Error(data.message || 'Failed to save challenge');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le challenge",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="ltr">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifier le Challenge" : "Nouveau Challenge"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Durée</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="ex: 30 jours"
                required
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'سهل' | 'متوسط' | 'صعب') => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سهل">سهل (Facile)</SelectItem>
                  <SelectItem value="متوسط">متوسط (Moyen)</SelectItem>
                  <SelectItem value="صعب">صعب (Difficile)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'upcoming' | 'completed') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                type="number"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="ex: 50 DT"
                required
              />
            </div>

            <div>
              <Label htmlFor="reward">Récompense</Label>
              <Input
                id="reward"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="ex: Certificat"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;
