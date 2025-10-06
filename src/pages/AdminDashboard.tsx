import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Users, BookOpen, Video, Settings, ArrowLeft, Eye, Edit, Trash2, Plus, ShoppingCart, Calendar as CalendarIcon, BarChart3, MessageSquare, Menu, Target } from "lucide-react";
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
import oldLogo from "@/assets/maman-attentionnee-logo.png";

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
  
  // Read tab from URL parameter or default to "users"
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'users';
  const [activeTab, setActiveTab] = useState(initialTab);
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
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Navigation - moved to left */}
              {isMobile && (
                <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="hover-scale">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 bg-gradient-to-b from-background via-background to-accent/20" dir="ltr">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="py-4 border-b border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shrink-0">
                            <Settings className="w-4 h-4 text-primary-foreground ml-[2px]" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-left bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              Admin Panel
                            </h2>
                            <p className="text-[10px] text-muted-foreground text-left">
                              Gestion du contenu
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 px-2.5 py-1.5 bg-accent/50 rounded-lg">
                          <p className="text-[10px] font-medium text-left text-muted-foreground">
                            📍 {navigationItems.find(item => item.value === activeTab)?.label}
                          </p>
                        </div>
                      </div>
                      
                      {/* Navigation */}
                      <div className="flex-1 py-3">
                        <nav className="space-y-1 px-2">
                          {navigationItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.value;
                            return (
                              <Button
                                key={item.value}
                                variant={isActive ? "default" : "ghost"}
                                className={`
                                  w-full justify-start gap-2.5 h-10 text-left
                                  transition-all duration-200
                                  ${isActive 
                                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg' 
                                    : 'hover:bg-accent/70 hover:translate-x-1'
                                  }
                                `}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => handleMobileTabChange(item.value)}
                              >
                                <div className={`
                                  w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                                  ${isActive 
                                    ? 'bg-white/20' 
                                    : 'bg-accent/50'
                                  }
                                `}>
                                  <Icon className="w-3.5 h-3.5 ml-[1.5px]" />
                                </div>
                                <span className="text-left font-medium text-xs">{item.label}</span>
                                {isActive && (
                                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                                )}
                              </Button>
                            );
                          })}
                        </nav>
                      </div>

                      {/* Footer */}
                      <div className="py-3 border-t border-border/50">
                        <div className="px-2.5 py-1.5 bg-accent/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground text-center">
                            💫 {userCount} utilisateurs • {visitorCount} visiteurs
                          </p>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              <Settings className="w-6 h-6 text-primary hidden sm:block" />
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
                <ArrowLeft className="w-4 h-4 sm:ml-2" />
                <span className="hidden sm:inline">Se Déconnecter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
          <Card className="card-elegant p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Utilisateurs</p>
                <p className="text-xl font-bold text-primary">{userCount}</p>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Chapitres Disponibles</p>
                <p className="text-xl font-bold text-primary">{mockChapters.length}</p>
              </div>
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Vidéos</p>
                <p className="text-xl font-bold text-primary">
                  {mockChapters.reduce((total, chapter) => total + chapter.videosCount, 0)}
                </p>
              </div>
              <Video className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="card-elegant p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Visiteurs</p>
                <p className="text-xl font-bold text-primary">{visitorCount}</p>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {isMobile ? (
          /* Mobile: Show current tab content directly */
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        ) : (
          /* Desktop: Use tabs */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6">
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