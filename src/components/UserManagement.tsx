import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client',
    status: 'active',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/users.php');
      const data = await response.json();
      
      console.log('Users API Response:', data); // Debug log to check phone field
      
      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        toast({
          title: "Erreur de chargement des utilisateurs",
          description: "Impossible de charger la liste des utilisateurs",
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
    
    try {
      const url = 'https://spadadibattaglia.com/mom/api/users.php';
      const method = editingUser ? 'PUT' : 'POST';
      
      // Prepare body based on operation type
      let body: any;
      if (editingUser) {
        // For updates, include password only if provided
        body = {
          id: editingUser.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.status
        };
        
        // Include password only if it's provided
        if (formData.password && formData.password.trim()) {
          body.password = formData.password;
        }
      } else {
        // For new users, include all fields including password
        body = formData;
      }

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
          title: editingUser ? "Mise à jour réussie" : "Création réussie",
          description: editingUser ? "Utilisateur mis à jour avec succès" : "Utilisateur créé avec succès",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchUsers();
      } else {
        toast({
          title: "Erreur d'opération",
          description: data.message || "Impossible de sauvegarder l'utilisateur",
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

  const handleDelete = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/users.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Suppression réussie",
          description: "Utilisateur supprimé avec succès",
        });
        fetchUsers();
      } else {
        toast({
          title: "Erreur de suppression",
          description: data.message || "Impossible de supprimer l'utilisateur",
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'client',
      status: 'active',
      password: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Liste des Utilisateurs</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm(); // Reset form when dialog closes
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="btn-hero w-full sm:w-auto" 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 ml-2" />
              <span>Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="ltr">
            <DialogHeader>
              <DialogTitle className="text-left">
                {editingUser ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom de l'utilisateur"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33xxxxxxxxx"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Mot de passe {editingUser ? "(laisser vide pour conserver l'ancien)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUser ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                  required={!editingUser}
                  minLength={editingUser ? 0 : 6}
                />
                {!editingUser && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="btn-hero flex-1">
                  {editingUser ? "Mettre à jour l'utilisateur" : "Créer l'utilisateur"}
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
              <p className="text-muted-foreground">Chargement des utilisateurs...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun utilisateur enregistré</p>
          </div>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="card-elegant p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-base sm:text-lg text-left break-words" dir="ltr">
                      {user.name}
                    </h3>
                    <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                      {user.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.role === "admin" ? "Admin" : "Membre"}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm text-muted-foreground text-left" dir="ltr">
                    <div className="break-words"><span className="font-medium">Email:</span> {user.email}</div>
                    <div><span className="font-medium">Tél:</span> {user.phone || "Non spécifié"}</div>
                    <div><span className="font-medium">Inscrit:</span> {formatDate(user.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Voir</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)} className="flex-1">
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Modifier</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 flex-1"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Supprimer</span>
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

export default UserManagement;