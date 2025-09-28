import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Users, BookOpen, Video, Settings, ArrowLeft, Eye, Edit, Trash2, Plus, ShoppingCart, Calendar as CalendarIcon, BarChart3, MessageSquare, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import CoursePacksManagement from "@/components/CoursePacksManagement";
import WorkshopsManagement from "@/components/WorkshopsManagement";
import UserManagement from "@/components/UserManagement";
import RequestsManagement from "@/components/RequestsManagement";
import ConsultationAvailabilityManagement from "@/components/ConsultationAvailabilityManagement";
import VisitorStatistics from "@/components/VisitorStatistics";
import ReviewsManagement from "@/components/ReviewsManagement";
import BlogsManagement from "@/components/admin/BlogsManagement";

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Mock data for chapters (keeping this for now)
const mockChapters = [
  {
    id: 1,
    title: "سيطرة عالغضب",
    description: "تعلم كيفية إدارة الغضب بطرق صحية",
    videosCount: 5,
    videos: [
      { id: 1, title: "مقدمة في إدارة الغضب", duration: "15:30", views: 250 },
      { id: 2, title: "أسباب الغضب وتأثيره", duration: "22:15", views: 180 },
      { id: 3, title: "تقنيات التهدئة الفورية", duration: "18:45", views: 320 },
      { id: 4, title: "بناء عادات إيجابية", duration: "25:20", views: 150 },
      { id: 5, title: "التطبيق العملي", duration: "20:10", views: 200 }
    ]
  },
  {
    id: 2,
    title: "ثقة في النفس",
    description: "بناء الثقة بالنفس وتطوير الشخصية",
    videosCount: 5,
    videos: [
      { id: 1, title: "فهم الثقة بالنفس", duration: "14:30", views: 300 },
      { id: 2, title: "التخلص من المعتقدات السلبية", duration: "22:40", views: 220 },
      { id: 3, title: "بناء الثقة الداخلية", duration: "25:15", views: 280 },
      { id: 4, title: "مواجهة التحديات بثقة", duration: "20:25", views: 190 },
      { id: 5, title: "المحافظة على الثقة", duration: "16:35", views: 160 }
    ]
  },
  {
    id: 3,
    title: "دراسة",
    description: "طرق التعلم الفعال وتنظيم الوقت",
    videosCount: 5,
    videos: [
      { id: 1, title: "أساسيات التعلم الفعال", duration: "16:40", views: 400 },
      { id: 2, title: "تنظيم الوقت للدراسة", duration: "19:25", views: 350 },
      { id: 3, title: "تقنيات الحفظ والمراجعة", duration: "21:50", views: 380 },
      { id: 4, title: "التعامل مع صعوبات التعلم", duration: "24:15", views: 270 },
      { id: 5, title: "خلق بيئة دراسية مثالية", duration: "17:30", views: 290 }
    ]
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("users");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    fetchVisitorCount();
    fetchUserCount();
  }, []);

  const fetchVisitorCount = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/track_visitors.php');
      const result = await response.json();
      
      if (result.status === 'success') {
        setVisitorCount(result.data.length);
      }
    } catch (error) {
      console.error('Error fetching visitor count:', error);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/users.php');
      const data = await response.json();
      
      if (data.success && data.users) {
        setUserCount(data.users.length);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const navigationItems = [
    { value: "users", label: "Utilisateurs", icon: Users },
    { value: "requests", label: "Demandes", icon: ShoppingCart },
    { value: "packs", label: "Packs", icon: Video },
    { value: "workshops", label: "Workshops", icon: Settings },
    { value: "consultations", label: "Consultations", icon: CalendarIcon },
    { value: "reviews", label: "Avis", icon: MessageSquare },
    { value: "blogs", label: "Articles", icon: BookOpen },
    { value: "visitors", label: "Visiteurs", icon: BarChart3 },
  ];

  const handleMobileTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileNavOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "requests":
        return <RequestsManagement />;
      case "packs":
        return <CoursePacksManagement />;
      case "workshops":
        return <WorkshopsManagement />;
      case "consultations":
        return <ConsultationAvailabilityManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "blogs":
        return <BlogsManagement />;
      case "visitors":
        return <VisitorStatistics />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent admin-dashboard" dir="ltr">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Navigation - moved to left */}
              {isMobile && (
                <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80" dir="ltr">
                    <div className="flex flex-col h-full">
                      <div className="py-4 border-b">
                        <h2 className="text-lg font-semibold text-left">Navigation Admin</h2>
                        <p className="text-sm text-muted-foreground text-left">
                          Section actuelle: {navigationItems.find(item => item.value === activeTab)?.label}
                        </p>
                      </div>
                      
                      <div className="flex-1 py-4">
                        <nav className="space-y-2">
                          {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Button
                                key={item.value}
                                variant={activeTab === item.value ? "default" : "ghost"}
                                className="w-full justify-start gap-3 h-12 text-left"
                                onClick={() => handleMobileTabChange(item.value)}
                              >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className="text-left">{item.label}</span>
                              </Button>
                            );
                          })}
                        </nav>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              <Settings className="w-6 h-6 text-primary" />
              <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Tableau de Bord Administrateur
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Gestion des utilisateurs et du contenu</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("blogs")}
                className="btn-outline hidden sm:flex"
              >
                Gérer les Articles
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                Se Déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-primary">{userCount}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chapitres Disponibles</p>
                <p className="text-2xl font-bold text-primary">{mockChapters.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vidéos</p>
                <p className="text-2xl font-bold text-primary">
                  {mockChapters.reduce((total, chapter) => total + chapter.videosCount, 0)}
                </p>
              </div>
              <Video className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visiteurs</p>
                <p className="text-2xl font-bold text-primary">{visitorCount}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {isMobile ? (
          /* Mobile: Show current tab content directly */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {navigationItems.find(item => item.value === activeTab)?.label}
              </h2>
            </div>
            {renderTabContent()}
          </div>
        ) : (
          /* Desktop: Use tabs */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <RequestsManagement />
            </TabsContent>

            <TabsContent value="packs" className="space-y-6">
              <CoursePacksManagement />
            </TabsContent>

            <TabsContent value="workshops" className="space-y-6">
              <WorkshopsManagement />
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6">
              <ConsultationAvailabilityManagement />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <ReviewsManagement />
            </TabsContent>

            <TabsContent value="blogs" className="space-y-6">
              <BlogsManagement />
            </TabsContent>

            <TabsContent value="visitors" className="space-y-6">
              <VisitorStatistics />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;