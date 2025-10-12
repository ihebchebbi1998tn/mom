import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, CheckCircle2, ArrowLeft, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Mock video data for each chapter
const chapterVideos: Record<string, Array<{id: string, title: string, duration: string, completed?: boolean}>> = {
  'سيطرة عالغضب': [
    { id: '1', title: 'مقدمة في إدارة الغضب', duration: '15:30' },
    { id: '2', title: 'أسباب الغضب وتأثيره', duration: '22:15' },
    { id: '3', title: 'تقنيات التهدئة الفورية', duration: '18:45', completed: true },
    { id: '4', title: 'بناء عادات إيجابية', duration: '25:20' },
    { id: '5', title: 'التطبيق العملي', duration: '20:10' }
  ],
  'دراسة': [
    { id: '1', title: 'أساسيات التعلم الفعال', duration: '16:40' },
    { id: '2', title: 'تنظيم الوقت للدراسة', duration: '19:25' },
    { id: '3', title: 'تقنيات الحفظ والمراجعة', duration: '21:50', completed: true },
    { id: '4', title: 'التعامل مع صعوبات التعلم', duration: '24:15' },
    { id: '5', title: 'خلق بيئة دراسية مثالية', duration: '17:30' }
  ],
  'تحدي الحياة 21 يوم': [
    { id: '1', title: 'مقدمة التحدي وأهدافه', duration: '12:20' },
    { id: '2', title: 'الأسبوع الأول: بناء العادات', duration: '28:45' },
    { id: '3', title: 'الأسبوع الثاني: التطوير', duration: '26:30' },
    { id: '4', title: 'الأسبوع الثالث: الإتقان', duration: '23:15' },
    { id: '5', title: 'تقييم النتائج والاستمرارية', duration: '18:50' }
  ],
  'ثقة في النفس': [
    { id: '1', title: 'فهم الثقة بالنفس', duration: '14:30' },
    { id: '2', title: 'التخلص من المعتقدات السلبية', duration: '22:40' },
    { id: '3', title: 'بناء الثقة الداخلية', duration: '25:15' },
    { id: '4', title: 'مواجهة التحديات بثقة', duration: '20:25' },
    { id: '5', title: 'المحافظة على الثقة', duration: '16:35' }
  ],
  'تربية جنسية': [
    { id: '1', title: 'أهمية التربية الجنسية', duration: '18:20' },
    { id: '2', title: 'التحدث مع الأطفال حسب العمر', duration: '24:50' },
    { id: '3', title: 'الحماية من التحرش', duration: '26:15' },
    { id: '4', title: 'بناء الوعي الصحي', duration: '21:40' },
    { id: '5', title: 'الإجابة على الأسئلة الصعبة', duration: '19:30' }
  ],
  'مراهقة': [
    { id: '1', title: 'فهم مرحلة المراهقة', duration: '17:45' },
    { id: '2', title: 'التغيرات الجسدية والنفسية', duration: '23:30' },
    { id: '3', title: 'التواصل مع المراهق', duration: '25:20' },
    { id: '4', title: 'وضع الحدود المناسبة', duration: '21:15' },
    { id: '5', title: 'دعم المراهق في قراراته', duration: '18:40' }
  ]
};

const Chapter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { packageData } = location.state || {};

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">خطأ في تحميل البيانات</h2>
          <Button onClick={() => navigate('/dashboard')} className="btn-hero">
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {packageData.title}
              </h1>
              <p className="text-muted-foreground">اختاري الفصل للبدء</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="btn-outline"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Chapters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {packageData.chapters.map((chapterTitle: string, idx: number) => {
            const videos = chapterVideos[chapterTitle] || [];
            const completedVideos = videos.filter(v => v.completed).length;
            const totalVideos = videos.length;
            const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

            return (
              <Card key={idx} className="card-elegant overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-primary-light p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Video className="w-8 h-8" />
                    <div className="text-sm opacity-90">
                      {totalVideos} فيديو
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{chapterTitle}</h3>
                  <div className="text-sm opacity-90">
                    {completedVideos} من {totalVideos} مكتمل
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {video.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Play className="w-5 h-5 text-primary" />
                          )}
                          <div>
                            <div className="font-medium text-foreground text-sm">
                              {video.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant={video.completed ? "outline" : "default"}
                          className={video.completed ? "border-green-500 text-green-600" : "btn-hero"}
                        >
                          {video.completed ? "مراجعة" : "مشاهدة"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Package Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-elegant p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {packageData.chapters.length}
            </div>
            <div className="text-muted-foreground">فصول متاحة</div>
          </Card>
          
          <Card className="card-elegant p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {packageData.chapters.reduce((total: number, chapter: string) => 
                total + (chapterVideos[chapter]?.length || 0), 0
              )}
            </div>
            <div className="text-muted-foreground">فيديو تعليمي</div>
          </Card>
          
          <Card className="card-elegant p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <div className="text-muted-foreground">وصول مدى الحياة</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chapter;