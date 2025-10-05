import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection } from "@/utils/textAlignment";

interface SubPack {
  id: number;
  title: string;
  description?: string;
  status: string;
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
  const [linkedSubPackIds, setLinkedSubPackIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

      // Fetch currently linked sub-packs for this pack
      const linksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php?pack_id=${packId}`);
      const linksData = await linksResponse.json();
      
      console.log('Linked sub-packs API response:', linksData);
      
      if (linksData.success && linksData.data) {
        const linkedIds = new Set<number>(linksData.data.map((sp: any) => {
          console.log('Sub-pack from API:', sp);
          return Number(sp.id);
        }));
        console.log('Linked sub-pack IDs:', Array.from(linkedIds));
        setLinkedSubPackIds(linkedIds);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get current links from server
      const currentLinksResponse = await fetch(`https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php?pack_id=${packId}`);
      const currentLinksData = await currentLinksResponse.json();
      
      if (!currentLinksResponse.ok) {
        throw new Error(`API returned ${currentLinksResponse.status}: ${currentLinksData.message || 'Server error'}`);
      }
      
      const currentLinkedIds = new Set<number>(
        currentLinksData.success ? currentLinksData.data.map((sp: any) => Number(sp.id)) : []
      );

      // Determine which links to add and which to remove
      const toAdd = Array.from(linkedSubPackIds).filter((id: number) => !currentLinkedIds.has(id));
      const toRemove = Array.from(currentLinkedIds).filter((id: number) => !linkedSubPackIds.has(id));

      // Add new links
      for (const subPackId of toAdd) {
        const response = await fetch('https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pack_id: packId,
            sub_pack_id: subPackId,
            order_index: 0
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to add link: ${errorData.message || 'Server error'}`);
        }
      }

      // Remove old links
      for (const subPackId of toRemove) {
        const response = await fetch('https://spadadibattaglia.com/mom/api/pack_sub_pack_links.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pack_id: packId,
            sub_pack_id: subPackId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to remove link: ${errorData.message || 'Server error'}`);
        }
      }

      toast({
        title: "Liens mis à jour",
        description: "Les chapitres ont été liés au pack avec succès"
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving links:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour les liens. Vérifiez que la base de données est accessible.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            <span 
              className={getTextAlignmentClasses(packTitle)}
              dir={getTextDirection(packTitle)}
              style={{ unicodeBidi: 'plaintext' }}
            >
              Lier des chapitres à: {packTitle}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-left" dir="ltr">
              Sélectionnez les chapitres que vous souhaitez associer à ce pack:
            </p>
            
            {allSubPacks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun chapitre disponible. Créez d'abord des chapitres.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allSubPacks.map((subPack) => (
                  <div 
                    key={subPack.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={`subpack-${subPack.id}`}
                      checked={linkedSubPackIds.has(subPack.id)}
                      onCheckedChange={() => handleToggleSubPack(subPack.id)}
                    />
                    <label
                      htmlFor={`subpack-${subPack.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div 
                        className={`font-medium ${getTextAlignmentClasses(subPack.title)}`}
                        dir={getTextDirection(subPack.title)}
                        style={{ unicodeBidi: 'plaintext' }}
                      >
                        {subPack.title}
                      </div>
                      {subPack.description && (
                        <div 
                          className={`text-sm text-muted-foreground mt-1 ${getTextAlignmentClasses(subPack.description)}`}
                          dir={getTextDirection(subPack.description)}
                          style={{ unicodeBidi: 'plaintext' }}
                        >
                          {subPack.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Status: {subPack.status}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4" dir="ltr">
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

export default PackSubPackLinksModal;
