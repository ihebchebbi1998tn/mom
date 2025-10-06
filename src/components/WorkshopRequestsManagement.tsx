import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Search, Eye, Loader2 } from "lucide-react";

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

const WorkshopRequestsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<WorkshopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<WorkshopRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string>('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/workshop_requests.php');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      } else {
        toast({
          title: "Erreur",
          description: "Échec du chargement des demandes",
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

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'rejected', adminNotes: string = '') => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('id', requestId);
      formData.append('status', newStatus);
      if (adminNotes) {
        formData.append('admin_notes', adminNotes);
      }

      const response = await fetch('https://spadadibattaglia.com/mom/api/workshop_requests.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Mise à jour réussie",
          description: `Demande ${newStatus === 'accepted' ? 'acceptée' : 'refusée'}`
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

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      request.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.workshop_title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700">Accepté</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejeté</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsReceiptModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des demandes d'ateliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, email ou atelier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune demande
              </div>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{request.user_name}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Atelier:</span> {request.workshop_title}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                          <span>📧 {request.user_email}</span>
                          {request.user_phone && <span>📞 {request.user_phone}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Date de la demande: {new Date(request.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {request.admin_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <span className="font-medium">Notes administratives:</span> {request.admin_notes}
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
                              onClick={() => {
                                setSelectedRequest(request);
                                handleStatusUpdate(request.id, 'accepted');
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 border-red-200 hover:bg-red-100"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsModalOpen(true);
                              }}
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
                            onClick={() => handleViewReceipt(request.recu_link!)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir le reçu
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Écrire la raison du refus (optionnel)"
              rows={4}
              id="admin-notes"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRequest(null);
                }}
                disabled={actionLoading}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedRequest) {
                    const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value || '';
                    handleStatusUpdate(selectedRequest.id, 'rejected', notes);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                Confirmer le refus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt View Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reçu de paiement</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img 
              src={selectedReceiptUrl} 
              alt="Receipt" 
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopRequestsManagement;
