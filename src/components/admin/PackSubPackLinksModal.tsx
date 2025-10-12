import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Briefcase, Trophy } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection } from "@/utils/textAlignment";

interface SubPack {
  id: number;
  title: string;
  description?: string;
  status: string;
}

interface Workshop {
  id: number;
  title: string;
  description?: string;
  status: string;
  duration?: string;
  price?: number;
}

interface Challenge {
  id: number;
  title: string;
  description?: string;
  status: string;
  duration?: string;
  difficulty?: string;
}

interface PackSubPackLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packId: number;
  packTitle: string;
}

const PackSubPackLinksModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  packId,
  packTitle 
}: PackSubPackLinksModalProps) => {
  const { toast } = useToast();
  const [allSubPacks, setAllSubPacks] = useState<SubPack[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [linkedSubPackIds, setLinkedSubPackIds] = useState<Set<number>>(new Set());
  const [linkedWorkshopIds, setLinkedWorkshopIds] = useState<Set<number>>(new Set());
  const [linkedChallengeIds, setLinkedChallengeIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("subpacks");

  useEffect(() => {
    if (isOpen && packId) {
      fetchData();
    }
  }, [isOpen, packId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all sub-packs
      const subPacksResponse = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php');
      const subPacksData = await subPacksResponse.json();
      if (subPacksData.success) {
        setAllSubPacks(subPacksData.data || []);
      }

      // Fetch all workshops
      const workshopsResponse = await fetch('https://spadadibattaglia.com/mom/api/workshops.php');
      const workshopsData = await workshopsResponse.json();
      if (workshopsData.success) {
        setAllWorkshops(workshopsData.workshops || []);
      }

      // Fetch all challenges
      const challengesResponse = await fetch('https://spadadibattaglia.com/mom/api/challenges.php');
      const challengesData = await challengesResponse.json();
      if (challengesData.success) {
        setAllChallenges(challengesData.data || []);
      }

      // Fetch linked sub-packs
      const subPackLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php?pack_id=${packId}`);
      const subPackLinksData = await subPackLinksResponse.json();
      if (subPackLinksData.success && subPackLinksData.data) {
        const linkedIds = new Set<number>(subPackLinksData.data.map((sp: any) => Number(sp.id)));
        setLinkedSubPackIds(linkedIds);
      }

      // Fetch linked workshops
      const workshopLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_workshop_links.php?pack_id=${packId}`);
      const workshopLinksData = await workshopLinksResponse.json();
      if (workshopLinksData.success && workshopLinksData.data) {
        const linkedIds = new Set<number>(workshopLinksData.data.map((w: any) => Number(w.id)));
        setLinkedWorkshopIds(linkedIds);
      }

      // Fetch linked challenges
      const challengeLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?pack_id=${packId}`);
      const challengeLinksData = await challengeLinksResponse.json();
      if (challengeLinksData.success && challengeLinksData.data) {
        const linkedIds = new Set<number>(challengeLinksData.data.map((c: any) => Number(c.id)));
        setLinkedChallengeIds(linkedIds);
      }
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubPack = (subPackId: number) => {
    setLinkedSubPackIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subPackId)) {
        newSet.delete(subPackId);
      } else {
        newSet.add(subPackId);
      }
      return newSet;
    });
  };

  const handleToggleWorkshop = (workshopId: number) => {
    setLinkedWorkshopIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workshopId)) {
        newSet.delete(workshopId);
      } else {
        newSet.add(workshopId);
      }
      return newSet;
    });
  };

  const handleToggleChallenge = (challengeId: number) => {
    setLinkedChallengeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(challengeId)) {
        newSet.delete(challengeId);
      } else {
        newSet.add(challengeId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save sub-pack links
      const currentSubPackLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php?pack_id=${packId}`);
      const currentSubPackLinksData = await currentSubPackLinksResponse.json();
      const currentSubPackIds = new Set<number>(
        currentSubPackLinksData.success ? currentSubPackLinksData.data.map((sp: any) => Number(sp.id)) : []
      );

      const subPacksToAdd = Array.from(linkedSubPackIds).filter((id: number) => !currentSubPackIds.has(id));
      const subPacksToRemove = Array.from(currentSubPackIds).filter((id: number) => !linkedSubPackIds.has(id));

      for (const subPackId of subPacksToAdd) {
        await fetch('https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack_id: packId, sub_pack_id: subPackId, order_index: 0 })
        });
      }

      for (const subPackId of subPacksToRemove) {
        await fetch('https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack_id: packId, sub_pack_id: subPackId })
        });
      }

      // Save workshop links
      const currentWorkshopLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_workshop_links.php?pack_id=${packId}`);
      const currentWorkshopLinksData = await currentWorkshopLinksResponse.json();
      const currentWorkshopIds = new Set<number>(
        currentWorkshopLinksData.success ? currentWorkshopLinksData.data.map((w: any) => Number(w.id)) : []
      );

      const workshopsToAdd = Array.from(linkedWorkshopIds).filter((id: number) => !currentWorkshopIds.has(id));
      const workshopsToRemove = Array.from(currentWorkshopIds).filter((id: number) => !linkedWorkshopIds.has(id));

      for (const workshopId of workshopsToAdd) {
        await fetch('https://spadadibattaglia.com/mom/api/pack_workshop_links.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack_id: packId, workshop_id: workshopId, order_index: 0 })
        });
      }

      for (const workshopId of workshopsToRemove) {
        await fetch(`https://spadadibattaglia.com/mom/api/pack_workshop_links.php?pack_id=${packId}&workshop_id=${workshopId}`, {
          method: 'DELETE'
        });
      }

      // Save challenge links
      const currentChallengeLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?pack_id=${packId}`);
      const currentChallengeLinksData = await currentChallengeLinksResponse.json();
      const currentChallengeIds = new Set<number>(
        currentChallengeLinksData.success ? currentChallengeLinksData.data.map((c: any) => Number(c.id)) : []
      );

      const challengesToAdd = Array.from(linkedChallengeIds).filter((id: number) => !currentChallengeIds.has(id));
      const challengesToRemove = Array.from(currentChallengeIds).filter((id: number) => !linkedChallengeIds.has(id));

      for (const challengeId of challengesToAdd) {
        await fetch('https://spadadibattaglia.com/mom/api/pack_challenge_links.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack_id: packId, challenge_id: challengeId, order_index: 0 })
        });
      }

      for (const challengeId of challengesToRemove) {
        await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?pack_id=${packId}&challenge_id=${challengeId}`, {
          method: 'DELETE'
        });
      }

      toast({
        title: "Liens mis à jour",
        description: "Les chapitres, ateliers et défis ont été liés au pack avec succès"
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving links:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour les liens",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderItems = (items: any[], type: 'subpack' | 'workshop' | 'challenge', linkedIds: Set<number>, toggleHandler: (id: number) => void) => {
    if (items.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          Aucun {type === 'subpack' ? 'chapitre' : type === 'workshop' ? 'atelier' : 'défi'} disponible.
        </p>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div 
            key={item.id}
            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <Checkbox
              id={`${type}-${item.id}`}
              checked={linkedIds.has(item.id)}
              onCheckedChange={() => toggleHandler(item.id)}
            />
            <label
              htmlFor={`${type}-${item.id}`}
              className="flex-1 cursor-pointer"
            >
              <div 
                className={`font-medium ${getTextAlignmentClasses(item.title)}`}
                dir={getTextDirection(item.title)}
                style={{ unicodeBidi: 'plaintext' }}
              >
                {item.title}
              </div>
              {item.description && (
                <div 
                  className={`text-sm text-muted-foreground mt-1 ${getTextAlignmentClasses(item.description)}`}
                  dir={getTextDirection(item.description)}
                  style={{ unicodeBidi: 'plaintext' }}
                >
                  {item.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                <span>Status: {item.status}</span>
                {item.duration && <span>• Durée: {item.duration}</span>}
                {item.difficulty && <span>• Difficulté: {item.difficulty}</span>}
              </div>
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            <span 
              className={getTextAlignmentClasses(packTitle)}
              dir={getTextDirection(packTitle)}
              style={{ unicodeBidi: 'plaintext' }}
            >
              Lier du contenu à: {packTitle}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="subpacks" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Chapitres
                  {linkedSubPackIds.size > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {linkedSubPackIds.size}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="workshops" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Ateliers
                  {linkedWorkshopIds.size > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {linkedWorkshopIds.size}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Défis
                  {linkedChallengeIds.size > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {linkedChallengeIds.size}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subpacks" className="mt-4">
                <p className="text-sm text-muted-foreground text-left mb-4" dir="ltr">
                  Sélectionnez les chapitres à associer à ce pack:
                </p>
                {renderItems(allSubPacks, 'subpack', linkedSubPackIds, handleToggleSubPack)}
              </TabsContent>

              <TabsContent value="workshops" className="mt-4">
                <p className="text-sm text-muted-foreground text-left mb-4" dir="ltr">
                  Sélectionnez les ateliers à associer à ce pack:
                </p>
                {renderItems(allWorkshops, 'workshop', linkedWorkshopIds, handleToggleWorkshop)}
              </TabsContent>

              <TabsContent value="challenges" className="mt-4">
                <p className="text-sm text-muted-foreground text-left mb-4" dir="ltr">
                  Sélectionnez les défis à associer à ce pack:
                </p>
                {renderItems(allChallenges, 'challenge', linkedChallengeIds, handleToggleChallenge)}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t" dir="ltr">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder tout
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackSubPackLinksModal;
