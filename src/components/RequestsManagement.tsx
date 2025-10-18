import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, Eye, Phone, Mail, Calendar, Package, FileImage, ExternalLink, Search, Loader2, Target, Dumbbell, Plus } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import CreateSubPackModal from "./admin/CreateSubPackModal";

interface PurchaseRequest {
  id: number;
  user_id: number;
  pack_id?: number;
  sub_pack_id?: number;
  status: 'pending' | 'accepted' | 'rejected';
  request_date: string;
  admin_response_date?: string;
  admin_notes?: string;
  recu_link?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  pack_title: string;
  sub_pack_title?: string;
  pack_price?: string;
  request_type: 'pack' | 'sub_pack';
}

interface WorkshopRequest {
  id: string;
  user_id: string;
  workshop_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes?: string;
  created_at: string;
  admin_response_date?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  workshop_title: string;
  workshop_price?: string;
  recu_link?: string;
}

interface ChallengeRequest {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_notes: string | null;
  recu_link: string | null;
  created_at: string;
  admin_response_date: string | null;
  challenge_title: string;
  username: string;
  email: string;
}

const RequestsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [workshopRequests, setWorkshopRequests] = useState<WorkshopRequest[]>([]);
  const [challengeRequests, setChallengeRequests] = useState<ChallengeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isCreateSubPackOpen, setIsCreateSubPackOpen] = useState(false);
  const [showAccepted, setShowAccepted] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Fetch all request types in parallel
      const [packResponse, subPackResponse, workshopResponse, challengeResponse] = await Promise.all([
        fetch('https://spadadibattaglia.com/mom/api/requests.php'),
        fetch('https://spadadibattaglia.com/mom/api/sub_pack_requests.php'),
        fetch('https://spadadibattaglia.com/mom/api/workshop_requests.php'),
        fetch('https://spadadibattaglia.com/mom/api/challenge_requests.php')
      ]);
      
      const [packData, subPackData, workshopData, challengeData] = await Promise.all([
        packResponse.json(),
        subPackResponse.json(),
        workshopResponse.json(),
        challengeResponse.json()
      ]);
      
      const allRequests: PurchaseRequest[] = [];
      
      // Add pack requests
      if (packData.success && packData.data) {
        const packRequests = packData.data.map((req: any) => ({
          ...req,
          request_type: 'pack' as const,
          request_date: req.request_date || req.created_at
        }));
        allRequests.push(...packRequests);
      }
      
      // Add sub-pack requests
      if (subPackData.success && subPackData.data) {
        const subPackRequests = subPackData.data.map((req: any) => ({
          ...req,
          request_type: 'sub_pack' as const,
          request_date: req.request_date || req.created_at
        }));
        allRequests.push(...subPackRequests);
      }
      
      // Sort by date (most recent first)
      allRequests.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
      setRequests(allRequests);

      // Set workshop requests
      if (workshopData.success && workshopData.data) {
        setWorkshopRequests(workshopData.data);
      }

      // Set challenge requests
      if (challengeData.success && challengeData.data) {
        setChallengeRequests(challengeData.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Erreur de chargement des demandes",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (request: PurchaseRequest, status: 'accepted' | 'rejected') => {
    setActionLoading(true);
    
    try {
      const endpoint = request.request_type === 'pack' 
        ? 'https://spadadibattaglia.com/mom/api/requests.php' 
        : 'https://spadadibattaglia.com/mom/api/sub_pack_requests.php';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: request.id,
          status: status
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: status === 'accepted' ? "Demande acceptée avec succès" : "Demande refusée",
          description: status === 'accepted' 
            ? `Le client peut maintenant accéder ${request.request_type === 'pack' ? 'au pack' : 'au cours'}` 
            : "Le client a été notifié du refus",
        });
        
        // Refresh all requests
        await fetchRequests();
        
        setIsModalOpen(false);
        setSelectedRequest(null);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Échec de la mise à jour de la demande",
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
      setActionLoading(false);
    }
  };

  const openRequestModal = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setIsModalOpen(true);
  };

  const handleWorkshopAction = async (requestId: string, status: 'accepted' | 'rejected', notes: string = '') => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('id', requestId);
      formData.append('status', status);
      if (notes) {
        formData.append('admin_notes', notes);
      }

      const response = await fetch('https://spadadibattaglia.com/mom/api/workshop_requests.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Mise à jour réussie",
          description: `Demande ${status === 'accepted' ? 'acceptée' : 'refusée'}`
        });
        fetchRequests();
        setIsModalOpen(false);
        setSelectedRequest(null);
      } else {
        throw new Error(data.message || 'Failed to update request');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la mise à jour de la demande",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChallengeAction = async (requestId: string, status: 'accepted' | 'rejected', notes: string = '') => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('id', requestId);
      formData.append('status', status);
      if (notes) {
        formData.append('admin_notes', notes);
      }

      const response = await fetch('https://spadadibattaglia.com/mom/api/challenge_requests.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Mise à jour réussie',
          description: `Demande ${status === 'accepted' ? 'acceptée' : 'refusée'}`
        });
        fetchRequests();
        setSelectedRequest(null);
        setIsModalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la mise à jour de la demande',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests
    .filter(req => !showAccepted ? req.status !== 'accepted' : true)
    .filter(req => statusFilter === 'all' || req.status === statusFilter)
    .filter(req => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        req.user_name?.toLowerCase().includes(query) ||
        req.user_email?.toLowerCase().includes(query) ||
        req.user_phone?.toLowerCase().includes(query)
      );
    });

  const filteredWorkshops = workshopRequests
    .filter(req => !showAccepted ? req.status !== 'accepted' : true)
    .filter(req => statusFilter === 'all' || req.status === statusFilter)
    .filter(req => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        req.user_name?.toLowerCase().includes(query) ||
        req.user_email?.toLowerCase().includes(query) ||
        req.workshop_title?.toLowerCase().includes(query)
      );
    });

  const filteredChallenges = challengeRequests
    .filter(req => !showAccepted ? req.status !== 'accepted' : true)
    .filter(req => statusFilter === 'all' || req.status === statusFilter)
    .filter(req => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        req.username?.toLowerCase().includes(query) ||
        req.email?.toLowerCase().includes(query) ||
        req.challenge_title?.toLowerCase().includes(query)
      );
    });

  // Combine all requests into one unified array
  const allUnifiedRequests = [
    ...filteredRequests.map(r => ({ ...r, requestType: 'pack' as const })),
    ...filteredWorkshops.map(r => ({ ...r, requestType: 'workshop' as const })),
    ...filteredChallenges.map(r => ({ ...r, requestType: 'challenge' as const }))
  ].sort((a: any, b: any) => {
    const dateA = new Date(a.created_at || a.request_date || '').getTime();
    const dateB = new Date(b.created_at || b.request_date || '').getTime();
    return dateB - dateA;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      accepted: { icon: CheckCircle, text: 'Accepté', variant: 'default' as const },
      rejected: { icon: XCircle, text: 'Refusé', variant: 'destructive' as const },
      pending: { icon: AlertCircle, text: 'En attente', variant: 'secondary' as const }
    };
    
    const { icon: Icon, text, variant } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-4 h-4" />
        {text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Demandes</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Toutes les demandes d'achat
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showAccepted ? "default" : "outline"}
            onClick={() => setShowAccepted(!showAccepted)}
            className="whitespace-nowrap"
          >
            {showAccepted ? 'Masquer acceptées' : 'Voir acceptées'}
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="ltr">
              <SelectItem value="all">Toutes les demandes</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="accepted">Accepté</SelectItem>
              <SelectItem value="rejected">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher par nom, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Unified Requests List */}
      <div className="space-y-4 mt-4">
        {allUnifiedRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune demande trouvée</p>
          </Card>
        ) : (
          allUnifiedRequests.map((request: any) => {
            // Handle pack/sub-pack requests
            if (request.requestType === 'pack') {
              return (
                <Card key={`pack_${request.id}`} className="card-elegant p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline" className="text-xs">
                          {request.request_type === 'pack' ? '📦 Pack' : '📚 Cours'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{request.id}</span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 text-left break-words" dir="ltr">
                        {request.request_type === 'sub_pack' && request.sub_pack_title 
                          ? request.sub_pack_title 
                          : request.pack_title}
                      </h3>
                      {request.request_type === 'sub_pack' && request.pack_title && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 text-left break-words" dir="ltr">
                          Du pack: {request.pack_title}
                        </p>
                      )}
                      {request.pack_price && (
                        <p className="text-primary font-semibold mb-2 text-sm sm:text-base text-left" dir="ltr">{request.pack_price}</p>
                      )}
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-left truncate" dir="ltr">
                            {request.user_name} - {request.user_email}
                          </span>
                        </div>
                        {request.user_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="text-left" dir="ltr">{request.user_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FileImage className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className={request.recu_link ? "text-green-600 font-medium" : "text-red-500"}>
                            {request.recu_link ? "Reçu téléchargé" : "Aucun reçu"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {new Date(request.request_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openRequestModal(request)}
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="sm:inline">Gérer</span>
                    </Button>
                  </div>
                </Card>
              );
            }
            
            // Handle workshop requests
            if (request.requestType === 'workshop') {
              return (
                <Card key={`workshop_${request.id}`} className="card-elegant p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline" className="text-xs">
                          🏋️ Atelier
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{request.id}</span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 text-left break-words" dir="ltr">
                        {request.workshop_title}
                      </h3>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-left truncate" dir="ltr">
                            {request.user_name} - {request.user_email}
                          </span>
                        </div>
                        {request.user_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="text-left" dir="ltr">{request.user_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FileImage className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className={request.recu_link ? "text-green-600 font-medium" : "text-red-500"}>
                            {request.recu_link ? "Reçu téléchargé" : "Aucun reçu"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      {request.admin_notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Notes:</span> {request.admin_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 border-green-200 hover:bg-green-100"
                            onClick={() => handleWorkshopAction(request.id, 'accepted')}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 border-red-200 hover:bg-red-100"
                            onClick={() => {
                              setSelectedRequest({...request, type: 'workshop'});
                              setIsModalOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {request.recu_link && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReceiptUrl(request.recu_link!);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir le reçu
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            }
            
            // Handle challenge requests
            if (request.requestType === 'challenge') {
              return (
                <Card key={`challenge_${request.id}`} className="card-elegant p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline" className="text-xs">
                          🎯 Défi
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{request.id}</span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 text-left break-words" dir="ltr">
                        {request.challenge_title}
                      </h3>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-left truncate" dir="ltr">
                            {request.username} - {request.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileImage className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className={request.recu_link ? "text-green-600 font-medium" : "text-red-500"}>
                            {request.recu_link ? "Reçu téléchargé" : "Aucun reçu"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      {request.admin_notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Notes:</span> {request.admin_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleChallengeAction(request.id, 'accepted')}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accepter
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest({...request, type: 'challenge'});
                              setIsModalOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {request.recu_link && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReceiptUrl(request.recu_link!);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir le reçu
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            }
            
            return null;
          })
        )}
      </div>

      {/* Request Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto" dir="ltr">
          <DialogHeader>
            <DialogTitle className="text-left">
              {selectedRequest?.type === 'workshop' ? 'Refuser la demande d\'atelier' : 
               selectedRequest?.type === 'challenge' ? 'Refuser la demande de défi' :
               `Gérer la demande d'achat #${selectedRequest?.id}`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* For workshop/challenge rejection - show notes input */}
              {(selectedRequest.type === 'workshop' || selectedRequest.type === 'challenge') && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Écrire la raison du refus (optionnel)"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedRequest(null);
                        setAdminNotes('');
                      }}
                      disabled={actionLoading}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (selectedRequest.type === 'workshop') {
                          handleWorkshopAction(selectedRequest.id, 'rejected', adminNotes);
                        } else if (selectedRequest.type === 'challenge') {
                          handleChallengeAction(selectedRequest.id, 'rejected', adminNotes);
                        }
                      }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Confirmer le refus
                    </Button>
                  </div>
                </div>
              )}

              {/* For pack/sub-pack requests - show full details */}
              {!selectedRequest.type && (
                <>
                  {/* Customer Information */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-left">
                      <Eye className="w-5 h-5" />
                      Informations du Client
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-left">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Nom :</span>
                          <span className="text-left" dir="ltr">
                            {selectedRequest.user_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Email :</span>
                          <span className="text-left" dir="ltr">{selectedRequest.user_email}</span>
                        </div>
                        {selectedRequest.user_phone && (
                          <div className="flex items-center gap-2 text-left">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Téléphone :</span>
                            <span className="text-left" dir="ltr">{selectedRequest.user_phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-left">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Type :</span>
                          <Badge variant="outline">
                            {selectedRequest.request_type === 'pack' ? '📦 Pack Complet' : '📚 Cours Individuel'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {selectedRequest.request_type === 'pack' ? 'Pack' : 'Cours'} demandé :
                          </span>
                          <span className="font-semibold text-primary text-left" dir="ltr">
                            {selectedRequest.request_type === 'sub_pack' && selectedRequest.sub_pack_title 
                              ? selectedRequest.sub_pack_title 
                              : selectedRequest.pack_title}
                          </span>
                        </div>
                        {selectedRequest.request_type === 'sub_pack' && selectedRequest.pack_title && (
                          <div className="flex items-center gap-2 text-left">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Pack parent :</span>
                            <span className="text-left" dir="ltr">{selectedRequest.pack_title}</span>
                          </div>
                        )}
                        {selectedRequest.pack_price && (
                          <div className="flex items-center gap-2 text-left">
                            <span className="font-medium">Prix :</span>
                            <span className="font-bold text-lg text-primary text-left" dir="ltr">{selectedRequest.pack_price}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-left">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Date de la demande :</span>
                          <span className="text-left" dir="ltr">{new Date(selectedRequest.request_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Receipt Section */}
                  {selectedRequest.recu_link && (
                    <Card className="p-4">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-left" dir="ltr">
                        <FileImage className="w-5 h-5" />
                        Reçu de paiement
                      </h3>
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={selectedRequest.recu_link}
                            alt="Reçu de paiement"
                            className="w-32 h-40 object-cover rounded-lg border border-pink-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              setSelectedReceiptUrl(selectedRequest.recu_link || '');
                              setIsReceiptModalOpen(true);
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                            <Eye className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <div className="text-left">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReceiptUrl(selectedRequest.recu_link || '');
                              setIsReceiptModalOpen(true);
                            }}
                            className="border-pink-300 text-pink-600 hover:bg-pink-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir en grand
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* No Receipt Warning */}
                  {!selectedRequest.recu_link && (
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-3 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                          <h4 className="font-medium">Aucun reçu de paiement</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Le client n'a pas encore téléchargé de reçu de paiement
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Current Status */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Statut actuel :</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    {selectedRequest.admin_response_date && (
                      <div className="text-sm text-muted-foreground text-left" dir="ltr">
                        Dernière mise à jour : {new Date(selectedRequest.admin_response_date).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      Annuler
                    </Button>
                    
                    {selectedRequest.status !== 'rejected' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleRequestAction(selectedRequest, 'rejected')}
                        disabled={actionLoading}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                    )}
                    
                    {selectedRequest.status !== 'accepted' && (
                      <Button
                        className="btn-hero w-full sm:w-auto"
                        onClick={() => handleRequestAction(selectedRequest, 'accepted')}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {actionLoading ? "En cours..." : "Approuver"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt View Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto" dir="ltr">
          <DialogHeader>
            <DialogTitle className="text-center" dir="ltr">Reçu de paiement</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            <img 
              src={selectedReceiptUrl} 
              alt="Reçu de paiement" 
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='14' fill='%236b7280'%3EImage non disponible%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <CreateSubPackModal
        isOpen={isCreateSubPackOpen}
        onClose={() => setIsCreateSubPackOpen(false)}
        onSuccess={() => {
          setIsCreateSubPackOpen(false);
          toast({ title: "Sous-pack créé avec succès" });
        }}
        packId={0}
      />
    </div>
  );
};

export default RequestsManagement;