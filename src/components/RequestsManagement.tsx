import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, Eye, Phone, Mail, Calendar, Package } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";

interface PurchaseRequest {
  id: number;
  user_id: number;
  pack_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  request_date: string;
  admin_response_date?: string;
  admin_notes?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  pack_title: string;
  pack_price: string;
}

const RequestsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/requests.php');
      const data = await response.json();
      
      if (data.success && data.data) {
        setRequests(data.data);
      }
    } catch (error) {
      toast({
        title: "Erreur de chargement des demandes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: number, status: 'accepted' | 'rejected') => {
    setActionLoading(true);
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/requests.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: status
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: status === 'accepted' ? "Demande acceptée avec succès" : "Demande refusée",
          description: status === 'accepted' ? "Le client peut maintenant accéder au pack" : "Le client a été notifié du refus",
        });
        
        // Update the request in state
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status, admin_response_date: new Date().toISOString() }
            : req
        ));
        
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

  const openRequestModal = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(req => req.status === statusFilter);

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Demandes d'Achat</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
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

      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="card-elegant p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(request.status)}
                  <span className="text-sm text-muted-foreground">#{request.id}</span>
                </div>
                <h3 className="font-bold text-lg mb-1 text-left" dir="ltr">
                  {request.pack_title}
                </h3>
                <p className="text-primary font-semibold mb-2 text-left" dir="ltr">{request.pack_price}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-left" dir="ltr">
                      {request.user_name} - {request.user_email}
                    </span>
                  </div>
                  {request.user_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-left" dir="ltr">{request.user_phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openRequestModal(request)}
              >
                <Eye className="w-4 h-4" />
                Gérer
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Request Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl" dir="ltr">
          <DialogHeader>
            <DialogTitle className="text-left">Gérer la demande d'achat #{selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
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
                      <span className="font-medium">Pack demandé :</span>
                      <span className="font-semibold text-primary text-left" dir="ltr">
                        {selectedRequest.pack_title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-left">
                      <span className="font-medium">Prix :</span>
                      <span className="font-bold text-lg text-primary text-left" dir="ltr">{selectedRequest.pack_price} TND</span>
                    </div>
                    <div className="flex items-center gap-2 text-left">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Date de la demande :</span>
                      <span className="text-left" dir="ltr">{new Date(selectedRequest.request_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </Card>

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
              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </Button>
                
                {selectedRequest.status !== 'rejected' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleRequestAction(selectedRequest.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Refuser la demande
                  </Button>
                )}
                
                {selectedRequest.status !== 'accepted' && (
                  <Button
                    className="btn-hero"
                    onClick={() => handleRequestAction(selectedRequest.id, 'accepted')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? "Approbation en cours..." : "Approuver la demande"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsManagement;