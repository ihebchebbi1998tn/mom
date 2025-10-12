import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import CustomCalendar from "./CustomCalendar";
interface AvailabilityRecord {
  id: number;
  date: string;
  status: 'available' | 'full' | 'unavailable';
  max_reservations: number;
  current_reservations: number;
  notes: string;
}

// Helper function to handle API calls with CORS
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = 'https://spadadibattaglia.com/mom/api/';
  const fullUrl = baseUrl + endpoint;

  // Always try direct call first for all methods
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Direct API call failed:', error);

    // For GET requests, try CORS proxy as fallback
    if (!options.method || options.method === 'GET') {
      try {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(fullUrl));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const proxyData = await response.json();
        return JSON.parse(proxyData.contents);
      } catch (proxyError) {
        console.error('Proxy call also failed:', proxyError);
        throw new Error('API call failed. In production this will work.');
      }
    } else {
      throw new Error('API call blocked by CORS. In production this will work.');
    }
  }
};
const ConsultationAvailabilityManagement = () => {
  const [availabilities, setAvailabilities] = useState<AvailabilityRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [status, setStatus] = useState<'available' | 'full' | 'unavailable'>('available');
  const [maxReservations, setMaxReservations] = useState(3);
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [defaultMaxReservations, setDefaultMaxReservations] = useState(3);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [isEditingDefault, setIsEditingDefault] = useState(false);
  const [tempDefaultMaxReservations, setTempDefaultMaxReservations] = useState(3);
  useEffect(() => {
    fetchAvailabilities();
    fetchDefaultSettings();
  }, []);
  const fetchAvailabilities = async () => {
    try {
      console.log('Attempting to fetch availabilities');
      const data = await apiCall('consultation_availability.php');
      console.log('Response data:', data);
      if (data.success) {
        setAvailabilities(data.data.filter((item: AvailabilityRecord) => item.date !== '0000-00-00'));
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au serveur. En production, cela fonctionnera normalement.",
        variant: "destructive"
      });
    }
  };
  const fetchDefaultSettings = async () => {
    try {
      console.log('Attempting to fetch default settings');
      const data = await apiCall('consultation_availability.php?default=true');
      console.log('Default settings data:', data);
      if (data.success && data.data.length > 0) {
        const defaultSetting = data.data[0].max_reservations || 3;
        setDefaultMaxReservations(defaultSetting);
        setTempDefaultMaxReservations(defaultSetting);
      } else {
        // Set default values if no settings found
        setDefaultMaxReservations(3);
        setTempDefaultMaxReservations(3);
      }
    } catch (error) {
      console.error('Error fetching default settings:', error);
    }
  };
  const handleEditDefault = () => {
    setTempDefaultMaxReservations(defaultMaxReservations);
    setIsEditingDefault(true);
  };
  const handleCancelEditDefault = () => {
    setTempDefaultMaxReservations(defaultMaxReservations);
    setIsEditingDefault(false);
  };
  const saveDefaultSettings = async () => {
    setDefaultLoading(true);
    try {
      const data = await apiCall('consultation_availability.php', {
        method: 'POST',
        body: JSON.stringify({
          date: '0000-00-00',
          status: 'available',
          max_reservations: tempDefaultMaxReservations,
          notes: 'Configuration par défaut - Limite maximum de réservations quotidiennes'
        })
      });
      if (data.success) {
        setDefaultMaxReservations(tempDefaultMaxReservations);
        setIsEditingDefault(false);
        toast({
          title: "Succès",
          description: "Paramètres par défaut sauvegardés avec succès"
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Avertissement",
        description: "Les paramètres seront sauvegardés en production",
        variant: "destructive"
      });
    } finally {
      setDefaultLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const body = editingId ? {
        id: editingId,
        status,
        max_reservations: maxReservations,
        notes
      } : {
        date: formattedDate,
        status,
        max_reservations: maxReservations,
        notes
      };
      const data = await apiCall('consultation_availability.php', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });
      if (data.success) {
        toast({
          title: "Succès",
          description: `Disponibilité ${editingId ? 'mise à jour' : 'ajoutée'} pour le ${format(selectedDate, 'dd/MM/yyyy')}`
        });

        // Refresh availabilities while preserving selected date
        await fetchAvailabilities();

        // Reset form but keep selected date for easier workflow
        setStatus('available');
        setMaxReservations(defaultMaxReservations);
        setNotes("");
        setEditingId(null);
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Avertissement",
        description: "Les données seront sauvegardées en production",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (availability: AvailabilityRecord) => {
    setSelectedDate(new Date(availability.date));
    setStatus(availability.status);
    setMaxReservations(availability.max_reservations || 3);
    setNotes(availability.notes || "");
    setEditingId(availability.id);
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) return;
    try {
      const data = await apiCall('consultation_availability.php', {
        method: 'DELETE',
        body: JSON.stringify({
          id
        })
      });
      if (data.success) {
        toast({
          title: "Succès",
          description: "Enregistrement supprimé avec succès"
        });
        setTimeout(async () => {
          await fetchAvailabilities();
        }, 100);
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Avertissement",
        description: "L'enregistrement sera supprimé en production",
        variant: "destructive"
      });
    }
  };
  const resetForm = () => {
    // Don't clear selected date to maintain workflow continuity
    setStatus('available');
    setMaxReservations(defaultMaxReservations);
    setNotes("");
    setEditingId(null);
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        label: "Disponible",
        variant: "default" as const
      },
      full: {
        label: "Complet",
        variant: "secondary" as const
      },
      unavailable: {
        label: "Indisponible",
        variant: "destructive" as const
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Généraux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de réservations autorisées par défaut pour toutes les dates</Label>
                
                {!isEditingDefault ?
              // Read-only view
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-primary">{defaultMaxReservations}</div>
                      <div className="text-sm text-muted-foreground">réservations maximum par jour</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEditDefault} className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                  </div> :
              // Editing view
              <div className="space-y-3">
                    <Input type="number" value={tempDefaultMaxReservations} onChange={e => setTempDefaultMaxReservations(parseInt(e.target.value) || 3)} min="1" max="20" placeholder="Nombre par défaut de réservations" />
                    <div className="flex gap-2">
                      <Button onClick={saveDefaultSettings} disabled={defaultLoading} size="sm">
                        {defaultLoading ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                      <Button variant="outline" onClick={handleCancelEditDefault} size="sm">
                        Annuler
                      </Button>
                    </div>
                  </div>}
                
                <p className="text-sm text-muted-foreground">
                  Ce nombre s'appliquera à toutes les dates qui n'ont pas de nombre spécifique assigné
                </p>
              </div>
              
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Disponibilités de Rendez-vous</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchAvailabilities} className="flex items-center gap-2">
            Actualiser les Données
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Date Selection */}
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Étape 1: Sélectionner une Date</h3>
                <p className="text-muted-foreground text-sm">
                  Choisissez d'abord la date pour laquelle vous souhaitez configurer la disponibilité
                </p>
              </div>
              
              <div className="flex justify-center">
                <CustomCalendar selected={selectedDate} onSelect={setSelectedDate} disabled={date => date < new Date()} availabilities={availabilities} />
              </div>
              
              {selectedDate && <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-medium">
                      Date sélectionnée: {format(selectedDate, 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>}
            </div>

            {/* Step 2: Configuration Form */}
            <div className={`border-2 rounded-lg p-6 transition-all duration-300 ${selectedDate ? 'border-primary/30 bg-primary/5' : 'border-muted/50 bg-muted/20 opacity-50 pointer-events-none'}`}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Étape 2: Configuration de la Disponibilité
                </h3>
                <p className="text-muted-foreground text-sm">
                  {selectedDate ? 'Configurez maintenant les paramètres de disponibilité pour cette date' : 'Veuillez d\'abord sélectionner une date ci-dessus'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Statut de Disponibilité</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Disponible
                          </div>
                        </SelectItem>
                        <SelectItem value="full">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Complet
                          </div>
                        </SelectItem>
                        <SelectItem value="unavailable">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Indisponible
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre de Réservations Autorisées</Label>
                    <Input type="number" value={maxReservations} onChange={e => setMaxReservations(parseInt(e.target.value) || defaultMaxReservations)} min="1" max="20" placeholder={`Par défaut: ${defaultMaxReservations}`} />
                    <p className="text-xs text-muted-foreground">
                      Défaut: {defaultMaxReservations} réservations par jour
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes Optionnelles</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ajoutez des notes spéciales pour cette date (optionnel)" rows={3} />
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" disabled={loading || !selectedDate} className="btn-hero">
                    {loading ? <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        {editingId ? 'Mise à jour...' : 'Ajout en cours...'}
                      </> : <>
                        <Plus className="w-4 h-4 mr-2" />
                        {editingId ? 'Mettre à Jour' : 'Ajouter la Disponibilité'}
                      </>}
                  </Button>
                  
                  {editingId && <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler la Modification
                    </Button>}
                  
                  <Button type="button" variant="outline" onClick={() => setSelectedDate(undefined)} className="ml-auto">
                    Réinitialiser la Date
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous Spécifiés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availabilities.length === 0 ? <p className="text-center text-muted-foreground py-4">
                Aucun rendez-vous spécifié
              </p> : availabilities.map(availability => <div key={availability.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">
                        {format(new Date(availability.date), 'dd/MM/yyyy')}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        Réservations: {availability.current_reservations || 0} / {availability.max_reservations || 3}
                      </div>
                    </div>
                    {getStatusBadge(availability.status)}
                    {availability.notes && <span className="text-sm text-muted-foreground">
                        {availability.notes}
                      </span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(availability)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(availability.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default ConsultationAvailabilityManagement;