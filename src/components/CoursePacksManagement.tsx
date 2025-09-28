import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Package, Video, PlayCircle, Loader2 } from "lucide-react";
import { getTextAlignmentClasses, getTextDirection, getContainerDirection } from "@/utils/textAlignment";
import PackCard from "./admin/PackCard";
import SubPackCard from "./admin/SubPackCard";
import VideoCard from "./admin/VideoCard";
import CreatePackModal from "./admin/CreatePackModal";
import CreateSubPackModal from "./admin/CreateSubPackModal";
import CreateVideoModal from "./admin/CreateVideoModal";

interface CoursePack {
  id: number;
  title: string;
  modules: string;
  price: string;
  duration: string;
  students: string;
  rating: number;
  image_url?: string;
  description?: string;
  status: string;
  created_at: string;
}

interface SubPack {
  id: number;
  pack_id: number;
  title: string;
  description?: string;
  order_index: number;
  status: string;
}

interface Video {
  id: number;
  sub_pack_id: number;
  title: string;
  description?: string;
  video_url: string;
  duration?: string;
  order_index: number;
  views: number;
  status: string;
}

type ViewType = 'packs' | 'subpacks' | 'videos';

const CoursePacksManagement = () => {
  const { toast } = useToast();
  
  // Data states
  const [coursePacks, setCoursePacks] = useState<CoursePack[]>([]);
  const [subPacks, setSubPacks] = useState<SubPack[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [packSubPacks, setPackSubPacks] = useState<{[packId: number]: SubPack[]}>({});
  const [subPackVideos, setSubPackVideos] = useState<{[subPackId: number]: Video[]}>({});
  const [packAcceptedUsers, setPackAcceptedUsers] = useState<{[packId: number]: number}>({});
  
  // Navigation states
  const [currentView, setCurrentView] = useState<ViewType>('packs');
  const [selectedPack, setSelectedPack] = useState<CoursePack | null>(null);
  const [selectedSubPack, setSelectedSubPack] = useState<SubPack | null>(null);
  
  // Modal states
  const [isCreatePackOpen, setIsCreatePackOpen] = useState(false);
  const [isCreateSubPackOpen, setIsCreateSubPackOpen] = useState(false);
  const [isCreateVideoOpen, setIsCreateVideoOpen] = useState(false);
  
  // Edit states
  const [editingPack, setEditingPack] = useState<CoursePack | null>(null);
  const [editingSubPack, setEditingSubPack] = useState<SubPack | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursePacks();
  }, []);

  // Fetch sub-packs and videos for all packs to show correct counts
  useEffect(() => {
    const fetchAllSubPacksAndVideos = async () => {
      if (coursePacks.length === 0) return;
      
      const subPacksData: {[packId: number]: SubPack[]} = {};
      const videosData: {[subPackId: number]: Video[]} = {};
      
      for (const pack of coursePacks) {
        try {
          // Fetch sub-packs for this pack
          const subPacksResponse = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?pack_id=${pack.id}`);
          const subPacksResult = await subPacksResponse.json();
          
          if (subPacksResult.success) {
            const subPacksList = subPacksResult.data || [];
            subPacksData[pack.id] = subPacksList;
            
            // Fetch videos for each sub-pack
            for (const subPack of subPacksList) {
              try {
                const videosResponse = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPack.id}`);
                const videosResult = await videosResponse.json();
                
                if (videosResult.success) {
                  videosData[subPack.id] = videosResult.data || [];
                }
              } catch (error) {
                console.error(`Failed to fetch videos for sub-pack ${subPack.id}:`, error);
                videosData[subPack.id] = [];
              }
            }
          } else {
            subPacksData[pack.id] = [];
          }
        } catch (error) {
          console.error(`Failed to fetch sub-packs for pack ${pack.id}:`, error);
          subPacksData[pack.id] = [];
        }
      }
      
      setPackSubPacks(subPacksData);
      setSubPackVideos(videosData);
    };

    fetchAllSubPacksAndVideos();
  }, [coursePacks]);

  // Fetch accepted users count for all packs (avoid prefetching sub-packs if backend is failing)
  useEffect(() => {
    const fetchAcceptedCounts = async () => {
      const acceptedUsersData: {[packId: number]: number} = {};
      for (const pack of coursePacks) {
        try {
          const requestsResponse = await fetch(`https://spadadibattaglia.com/mom/api/requests.php?pack_id=${pack.id}&status=accepted`);
          const requestsData = await requestsResponse.json();
          acceptedUsersData[pack.id] = requestsData.success ? (requestsData.data || []).length : 0;
        } catch (error) {
          console.error(`Failed to fetch accepted users for pack ${pack.id}:`, error);
          acceptedUsersData[pack.id] = 0;
        }
      }
      setPackAcceptedUsers(acceptedUsersData);
    };

    if (coursePacks.length > 0) {
      fetchAcceptedCounts();
    }
  }, [coursePacks]);

  const fetchCoursePacks = async () => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php');
      const data = await response.json();
      if (data.success) {
        setCoursePacks(data.data || []);
      }
    } catch (error) {
        toast({
          title: "Erreur de chargement des packs",
          description: "Impossible de charger la liste des packs",
          variant: "destructive"
        });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubPacks = async (packId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?pack_id=${packId}`);
      const data = await response.json();
      if (data.success) {
        setSubPacks(data.data || []);
      }
    } catch (error) {
        toast({
          title: "Erreur de chargement des chapitres",
          description: "Impossible de charger la liste des chapitres",
          variant: "destructive"
        });
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (subPackId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://spadadibattaglia.com/mom/api/videos.php?sub_pack_id=${subPackId}`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.data || []);
      }
    } catch (error) {
        toast({
          title: "Erreur de chargement des vidéos", 
          description: "Impossible de charger la liste des vidéos",
          variant: "destructive"
        });
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handlePackSelect = (pack: CoursePack) => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://spadadibattaglia.com/mom/api/sub_packs.php?pack_id=${pack.id}`);
        if (!response.ok) {
          throw new Error(`Server error ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setSelectedPack(pack);
          setSubPacks(data.data || []);
          setCurrentView('subpacks');
        } else {
          toast({ title: 'تعذر تحميل الفصول', description: data.message || 'خطأ غير متوقع', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'خطأ في الخادم', description: 'تعذر تحميل الفصول (خطأ 500). يرجى المحاولة لاحقًا أو التحقق من الخادم.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  };

  const handleSubPackSelect = (subPack: SubPack) => {
    setSelectedSubPack(subPack);
    setCurrentView('videos');
    fetchVideos(subPack.id);
  };

  const handleBackToMain = () => {
    setCurrentView('packs');
    setSelectedPack(null);
    setSelectedSubPack(null);
  };

  const handleBackToSubPacks = () => {
    setCurrentView('subpacks');
    setSelectedSubPack(null);
  };

  // CRUD handlers
  const handleDeletePack = async (packId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return;
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: packId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Pack supprimé avec succès" });
        fetchCoursePacks();
        if (selectedPack?.id === packId) {
          handleBackToMain();
        }
      } else {
        toast({
          title: "Erreur de suppression",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubPack = async (subPackId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;
    
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subPackId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Section supprimée avec succès" });
        if (selectedPack) {
          fetchSubPacks(selectedPack.id);
        }
      } else {
        toast({
          title: "Erreur de suppression",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      const response = await fetch('https://spadadibattaglia.com/mom/api/videos.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: videoId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Vidéo supprimée avec succès" });
        if (selectedSubPack) {
          fetchVideos(selectedSubPack.id);
        }
      } else {
        toast({
          title: "Erreur de suppression",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };

  // Edit handlers
  const handleEditPack = (pack: CoursePack) => {
    setEditingPack(pack);
    setIsCreatePackOpen(true);
  };

  const handleEditSubPack = (subPack: SubPack) => {
    setEditingSubPack(subPack);
    setIsCreateSubPackOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setIsCreateVideoOpen(true);
  };

  // Modal close handlers
  const handleClosePackModal = () => {
    setIsCreatePackOpen(false);
    setEditingPack(null);
  };

  const handleCloseSubPackModal = () => {
    setIsCreateSubPackOpen(false);
    setEditingSubPack(null);
  };

  const handleCloseVideoModal = () => {
    setIsCreateVideoOpen(false);
    setEditingVideo(null);
  };

  // Success handlers
  const handlePackSuccess = () => {
    fetchCoursePacks();
  };

  const handleSubPackSuccess = () => {
    if (selectedPack) {
      fetchSubPacks(selectedPack.id);
    }
  };

  const handleVideoSuccess = () => {
    if (selectedSubPack) {
      fetchVideos(selectedSubPack.id);
    }
  };

  // Helper functions
  const getTotalVideosForPack = (packId: number) => {
    const subPackList = packSubPacks[packId] || [];
    return subPackList.reduce((total, subPack) => {
      return total + (subPackVideos[subPack.id]?.length || 0);
    }, 0);
  };

  const getVideoCountForSubPack = (subPackId: number) => {
    return subPackVideos[subPackId]?.length || 0;
  };

  if (loading && currentView === 'packs') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {currentView === 'packs' && 'Gestion des Packs Éducatifs'}
            {currentView === 'subpacks' && (
              <span 
                className={getTextAlignmentClasses(selectedPack?.title || '')}
                dir={getTextDirection(selectedPack?.title || '')}
                style={{ unicodeBidi: 'plaintext' }}
              >
                Chapitres de {selectedPack?.title}
              </span>
            )}
            {currentView === 'videos' && (
              <span 
                className={getTextAlignmentClasses(selectedSubPack?.title || '')}
                dir={getTextDirection(selectedSubPack?.title || '')}
                style={{ unicodeBidi: 'plaintext' }}
              >
                Vidéos de {selectedSubPack?.title}
              </span>
            )}
          </h2>
          
          {/* Breadcrumb */}
          {currentView !== 'packs' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button onClick={handleBackToMain} className="hover:text-foreground">
                Packs
              </button>
              {selectedPack && (
                <>
                  <span>/</span>
                  <span 
                    className={`text-foreground ${getTextAlignmentClasses(selectedPack.title)}`}
                    dir={getTextDirection(selectedPack.title)}
                    style={{ unicodeBidi: 'plaintext' }}
                  >
                    {selectedPack.title}
                  </span>
                </>
              )}
              {selectedSubPack && (
                <>
                  <span>/</span>
                  <span 
                    className={`text-foreground ${getTextAlignmentClasses(selectedSubPack.title)}`}
                    dir={getTextDirection(selectedSubPack.title)}
                    style={{ unicodeBidi: 'plaintext' }}
                  >
                    {selectedSubPack.title}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Back Button */}
          {currentView !== 'packs' && (
            <Button 
              variant="ghost" 
              onClick={currentView === 'videos' ? handleBackToSubPacks : handleBackToMain}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              {currentView === 'videos' ? 'Retour aux chapitres' : 'Retour aux packs'}
            </Button>
          )}

          {/* Add Button */}
          {currentView === 'packs' && (
            <Button className="btn-hero" onClick={() => setIsCreatePackOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">Ajouter un nouveau pack</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          )}
          
          {currentView === 'subpacks' && (
            <Button className="btn-hero" onClick={() => setIsCreateSubPackOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">Ajouter un nouveau chapitre</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          )}
          
          {currentView === 'videos' && (
            <Button className="btn-hero" onClick={() => setIsCreateVideoOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">Ajouter une nouvelle vidéo</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {currentView === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursePacks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun pack éducatif disponible</p>
            </div>
          ) : (
            coursePacks.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                subPackCount={packSubPacks[pack.id]?.length || 0}
                totalVideos={getTotalVideosForPack(pack.id)}
                acceptedUsers={packAcceptedUsers[pack.id] || 0}
                onSelect={handlePackSelect}
                onEdit={handleEditPack}
                onDelete={handleDeletePack}
              />
            ))
          )}
        </div>
      )}

      {currentView === 'subpacks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement en cours...</p>
            </div>
          ) : subPacks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun chapitre dans ce pack</p>
            </div>
          ) : (
            subPacks.map((subPack, index) => (
              <SubPackCard
                key={subPack.id}
                subPack={subPack}
                videoCount={getVideoCountForSubPack(subPack.id)}
                index={index}
                onSelect={handleSubPackSelect}
                onEdit={handleEditSubPack}
                onDelete={handleDeleteSubPack}
                packImage={selectedPack?.image_url}
              />
            ))
          )}
        </div>
      )}

      {currentView === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement en cours...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucune vidéo dans ce chapitre</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                onEdit={handleEditVideo}
                onDelete={handleDeleteVideo}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <CreatePackModal
        isOpen={isCreatePackOpen}
        onClose={handleClosePackModal}
        onSuccess={handlePackSuccess}
        editingPack={editingPack}
      />

      <CreateSubPackModal
        isOpen={isCreateSubPackOpen}
        onClose={handleCloseSubPackModal}
        onSuccess={handleSubPackSuccess}
        packId={selectedPack?.id || 0}
        editingSubPack={editingSubPack}
      />

      <CreateVideoModal
        isOpen={isCreateVideoOpen}
        onClose={handleCloseVideoModal}
        onSuccess={handleVideoSuccess}
        subPackId={selectedSubPack?.id || 0}
        editingVideo={editingVideo}
      />
    </div>
  );
};

export default CoursePacksManagement;