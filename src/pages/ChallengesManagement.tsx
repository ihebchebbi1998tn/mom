import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import ChallengeCard from "@/components/admin/ChallengeCard";
import CreateChallengeModal from "@/components/admin/CreateChallengeModal";
import ChallengeSubPacksModal from "@/components/admin/ChallengeSubPacksModal";
import ChallengeVideosModal from "@/components/admin/ChallengeVideosModal";

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

const ChallengesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubPacksModalOpen, setIsSubPacksModalOpen] = useState(false);
  const [isVideosModalOpen, setIsVideosModalOpen] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://spadadibattaglia.com/mom/api/challenges.php');
      const data = await response.json();
      
      if (data.success && data.challenges) {
        setChallenges(data.challenges);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = () => {
    setSelectedChallenge(null);
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleDeleteChallenge = async (challengeId: number) => {
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/challenges.php?id=${challengeId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: "Challenge supprimé avec succès"
        });
        fetchChallenges();
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le challenge",
        variant: "destructive"
      });
    }
  };

  const handleManageVideos = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsVideosModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedChallenge(null);
    setIsEditMode(false);
    fetchChallenges();
  };

  const handleVideosModalClose = () => {
    setIsVideosModalOpen(false);
    setSelectedChallenge(null);
  };

  const handleSubPacksModalClose = () => {
    setIsSubPacksModalOpen(false);
    setSelectedChallenge(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent" dir="ltr">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestion des Challenges</h1>
                <p className="text-sm text-muted-foreground">Gérer les challenges et leurs capsules</p>
              </div>
            </div>
            <Button 
              onClick={handleCreateChallenge}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Challenge
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des challenges...</p>
            </div>
          </div>
        ) : challenges.length === 0 ? (
          <Card className="card-elegant p-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Aucun challenge disponible</p>
              <Button onClick={handleCreateChallenge}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier challenge
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
                onManageVideos={handleManageVideos}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateChallengeModal
        open={isCreateModalOpen}
        onClose={handleModalClose}
        challenge={isEditMode ? selectedChallenge : null}
        isEditMode={isEditMode}
      />

      {selectedChallenge && (
        <>
          <ChallengeSubPacksModal
            open={isSubPacksModalOpen}
            onClose={handleSubPacksModalClose}
            challenge={selectedChallenge}
          />
          <ChallengeVideosModal
            open={isVideosModalOpen}
            onClose={handleVideosModalClose}
            challenge={selectedChallenge}
          />
        </>
      )}
    </div>
  );
};

export default ChallengesManagement;
