import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "../ImageUpload";
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

interface CreatePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPack?: CoursePack | null;
}

const CreatePackModal = ({ isOpen, onClose, onSuccess, editingPack }: CreatePackModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [packForm, setPackForm] = useState({
    title: editingPack?.title || "",
    modules: editingPack?.modules || "",
    price: editingPack?.price || "",
    duration: editingPack?.duration || "",
    students: editingPack?.students || "0+",
    rating: editingPack?.rating || 5.0,
    image_url: editingPack?.image_url || "",
    description: editingPack?.description || "",
    status: editingPack?.status || "active"
  });

  // Update form when editingPack changes to ensure all current information is loaded
  useEffect(() => {
    if (editingPack) {
      setPackForm({
        title: editingPack.title || "",
        modules: editingPack.modules || "",
        price: editingPack.price || "",
        duration: editingPack.duration || "",
        students: editingPack.students || "0+",
        rating: editingPack.rating || 5.0,
        image_url: editingPack.image_url || "",
        description: editingPack.description || "",
        status: editingPack.status || "active"
      });
    } else {
      // Reset form for new pack creation
      setPackForm({
        title: "",
        modules: "",
        price: "",
        duration: "",
        students: "0+",
        rating: 5.0,
        image_url: "",
        description: "",
        status: "active"
      });
    }
  }, [editingPack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = 'https://spadadibattaglia.com/mom/api/course_packs.php';
      const method = editingPack ? 'PUT' : 'POST';
      const body = editingPack ? 
        { ...packForm, id: editingPack.id } : 
        packForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({ 
          title: editingPack ? "Pack mis à jour avec succès" : "Pack créé avec succès" 
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: editingPack ? "Erreur de mise à jour du pack" : "Erreur de création du pack",
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
    setPackForm({
      title: "",
      modules: "",
      price: "",
      duration: "",
      students: "0+",
      rating: 5.0,
      image_url: "",
      description: "",
      status: "active"
    });
  };

  const handleClose = () => {
    onClose();
    if (!editingPack) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-left">
            {editingPack ? "Mettre à jour le pack éducatif" : "Ajouter un nouveau pack éducatif"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du pack</Label>
            <Input
              id="title"
              value={packForm.title}
              onChange={(e) => setPackForm({...packForm, title: e.target.value})}
              required
              className={getTextAlignmentClasses(packForm.title)}
              dir={getTextDirection(packForm.title)}
              style={{ unicodeBidi: 'plaintext' }}
            />
            </div>
            <div>
              <Label htmlFor="price">Prix</Label>
              <Input
                id="price"
                value={packForm.price}
                onChange={(e) => setPackForm({...packForm, price: e.target.value})}
                required
                className={getTextAlignmentClasses(packForm.price)}
                dir={getTextDirection(packForm.price)}
                style={{ unicodeBidi: 'plaintext' }}
              />
            </div>
            <div>
              <Label htmlFor="duration">Durée</Label>
              <Input
                id="duration"
                value={packForm.duration}
                onChange={(e) => setPackForm({...packForm, duration: e.target.value})}
                required
                className={getTextAlignmentClasses(packForm.duration)}
                dir={getTextDirection(packForm.duration)}
                style={{ unicodeBidi: 'plaintext' }}
              />
            </div>
            <div>
              <Label htmlFor="students">Nombre d'étudiants</Label>
              <Input
                id="students"
                value={packForm.students}
                onChange={(e) => setPackForm({...packForm, students: e.target.value})}
                className={getTextAlignmentClasses(packForm.students)}
                dir={getTextDirection(packForm.students)}
                style={{ unicodeBidi: 'plaintext' }}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="modules">Modules (séparés par des virgules)</Label>
            <Input
              id="modules"
              value={packForm.modules}
              onChange={(e) => setPackForm({...packForm, modules: e.target.value})}
              placeholder="Gestion de la colère,Étude,Défis de la vie"
              required
              className={getTextAlignmentClasses(packForm.modules)}
              dir={getTextDirection(packForm.modules)}
              style={{ unicodeBidi: 'plaintext' }}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={packForm.description}
              onChange={(e) => setPackForm({...packForm, description: e.target.value})}
              className={getTextAlignmentClasses(packForm.description)}
              dir={getTextDirection(packForm.description)}
              style={{ unicodeBidi: 'plaintext' }}
            />
          </div>
          
          <div>
            <Label htmlFor="image_url">Image du pack</Label>
            <ImageUpload
              onUploadComplete={(imageUrl) => setPackForm({...packForm, image_url: imageUrl})}
              currentImage={packForm.image_url}
              disabled={imageUploading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Ou vous pouvez saisir le lien de l'image directement :
            </p>
            <Input
              id="image_url"
              value={packForm.image_url}
              onChange={(e) => setPackForm({...packForm, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="btn-hero" disabled={loading}>
              {loading ? "Sauvegarde en cours..." : (editingPack ? "Mettre à jour le pack" : "Créer le pack")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackModal;