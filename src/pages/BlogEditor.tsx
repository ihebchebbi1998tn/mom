import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import { getTextDirection, getTextAlignmentClasses, isPrimarilyArabic } from "@/utils/textAlignment";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_date: string;
  read_time: string;
  featured_image?: string;
  status: 'published' | 'draft';
}

const BlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: boolean;
    excerpt?: boolean;
    content?: boolean;
    category?: boolean;
  }>({});

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

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image',
    'color', 'background'
  ];

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://spadadibattaglia.com/mom/api/blogs.php?id=${id}`);
      const data = await response.json();
      
      if (data.success && data.blog) {
        const blog = data.blog;
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
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement de l'article",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      title: !formData.title.trim(),
      excerpt: !formData.excerpt.trim(),
      content: !formData.content.trim() || formData.content === '<p><br></p>',
      category: !formData.category
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const url = id 
        ? `https://spadadibattaglia.com/mom/api/blogs.php?id=${id}`
        : 'https://spadadibattaglia.com/mom/api/blogs.php';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: id ? "Article mis à jour avec succès" : "Article créé avec succès",
        });
        navigate('/admin?tab=blogs');
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement de l'article",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')}
          className="mb-6"
          dir="ltr"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-left">Retour au Dashboard</span>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-left" dir="ltr">
              {id ? "Modifier l'Article" : "Ajouter un Nouvel Article"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" dir="ltr" className="text-left">
                    Titre de l'Article *
                    {errors.title && <span className="text-red-500 ml-2">(Requis)</span>}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({...formData, title: e.target.value});
                      setErrors({...errors, title: false});
                    }}
                    placeholder="أدخل عنوان المقال"
                    required
                    dir={isPrimarilyArabic(formData.title) ? 'rtl' : 'ltr'}
                    className={`${isPrimarilyArabic(formData.title) ? 'text-right' : 'text-left'} ${errors.title ? 'border-red-500 border-2' : ''}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" dir="ltr" className="text-left">
                    Catégorie *
                    {errors.category && <span className="text-red-500 ml-2">(Requis)</span>}
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => {
                      setFormData({...formData, category: value});
                      setErrors({...errors, category: false});
                    }}
                  >
                    <SelectTrigger 
                      dir={getTextDirection(formData.category || "اختر التصنيف")}
                      className={errors.category ? 'border-red-500 border-2' : ''}
                    >
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          dir={getTextDirection(category)}
                          className={getTextAlignmentClasses(category)}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt" dir="ltr" className="text-left">
                  Résumé *
                  {errors.excerpt && <span className="text-red-500 ml-2">(Requis)</span>}
                </Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => {
                    setFormData({...formData, excerpt: e.target.value});
                    setErrors({...errors, excerpt: false});
                  }}
                  placeholder="ملخص مختصر للمقال"
                  rows={3}
                  required
                  dir={isPrimarilyArabic(formData.excerpt) ? 'rtl' : 'ltr'}
                  className={`${isPrimarilyArabic(formData.excerpt) ? 'text-right' : 'text-left'} ${errors.excerpt ? 'border-red-500 border-2' : ''}`}
                />
              </div>
              
              <div className="space-y-2 col-span-full">
                <Label htmlFor="content" dir="ltr" className="text-left">
                  Contenu de l'Article *
                  {errors.content && <span className="text-red-500 ml-2">(Requis)</span>}
                </Label>
                <div 
                  className={`bg-white rounded-md border min-h-[500px] ${errors.content ? 'border-red-500 border-2' : ''}`}
                >
                  <style dangerouslySetInnerHTML={{__html: `
                    .quill-rtl-content .ql-editor {
                      direction: rtl;
                      text-align: right;
                    }
                    .quill-rtl-content .ql-editor p,
                    .quill-rtl-content .ql-editor h1,
                    .quill-rtl-content .ql-editor h2,
                    .quill-rtl-content .ql-editor h3,
                    .quill-rtl-content .ql-editor div {
                      text-align: right;
                    }
                    .quill-ltr-content .ql-editor {
                      direction: ltr;
                      text-align: left;
                    }
                  `}} />
                  <div className={isPrimarilyArabic(formData.content) ? 'quill-rtl-content' : 'quill-ltr-content'}>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => {
                        setFormData({...formData, content: value});
                        setErrors({...errors, content: false});
                      }}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="اكتب محتوى المقال هنا مع التنسيق..."
                      style={{ height: '450px' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="author" dir="ltr" className="text-left">Auteur</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    placeholder="اسم الكاتب"
                    dir="auto"
                    style={{ unicodeBidi: 'plaintext' }}
                    className={getTextAlignmentClasses(formData.author)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="published_date" dir="ltr" className="text-left">Date de Publication</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({...formData, published_date: e.target.value})}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="read_time" dir="ltr" className="text-left">Temps de Lecture</Label>
                  <Input
                    id="read_time"
                    value={formData.read_time}
                    onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                    placeholder="5 دقائق"
                    dir="auto"
                    style={{ unicodeBidi: 'plaintext' }}
                    className={getTextAlignmentClasses(formData.read_time)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="featured_image" dir="ltr" className="text-left">Image de l'Article</Label>
                  <ImageUpload
                    onUploadComplete={(url) => setFormData({...formData, featured_image: url})}
                    currentImage={formData.featured_image}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" dir="ltr" className="text-left">Statut de Publication</Label>
                  <Select value={formData.status} onValueChange={(value: 'published' | 'draft') => setFormData({...formData, status: value})}>
                    <SelectTrigger dir="ltr">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft" dir="ltr" className="text-left">Brouillon</SelectItem>
                      <SelectItem value="published" dir="ltr" className="text-left">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin')}
                  disabled={loading}
                  dir="ltr"
                >
                  <span className="text-left">Annuler</span>
                </Button>
                <Button type="submit" disabled={loading} dir="ltr">
                  <Save className="w-4 h-4 mr-2" />
                  <span className="text-left">
                    {loading ? "Enregistrement..." : (id ? "Mettre à Jour" : "Créer l'Article")}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogEditor;
