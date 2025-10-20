import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Unlock, Search, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface SpecialAccess {
  id: number;
  user_id: number;
  sub_pack_id: number;
  user_name: string;
  user_email: string;
  granted_by_name: string;
  granted_at: string;
  notes: string;
}

const RESTRICTED_SUB_PACKS = [
  { id: 6, title: "ورشة نزع الحفاض" },
  { id: 7, title: "سنة أولى أمومة" },
  { id: 8, title: "دورة التربية الجنسية" }
];

const SpecialAccessManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedSubPack, setSelectedSubPack] = useState<number>(6);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [grantedAccess, setGrantedAccess] = useState<SpecialAccess[]>([]);
  const [loadingGranted, setLoadingGranted] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchGrantedAccess();
  }, [selectedSubPack]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/special_access.php', {
        headers: {
          'X-Admin-Id': user?.id?.toString() || ''
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    }
  };

  const fetchGrantedAccess = async () => {
    try {
      setLoadingGranted(true);
      const response = await fetch(
        `https://spadadibattaglia.com/mom/api/special_access.php?sub_pack_id=${selectedSubPack}`,
        {
          headers: {
            'X-Admin-Id': user?.id?.toString() || ''
          }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setGrantedAccess(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching granted access:", error);
    } finally {
      setLoadingGranted(false);
    }
  };

  const handleGrantAccess = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un utilisateur",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://spadadibattaglia.com/mom/api/special_access.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user?.id?.toString() || ''
        },
        body: JSON.stringify({
          user_ids: selectedUsers,
          sub_pack_id: selectedSubPack,
          notes: notes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: `Accès débloqué pour ${data.granted_count} utilisateur(s)`
        });
        setSelectedUsers([]);
        setNotes("");
        fetchGrantedAccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de débloquer l'accès",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: number) => {
    try {
      const response = await fetch(
        `https://spadadibattaglia.com/mom/api/special_access.php?user_id=${userId}&sub_pack_id=${selectedSubPack}`,
        {
          method: 'DELETE',
          headers: {
            'X-Admin-Id': user?.id?.toString() || ''
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: "Accès révoqué"
        });
        fetchGrantedAccess();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer l'accès",
        variant: "destructive"
      });
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent" dir="rtl">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="btn-outline"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Accès Spéciaux</h1>
              <p className="text-sm text-muted-foreground">Débloquer l'accès aux capsules restreintes (6, 7, 8)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Grant Access Panel */}
          <Card className="card-elegant p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Débloquer l'Accès</h2>
            </div>

            {/* Sub-pack Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Capsule Restreinte</label>
              <Select
                value={selectedSubPack.toString()}
                onValueChange={(value) => setSelectedSubPack(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESTRICTED_SUB_PACKS.map(sp => (
                    <SelectItem key={sp.id} value={sp.id.toString()}>
                      {sp.title} (ID: {sp.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="mb-6 max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</p>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => toggleUserSelection(u.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(u.id)}
                      onCheckedChange={() => toggleUserSelection(u.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Notes (optionnel)</label>
              <Textarea
                placeholder="Raison du déblocage..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Button */}
            <Button
              onClick={handleGrantAccess}
              disabled={loading || selectedUsers.length === 0}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Déblocage en cours...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Débloquer l'Accès ({selectedUsers.length} sélectionné(s))
                </>
              )}
            </Button>
          </Card>

          {/* Currently Granted Access Panel */}
          <Card className="card-elegant p-6">
            <div className="flex items-center gap-3 mb-6">
              <Unlock className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold">Accès Débloqués</h2>
            </div>

            {loadingGranted ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : grantedAccess.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Aucun accès débloqué pour cette capsule
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {grantedAccess.map(access => (
                  <div
                    key={access.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{access.user_name}</p>
                        <p className="text-sm text-muted-foreground">{access.user_email}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Débloqué par: {access.granted_by_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Le: {new Date(access.granted_at).toLocaleDateString('fr-FR')}
                        </p>
                        {access.notes && (
                          <p className="text-sm mt-2 text-muted-foreground italic">
                            {access.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeAccess(access.user_id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpecialAccessManagement;
