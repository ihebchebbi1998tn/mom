import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Package, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SubPackCard from "@/components/admin/SubPackCard";
import CreateSubPackModal from "@/components/admin/CreateSubPackModal";

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

interface PackInfo {
  id: number;
  title: string;
  image_url?: string;
}

const CapsulesManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [packInfo, setPackInfo] = useState<{[packId: number]: PackInfo}>({});
  const [subPackVideos, setSubPackVideos] = useState<{[subPackId: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubPack, setEditingSubPack] = useState<SubPack | null>(null);

  useEffect(() => {
    fetchAllSubPacks();
  }, []);

  const fetchAllSubPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php');
      const data = await response.json();
      
      if (data.success) {
        const allSubPacks = data.data || [];
        setSubPacks(allSubPacks);
        
        // Fetch pack info for each sub-pack
        const packIds = Array.from(new Set(allSubPacks.map((sp: SubPack) => sp.pack_id)));
        const packInfoData: {[packId: number]: PackInfo} = {};
        
        for (const packId of packIds) {
          try {
            const packResponse = await fetch(`https://spadadibattaglia.com/mom/api/course_packs.php?id=${packId}`);
            const packData = await packResponse.json();
            if (packData.success && packData.data) {
              packInfoData[packId as number] = packData.data as PackInfo;
            }
          } catch (error) {
            console.error(`Failed to fetch pack ${packId}:`, error);
          }
        }
        setPackInfo(packInfoData);
        
        // Fetch video counts for each sub-pack
        const videoCountsData: {[subPackId: number]: number} = {};
        for (const subPack of allSubPacks) {
          try {
            const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPack.id}`);
            const videosData = await videosResponse.json();
            videoCountsData[subPack.id] = videosData.success ? (videosData.data || []).length : 0;
          } catch (error) {
            console.error(`Failed to fetch videos for sub-pack ${subPack.id}:`, error);
            videoCountsData[subPack.id] = 0;
          }
        }
        setSubPackVideos(videoCountsData);
      }
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les capsules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubPack = async (subPackId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette capsule ?')) return;
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subPackId })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: "Capsule supprimée avec succès" });
        fetchAllSubPacks();
      } else {
        toast({
          title: "Erreur de suppression",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };

  const handleEditSubPack = (subPack: SubPack) => {
    setEditingSubPack(subPack);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingSubPack(null);
  };

  const handleSuccess = () => {
    fetchAllSubPacks();
  };

  const handleSubPackSelect = (subPack: SubPack) => {
    // Navigate back to admin with this sub-pack selected
    navigate(`/admin?tab=packs&subpack=${subPack.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent flex items-center justify-center" dir="ltr">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des capsules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent" dir="ltr">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              <span dir="ltr">Retour au tableau de bord</span>
            </Button>
            <h1 className="text-3xl font-bold text-foreground" dir="ltr">Les Capsules</h1>
          </div>
          <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            <span dir="ltr">Ajouter une nouvelle capsule</span>
          </Button>
        </div>

        {/* Capsules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subPacks.length === 0 ? (
            <div className="col-span-full text-center py-12" dir="ltr">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucune capsule disponible</p>
            </div>
          ) : (
            subPacks.map((subPack) => (
              <SubPackCard
                key={subPack.id}
                subPack={subPack}
                videoCount={subPackVideos[subPack.id] || 0}
                index={0}
                onSelect={handleSubPackSelect}
                onEdit={handleEditSubPack}
                onDelete={handleDeleteSubPack}
                packImage={packInfo[subPack.pack_id]?.image_url}
              />
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <CreateSubPackModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          packId={0}
          editingSubPack={editingSubPack}
        />
      </div>
    </div>
  );
};

export default CapsulesManagement;
