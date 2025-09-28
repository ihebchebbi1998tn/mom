import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Eye, Heart, Calendar, FileText, Image, Save, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

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
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: 1,
      title: "كيفية بناء الثقة بالنفس لدى الأطفال",
      excerpt: "نصائح عملية لمساعدة الأطفال على تطوير الثقة بالنفس من خلال الأنشطة اليومية والتشجيع الإيجابي.",
      content: "تعتبر الثقة بالنفس من أهم المهارات التي يمكن للوالدين تعليمها لأطفالهم. في هذا المقال، سنستكشف طرقاً عملية لبناء الثقة لدى الأطفال...",
      category: "تربية الأطفال",
      author: "أكاديمية الأم",
      published_date: "2024-01-15",
      read_time: "7 دقائق",
      views: 245,
      likes: 32,
      featured_image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500",
      status: "published" as const,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      title: "تنظيم الوقت للأمهات العاملات",
      excerpt: "استراتيجيات فعالة للموازنة بين العمل والحياة الأسرية وإدارة الوقت بكفاءة.",
      content: "التوازن بين العمل والحياة الأسرية تحدٍ كبير تواجهه الأمهات العاملات. في هذا المقال، نقدم نصائح عملية لتنظيم الوقت...",
      category: "تنظيم الوقت",
      author: "أكاديمية الأم",
      published_date: "2024-01-10",
      read_time: "5 دقائق",
      views: 189,
      likes: 28,
      featured_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
      status: "published" as const,
      created_at: "2024-01-10T14:30:00Z",
      updated_at: "2024-01-10T14:30:00Z"
    },
    {
      id: 3,
      title: "التغذية الصحية للأطفال",
      excerpt: "دليل شامل لتقديم وجبات صحية ومتوازنة للأطفال مع وصفات سهلة ومغذية.",
      content: "التغذية السليمة أساس نمو الطفل الصحي. في هذا المقال، سنتعرف على أفضل الممارسات في تغذية الأطفال...",
      category: "التغذية والصحة",
      author: "أكاديمية الأم",
      published_date: "2024-01-05",
      read_time: "8 دقائق",
      views: 312,
      likes: 45,
      featured_image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=500",
      status: "draft" as const,
      created_at: "2024-01-05T09:15:00Z",
      updated_at: "2024-01-05T09:15:00Z"
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: 'أكاديمية الأم',
    published_date: new Date().toISOString().split('T')[0],
    read_time: '5 دقائق',
    featured_image: '',
    status: 'draft' as 'published' | 'draft'
  });

  const categories = [
    'تربية الأطفال',
    'التطوير التربوي', 
    'تنظيم الوقت',
    'بناء الشخصية',
    'الصحة النفسية',
    'التغذية والصحة',
    'الأنشطة التعليمية',
    'العلاقات الأسرية'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Remove the API calls since we're using static data for now
  // const fetchBlogs = async () => {
  //   try {
  //     const response = await fetch('https://spadadibattaglia.com/mom/api/blogs.php?status=all');
  //     const data = await response.json();
      
  //     if (data.success) {
  //       setBlogs(data.blogs);
  //     } else {
  //       toast({
  //         title: "Erreur",
  //         description: "Échec du chargement des articles",
  //         variant: "destructive"
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching blogs:', error);
  //     toast({
  //       title: "Erreur",
  //       description: "Échec de connexion au serveur",
  //       variant: "destructive"
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchBlogs = async () => {
    // Simulate loading for static data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    // For static demo, just add to the list
    const newBlog: Blog = {
      id: blogs.length + 1,
      ...formData,
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingBlog) {
      setBlogs(blogs.map(blog => blog.id === editingBlog.id ? { ...newBlog, id: editingBlog.id } : blog));
      toast({
        title: "Succès",
        description: "Article mis à jour avec succès",
      });
    } else {
      setBlogs([...blogs, newBlog]);
      toast({
        title: "Succès",
        description: "Article créé avec succès",
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    // For static demo, just remove from the list
    setBlogs(blogs.filter(blog => blog.id !== id));
    toast({
      title: "Succès",
      description: "Article supprimé avec succès",
    });
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      author: blog.author,
      published_date: blog.published_date,
      read_time: blog.read_time,
      featured_image: blog.featured_image || '',
      status: blog.status
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      author: 'أكاديمية الأم',
      published_date: new Date().toISOString().split('T')[0],
      read_time: '5 دقائق',
      featured_image: '',
      status: 'draft'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTextDirection = (text: string) => {
    // Check if text contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
  };

  const getTextAlignment = (text: string) => {
    return getTextDirection(text) === 'rtl' ? 'text-right' : 'text-left';
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' 
      ? <Badge className="bg-green-500">Publié</Badge>
      : <Badge variant="secondary">Brouillon</Badge>;
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
        <div>
          <h2 className="text-2xl font-bold">Gestion des Articles</h2>
          <p className="text-muted-foreground">Créer et modifier les articles et blogs</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Ajouter un Nouvel Article
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="ltr">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'Article *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="أدخل عنوان المقال"
                    required
                    dir="auto"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="ملخص مختصر للمقال"
                  rows={2}
                  required
                  dir="auto"
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenu de l'Article *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="محتوى المقال الكامل (يمكن استخدام Markdown)"
                  rows={10}
                  required
                  dir="auto"
                  className="text-right"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Auteur</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    placeholder="اسم الكاتب"
                    dir="auto"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="published_date">Date de Publication</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({...formData, published_date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="read_time">Temps de Lecture</Label>
                  <Input
                    id="read_time"
                    value={formData.read_time}
                    onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                    placeholder="5 دقائق"
                    dir="auto"
                    className="text-right"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Image de l'Article</Label>
                  <ImageUpload
                    onUploadComplete={(url) => setFormData({...formData, featured_image: url})}
                    currentImage={formData.featured_image}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Statut de Publication</Label>
                  <Select value={formData.status} onValueChange={(value: 'published' | 'draft') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingBlog ? 'Mettre à Jour' : 'Créer l\'Article'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blogs List */}
      <div className="grid gap-4">
        {blogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun Article</h3>
              <p className="text-muted-foreground text-center mb-4">
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
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 
                        className={`text-lg font-semibold ${getTextAlignment(blog.title)}`}
                        dir={getTextDirection(blog.title)}
                      >
                        {blog.title}
                      </h3>
                      {getStatusBadge(blog.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </span>
                    </div>
                    
                    <p 
                      className={`text-muted-foreground text-sm line-clamp-2 ${getTextAlignment(blog.excerpt)}`}
                      dir={getTextDirection(blog.excerpt)}
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
                          className={getTextAlignment(blog.read_time)}
                        >
                          {blog.read_time}
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className={`text-xs text-muted-foreground ${getTextAlignment(`بواسطة: ${blog.author}`)}`}
                      dir={getTextDirection(`بواسطة: ${blog.author}`)}
                    >
                      بواسطة: {blog.author}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(blog)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'Article</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cet article? Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(blog.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {blog.featured_image && (
                  <div className="mt-4">
                    <img 
                      src={blog.featured_image} 
                      alt={blog.title}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
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