import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, Search, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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

const ChallengeRequestsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChallengeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ChallengeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ChallengeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/challenge_requests.php');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Only show pending requests if they have a receipt uploaded
    filtered = filtered.filter(req => {
      if (req.status === 'pending' && !req.recu_link) return false;
      return true;
    });

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.challenge_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: 'accepted' | 'rejected', notes: string = '') => {
    setProcessingId(requestId);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('id', requestId);
      formData.append('status', newStatus);
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
          title: 'تم التحديث',
          description: `تم ${newStatus === 'accepted' ? 'قبول' : 'رفض'} الطلب بنجاح`,
        });
        fetchRequests();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل تحديث الطلب',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setIsReceiptModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">قيد المراجعة</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700">مقبول</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
          <CardTitle>إدارة طلبات التحديات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو البريد أو التحدي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطلبات</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="accepted">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.username}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{request.email}</p>
                        <p className="text-sm font-medium text-primary mb-2">{request.challenge_title}</p>
                        <p className="text-xs text-muted-foreground">
                          تاريخ الطلب: {new Date(request.created_at).toLocaleDateString('ar-EG')}
                        </p>
                        {request.admin_notes && (
                          <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                            ملاحظات: {request.admin_notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {request.recu_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(request.recu_link!)}
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            عرض الإيصال
                          </Button>
                        )}

                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleUpdateStatus(request.id, 'accepted')}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 ml-2" />
                                  قبول
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedRequest(request);
                                setAdminNotes('');
                              }}
                              disabled={processingId === request.id}
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              رفض
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد طلبات
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="أدخل سبب الرفض (اختياري)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRequest && handleUpdateStatus(selectedRequest.id, 'rejected', adminNotes)}
                disabled={!!processingId}
              >
                {processingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'تأكيد الرفض'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إيصال الدفع</DialogTitle>
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

export default ChallengeRequestsManagement;
