import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Challenge {
  id: number;
  title: string;
}

interface SubPack {
  id: number;
  title: string;
  pack_id: number;
  pack_title?: string;
  status: string;
  video_count?: number;
}

interface ChallengeSubPacksModalProps {
  open: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const ChallengeSubPacksModal = ({ open, onClose, challenge }: ChallengeSubPacksModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [assignedSubPackIds, setAssignedSubPackIds] = useState<Set<number>>(new Set());
  const [selectedSubPackIds, setSelectedSubPackIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, challenge.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all sub-packs
      const subPacksResponse = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php');
      const subPacksData = await subPacksResponse.json();
      
      if (subPacksData.success && subPacksData.data) {
        const activeSubPacks = subPacksData.data.filter((sp: SubPack) => sp.status === 'active');
        
        // Get video count for each sub-pack
        const subPacksWithCount = await Promise.all(
          activeSubPacks.map(async (subPack: SubPack) => {
            try {
              const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPack.id}`);
              const videosData = await videosResponse.json();
              const videoCount = videosData.success && videosData.data ? 
                videosData.data.filter((v: any) => v.status === 'active').length : 0;
              
              return { ...subPack, video_count: videoCount };
            } catch {
              return { ...subPack, video_count: 0 };
            }
          })
        );
        
        setSubPacks(subPacksWithCount);
      }
      
      // Fetch currently assigned sub-packs for this challenge
      const assignedResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?challenge_id=${challenge.id}`);
      const assignedData = await assignedResponse.json();
      
      if (assignedData.success && assignedData.data) {
        const assigned = new Set<number>(assignedData.data.map((item: any) => Number(item.sub_pack_id)));
        setAssignedSubPackIds(assigned);
        setSelectedSubPackIds(new Set<number>(assigned));
      }
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubPackToggle = (subPackId: number) => {
    setSelectedSubPackIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subPackId)) {
        newSet.delete(subPackId);
      } else {
        newSet.add(subPackId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Determine sub-packs to add and remove
      const subPacksToAdd = Array.from(selectedSubPackIds).filter(id => !assignedSubPackIds.has(id));
      const subPacksToRemove = Array.from(assignedSubPackIds).filter(id => !selectedSubPackIds.has(id));
      
      // Add new sub-packs
      for (const subPackId of subPacksToAdd) {
        await fetch('https://spadadibattaglia.com/mom/api/pack_challenge_links.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge_id: challenge.id,
            sub_pack_id: subPackId
          })
        });
      }
      
      // Remove unselected sub-packs
      for (const subPackId of subPacksToRemove) {
        await fetch(`https://spadadibattaglia.com/mom/api/pack_challenge_links.php?challenge_id=${challenge.id}&sub_pack_id=${subPackId}`, {
          method: 'DELETE'
        });
      }
      
      toast({
        title: "Succès",
        description: "Les capsules ont été mises à jour avec succès"
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Group sub-packs by pack
  const groupedSubPacks = subPacks.reduce((acc, subPack) => {
    const packId = subPack.pack_id;
    if (!acc[packId]) {
      acc[packId] = {
        packTitle: subPack.pack_title || `Pack ${packId}`,
        subPacks: []
      };
    }
    acc[packId].subPacks.push(subPack);
    return acc;
  }, {} as {[key: number]: {packTitle: string, subPacks: SubPack[]}});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]" dir="ltr">
        <DialogHeader>
          <DialogTitle>
            Gérer les Capsules - <span dir="rtl">{challenge.title}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4" />
              <span>{selectedSubPackIds.size} capsule(s) sélectionnée(s)</span>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedSubPacks).map(([packId, group]) => (
                  <div key={packId} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground" dir="rtl">{group.packTitle}</h3>
                      <Badge variant="outline">
                        {group.subPacks.length} capsules
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {group.subPacks.map((subPack) => (
                        <div
                          key={subPack.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={`subpack-${subPack.id}`}
                            checked={selectedSubPackIds.has(subPack.id)}
                            onCheckedChange={() => handleSubPackToggle(subPack.id)}
                          />
                          <label
                            htmlFor={`subpack-${subPack.id}`}
                            className="flex-1 flex items-center gap-2 cursor-pointer"
                          >
                            <Package className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate" dir="rtl">
                                {subPack.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {subPack.video_count || 0} vidéos
                              </p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeSubPacksModal;
