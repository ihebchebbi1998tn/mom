import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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

interface CreateSubPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packId: number;
  editingSubPack?: SubPack | null;
}

const CreateSubPackModal = ({ isOpen, onClose, onSuccess, packId, editingSubPack }: CreateSubPackModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [subPackForm, setSubPackForm] = useState({
    title: editingSubPack?.title || "",
    description: editingSubPack?.description || "",
    banner_image_url: editingSubPack?.banner_image_url || "",
    intro_video_url: editingSubPack?.intro_video_url || "",
    order_index: editingSubPack?.order_index || 0,
    status: editingSubPack?.status || "active"
  });

  // Update form when editingSubPack changes to ensure all current information is loaded
  useEffect(() => {
    if (editingSubPack) {
      setSubPackForm({
        title: editingSubPack.title || "",
        description: editingSubPack.description || "",
        banner_image_url: editingSubPack.banner_image_url || "",
        intro_video_url: editingSubPack.intro_video_url || "",
        order_index: editingSubPack.order_index || 0,
        status: editingSubPack.status || "active"
      });
    } else {
      // Reset form for new sub-pack creation
      setSubPackForm({
        title: "",
        description: "",
        banner_image_url: "",
        intro_video_url: "",
        order_index: 0,
        status: "active"
      });
    }
  }, [editingSubPack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = 'https://spadadibattaglia.com/mom/api/sub_packs.php';
      const method = editingSubPack ? 'PUT' : 'POST';
      const body = editingSubPack ? 
        { ...subPackForm, id: editingSubPack.id } : 
        { ...subPackForm, pack_id: packId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({ 
          title: editingSubPack ? "Section mise à jour avec succès" : "Section créée avec succès" 
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: editingSubPack ? "Erreur de mise à jour de la section" : "Erreur de création de la section",
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
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubPackForm({
      title: "",
      description: "",
      banner_image_url: "",
      intro_video_url: "",
      order_index: 0,
      status: "active"
    });
  };

  const handleClose = () => {
    onClose();
    if (!editingSubPack) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-left">
            {editingSubPack ? "Mettre à jour la section" : "Ajouter une nouvelle section"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
          <div>
            <Label htmlFor="title">Titre de la section</Label>
              <Input
                id="title"
                value={subPackForm.title}
                onChange={(e) => setSubPackForm({...subPackForm, title: e.target.value})}
                required
                className={getTextAlignmentClasses(subPackForm.title)}
                dir={getTextDirection(subPackForm.title)}
                style={{ unicodeBidi: 'plaintext' }}
              />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={subPackForm.description}
                onChange={(e) => setSubPackForm({...subPackForm, description: e.target.value})}
                className={getTextAlignmentClasses(subPackForm.description)}
                dir={getTextDirection(subPackForm.description)}
                style={{ unicodeBidi: 'plaintext' }}
              />
          </div>
          
          <div>
            <Label htmlFor="banner_image_url">URL de l'image bannière</Label>
            <Input
              id="banner_image_url"
              value={subPackForm.banner_image_url}
              onChange={(e) => setSubPackForm({...subPackForm, banner_image_url: e.target.value})}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div>
            <Label htmlFor="intro_video_url">URL de la vidéo d'introduction</Label>
            <Input
              id="intro_video_url"
              value={subPackForm.intro_video_url}
              onChange={(e) => setSubPackForm({...subPackForm, intro_video_url: e.target.value})}
              placeholder="https://example.com/video.mp4"
            />
          </div>
          
          <div>
            <Label htmlFor="order_index">Ordre d'affichage</Label>
            <Input
              id="order_index"
              type="number"
              value={subPackForm.order_index}
              onChange={(e) => setSubPackForm({...subPackForm, order_index: parseInt(e.target.value) || 0})}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="btn-hero" disabled={loading}>
              {loading ? "Sauvegarde en cours..." : (editingSubPack ? "Mettre à jour la section" : "Créer la section")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubPackModal;