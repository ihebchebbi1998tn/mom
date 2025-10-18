import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from "lucide-react";

const Login = () => {
  return (
    <section id="login" className="py-20 bg-gradient-to-b from-accent to-secondary-soft">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              فضاء العضوات
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            سجلي دخولك للوصول إلى دوراتك وتتبع تقدمك، أو انضمي إلينا لتبدئي رحلة التعلم
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login Card */}
          <Card className="card-cute p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-soft to-secondary-soft rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-center text-foreground mb-6">
              تسجيل الدخول
            </h3>

            <form className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground">البريد الإلكتروني</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="أدخلي بريدك الإلكتروني"
                  className="mt-1 text-right"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-foreground">كلمة المرور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="أدخلي كلمة المرور"
                  className="mt-1 text-right"
                />
              </div>

              <Button className="btn-hero w-full rounded-full py-3 mt-6">
                دخول إلى حسابي
              </Button>
            </form>

            <div className="text-center mt-4">
              <a href="#" className="text-primary hover:text-primary-light transition-colors text-sm">
                نسيت كلمة المرور؟
              </a>
            </div>
          </Card>

          {/* Registration Card */}
          <Card className="card-cute p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-soft to-primary-soft rounded-full flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-secondary" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-center text-foreground mb-6">
              انضمي إلينا
            </h3>

            <div className="text-center mb-6">
              <p className="text-muted-foreground leading-relaxed">
                هل أنت جديدة في أكاديمية الأم؟ ابدئي رحلتك التعليمية معنا اليوم
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary-soft to-secondary-soft rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">✨ ما ستحصلين عليه:</h4>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• وصول لجميع الدورات التعليمية</li>
                  <li>• شهادات إتمام معتمدة</li>
                  <li>• انضمام لمجتمع الأمهات المتعلمات</li>
                  <li>• دعم تقني مستمر</li>
                </ul>
              </div>

              <Button className="btn-secondary w-full rounded-full py-3">
                سجلي الآن مجاناً
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Login;