import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Eye, Heart, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTextDirection, getTextAlignmentClasses } from "@/utils/textAlignment";

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_date: string;
  read_time: string;
  views: number;
  likes: number;
  featured_image?: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

const BlogsManagement = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/blogs.php?status=all');
      const data = await response.json();
      
      if (data.success && data.blogs) {
        setBlogs(data.blogs);
      } else {
        toast({
          title: "Erreur",
          description: "Échec du chargement des articles",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Erreur",
        description: "Échec de connexion au serveur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`https://spadadibattaglia.com/mom/api/blogs.php?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: "Article supprimé avec succès",
        });
        fetchBlogs();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Échec de la suppression",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'article",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' 
      ? <Badge className="bg-green-500" dir="ltr">Publié</Badge>
      : <Badge variant="secondary" dir="ltr">Brouillon</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'تربية الأطفال': 'bg-blue-100 text-blue-800',
      'التطوير التربوي': 'bg-green-100 text-green-800',
      'تنظيم الوقت': 'bg-purple-100 text-purple-800',
      'بناء الشخصية': 'bg-orange-100 text-orange-800',
      'الصحة النفسية': 'bg-pink-100 text-pink-800',
      'التغذية والصحة': 'bg-teal-100 text-teal-800',
      'الأنشطة التعليمية': 'bg-indigo-100 text-indigo-800',
      'العلاقات الأسرية': 'bg-rose-100 text-rose-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div dir="ltr" className="text-left">
          <h2 className="text-2xl font-bold">Gestion des Articles</h2>
          <p className="text-muted-foreground">Créer et modifier les articles et blogs</p>
        </div>
        
        <Button onClick={() => navigate('/admin/blog/new')} dir="ltr">
          <PlusCircle className="w-4 h-4 mr-2" />
          <span className="text-left">Ajouter un Nouvel Article</span>
        </Button>
      </div>

      {/* Blogs List */}
      <div className="grid gap-4">
        {blogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-left" dir="ltr">Aucun Article</h3>
              <p className="text-muted-foreground text-center mb-4 text-left" dir="ltr">
                Aucun article n'a été créé pour le moment. Commencez par ajouter un nouvel article.
              </p>
            </CardContent>
          </Card>
        ) : (
          blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div 
                      className="flex items-center gap-3 flex-wrap"
                      dir={getTextDirection(blog.title) === 'ltr' ? 'ltr' : 'rtl'}
                    >
                      <h3 
                        className={`text-lg font-semibold ${getTextAlignmentClasses(blog.title)}`}
                        dir="auto"
                        lang="ar"
                      >
                        {blog.title}
                      </h3>
                      {getStatusBadge(blog.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </span>
                    </div>
                    
                    <p 
                      className={`text-muted-foreground text-sm line-clamp-2 ${getTextAlignmentClasses(blog.excerpt)}`}
                      dir="auto"
                      lang="ar"
                    >
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span dir="ltr">{formatDate(blog.published_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span dir="ltr">{blog.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span dir="ltr">{blog.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span 
                          dir={getTextDirection(blog.read_time)}
                          className={getTextAlignmentClasses(blog.read_time)}
                        >
                          {blog.read_time}
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className={`text-xs text-muted-foreground ${getTextAlignmentClasses(`بواسطة: ${blog.author}`)}`}
                      dir={getTextDirection(`بواسطة: ${blog.author}`)}
                    >
                      بواسطة: {blog.author}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                      dir="ltr"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span className="text-left">Modifier</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-left" dir="ltr">Supprimer l'Article</AlertDialogTitle>
                          <AlertDialogDescription className="text-left" dir="ltr">
                            Êtes-vous sûr de vouloir supprimer cet article? Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel dir="ltr">Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(blog.id)}
                            className="bg-red-600 hover:bg-red-700"
                            dir="ltr"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {blog.featured_image && (
                  <div className="mt-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg overflow-hidden">
                    <img 
                      src={blog.featured_image} 
                      alt={blog.title}
                      className="w-full h-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=200&fit=crop';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogsManagement;