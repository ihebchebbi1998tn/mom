import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Star, Trash2, Eye, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { isPrimarilyArabic } from "@/utils/textAlignment";

interface Review {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  formatted_date: string;
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { toast } = useToast();

  // Function to detect if text is primarily Arabic (more reliable than just checking for Latin)
  const isArabicText = (text: string) => {
    return isPrimarilyArabic(text);
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin_reviews.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les avis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (reviewId: number, newStatus: string) => {
    setUpdatingStatus(reviewId);
    
    try {
      const response = await fetch('/api/admin_reviews.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reviewId,
          status: newStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: "Statut de l'avis mis à jour",
        });
        fetchReviews(); // Refresh the list
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/admin_reviews.php?id=${reviewId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: "Avis supprimé avec succès",
        });
        fetchReviews(); // Refresh the list
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100" dir="ltr"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100" dir="ltr"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100" dir="ltr"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    return reviews.filter(review => review.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="ltr">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Avis</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{getStatusCount('pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Approuvés</p>
                <p className="text-2xl font-bold">{getStatusCount('approved')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rejetés</p>
                <p className="text-2xl font-bold">{getStatusCount('rejected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Gestion des Avis ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div 
                        className="font-semibold"
                        dir={isArabicText(review.user_name) ? "rtl" : "ltr"}
                        style={isArabicText(review.user_name) ? {} : { textAlign: 'left' }}
                      >
                        {review.user_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div dir="ltr" style={{ textAlign: 'left' }}>
                        {review.user_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(review.status)}
                    </TableCell>
                    <TableCell>
                      <div dir="ltr" style={{ textAlign: 'left' }} className="text-sm text-muted-foreground">
                        {review.formatted_date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* View Review */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {/* Status Change */}
                        <Select
                          value={review.status}
                          onValueChange={(value) => handleStatusChange(review.id, value)}
                          disabled={updatingStatus === review.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="approved">Approuvé</SelectItem>
                            <SelectItem value="rejected">Rejeté</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="ltr">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex justify-center sm:justify-center gap-2">
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(review.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {reviews.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">Aucun avis trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      {selectedReview && (
        <AlertDialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <AlertDialogContent className="max-w-2xl" dir="ltr">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2" dir="ltr">
                <MessageSquare className="w-5 h-5" />
                Détail de l'avis
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground" dir="ltr">Utilisateur:</p>
                      <p 
                        className="font-medium"
                        dir={isArabicText(selectedReview.user_name) ? "rtl" : "ltr"}
                        style={isArabicText(selectedReview.user_name) ? {} : { textAlign: 'left' }}
                      >
                        {selectedReview.user_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground" dir="ltr">Email:</p>
                      <p className="font-medium" dir="ltr" style={{ textAlign: 'left' }}>
                        {selectedReview.user_email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground" dir="ltr">Note:</p>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.rating)}
                        <span>({selectedReview.rating}/5)</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground" dir="ltr">Statut:</p>
                      {getStatusBadge(selectedReview.status)}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground" dir="ltr">Date de création:</p>
                    <p dir="ltr" style={{ textAlign: 'left' }}>{selectedReview.formatted_date}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground" dir="ltr">Avis:</p>
                    <div className="bg-muted p-3 rounded-md" dir="rtl">
                      <p className="text-sm leading-relaxed text-right" style={{ unicodeBidi: 'plaintext' }}>
                        "{selectedReview.review_text}"
                      </p>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel dir="ltr">Fermer</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ReviewsManagement;