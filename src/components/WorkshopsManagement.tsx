import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Clock, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import WorkshopVideosManagement from "./WorkshopVideosManagement";
import AdminThumbnailUpload from "./admin/AdminThumbnailUpload";

interface Workshop {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  next_date: string;
  enrolled_count: number;
  max_participants: number;
  location: string;
  highlights: string[];
  price: number;
  image_url?: string;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const WorkshopsManagement = () => {
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showVideos, setShowVideos] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    type: 'Atelier de formation',
    next_date: '',
    location: '',
    highlights: [''],
    price: 0,
    image_url: '',
    max_participants: 50,
    status: 'active' as 'active' | 'inactive' | 'completed' | 'cancelled'
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshops.php');
      const data = await response.json();
      
      if (data.success && data.workshops) {
        setWorkshops(data.workshops);
      } else {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des ateliers",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const workshopData = {
      ...formData,
      highlights: formData.highlights.filter(h => h.trim() !== '')
    };

    try {
      const url = 'https://spadadibattaglia.com/mom/api/workshops.php';
      const method = editingWorkshop ? 'PUT' : 'POST';
      const body = editingWorkshop ? { ...workshopData, id: editingWorkshop.id } : workshopData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: editingWorkshop ? "Mise à jour réussie" : "Création réussie",
          description: editingWorkshop ? "L'atelier a été mis à jour avec succès" : "L'atelier a été créé avec succès",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchWorkshops();
      } else {
        toast({
          title: "Erreur de traitement",
          description: data.message || "Impossible de sauvegarder l'atelier",
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

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet atelier ?')) return;
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshops.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Suppression réussie",
          description: "L'atelier a été supprimé avec succès",
        });
        fetchWorkshops();
      } else {
        toast({
          title: "Erreur de suppression",
          description: data.message || "Impossible de supprimer l'atelier",
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

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      duration: workshop.duration,
      type: workshop.type,
      next_date: workshop.next_date,
      location: workshop.location,
      highlights: workshop.highlights || [''],
      price: workshop.price,
      image_url: workshop.image_url || '',
      max_participants: workshop.max_participants,
      status: workshop.status
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingWorkshop(null);
    setFormData({
      title: '',
      description: '',
      duration: '',
      type: 'Atelier de formation',
      next_date: '',
      location: '',
      highlights: [''],
      price: 0,
      image_url: '',
      max_participants: 50,
      status: 'active'
    });
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Actif", variant: "default" as const },
      inactive: { label: "Inactif", variant: "secondary" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (showVideos && selectedWorkshop) {
    return (
      <WorkshopVideosManagement 
        workshop={selectedWorkshop}
        onBack={() => {
          setShowVideos(false);
          setSelectedWorkshop(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Ateliers</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-hero" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ajouter un Nouvel Atelier</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="ltr">
            <DialogHeader>
              <DialogTitle className="text-left">
                {editingWorkshop ? "Modifier l'Atelier" : "Ajouter un Nouvel Atelier"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre de l'Atelier *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de l'atelier"
                    className={getTextAlignmentClasses(formData.title)}
                    dir={getTextDirection(formData.title)}
                    style={{ unicodeBidi: 'plaintext' }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type d'Atelier</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                      <SelectItem value="Atelier de formation">Atelier de formation</SelectItem>
                      <SelectItem value="Atelier intensif">Atelier intensif</SelectItem>
                      <SelectItem value="Atelier complet">Atelier complet</SelectItem>
                      <SelectItem value="Atelier interactif">Atelier interactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description de l'Atelier *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description détaillée de l'atelier"
                  className={getTextAlignmentClasses(formData.description)}
                  dir={getTextDirection(formData.description)}
                  style={{ unicodeBidi: 'plaintext' }}
                  required
                />
              </div>

              <div>
                <Label>Image de l'Atelier</Label>
                <AdminThumbnailUpload
                  currentThumbnail={formData.image_url}
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  onUploadStart={() => {}}
                  disabled={false}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Durée *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Ex: 3 jours consécutifs"
                    className={getTextAlignmentClasses(formData.duration)}
                    dir={getTextDirection(formData.duration)}
                    style={{ unicodeBidi: 'plaintext' }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="next_date">Prochaine Date *</Label>
                  <Input
                    id="next_date"
                    type="date"
                    value={formData.next_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Lieu *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Lieu de l'atelier"
                  className={getTextAlignmentClasses(formData.location)}
                  dir={getTextDirection(formData.location)}
                  style={{ unicodeBidi: 'plaintext' }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Prix (TND)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="299"
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Nombre Maximum de Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: Number(e.target.value) }))}
                    placeholder="50"
                  />
                </div>
              </div>

              {editingWorkshop && (
                <div>
                  <Label htmlFor="status">Statut de l'Atelier</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Points Forts</Label>
                <div className="space-y-2">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        placeholder="Point fort de l'atelier"
                        className={getTextAlignmentClasses(highlight)}
                        dir={getTextDirection(highlight)}
                        style={{ unicodeBidi: 'plaintext' }}
                      />
                      {formData.highlights.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeHighlight(index)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                    Ajouter un Point
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="btn-hero flex-1">
                  {editingWorkshop ? "Mettre à Jour l'Atelier" : "Créer l'Atelier"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Chargement des ateliers...</p>
            </div>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun atelier enregistré</p>
          </div>
        ) : (
          workshops.map((workshop) => (
            <Card key={workshop.id} className="card-elegant p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-bold text-foreground text-lg ${getTextAlignmentClasses(workshop.title)}`} 
                        dir={getTextDirection(workshop.title)} 
                        style={{ unicodeBidi: 'plaintext' }}>
                      {workshop.title}
                    </h3>
                    {getStatusBadge(workshop.status)}
                    
                  </div>
                  <p className={`text-muted-foreground mb-3 ${getTextAlignmentClasses(workshop.description)}`} 
                     dir={getTextDirection(workshop.description)} 
                     style={{ unicodeBidi: 'plaintext' }}>
                    {workshop.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-left" dir="ltr">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className={getTextAlignmentClasses(workshop.duration)} 
                            dir={getTextDirection(workshop.duration)} 
                            style={{unicodeBidi: 'plaintext'}}>
                        {workshop.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDate(workshop.next_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className={getTextAlignmentClasses(workshop.location)} 
                            dir={getTextDirection(workshop.location)} 
                            style={{unicodeBidi: 'plaintext'}}>
                        {workshop.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{workshop.enrolled_count}/{workshop.max_participants}</span>
                    </div>
                  </div>
                  {workshop.highlights && workshop.highlights.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-foreground mb-1">Points Forts:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {workshop.highlights.map((highlight, index) => (
                          <li key={index} 
                              className={getTextAlignmentClasses(highlight)} 
                              dir={getTextDirection(highlight)} 
                              style={{unicodeBidi: 'plaintext'}}>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {workshop.price > 0 && (
                    <div className="mt-2">
                      <span className="text-lg font-bold text-primary">{workshop.price} TND</span>
                    </div>
                  )}
                </div>
                <div className="flex lg:flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => {
                      setSelectedWorkshop(workshop);
                      setShowVideos(true);
                    }}
                    title="Voir les vidéos"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(workshop)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(workshop.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkshopsManagement;