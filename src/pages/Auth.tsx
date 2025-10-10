import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, UserPlus, ArrowRight, Eye, EyeOff, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { z } from "zod";

// Country codes data
const countryCodes = [
  { value: "+216", label: "Tunisia (+216)", flag: "🇹🇳" },
  { value: "+33", label: "France (+33)", flag: "🇫🇷" },
  { value: "+49", label: "Germany (+49)", flag: "🇩🇪" },
  { value: "+971", label: "UAE (+971)", flag: "🇦🇪" },
  { value: "+965", label: "Kuwait (+965)", flag: "🇰🇼" },
  { value: "+966", label: "Saudi Arabia (+966)", flag: "🇸🇦" },
  { value: "+1", label: "USA (+1)", flag: "🇺🇸" },
  { value: "+44", label: "UK (+44)", flag: "🇬🇧" },
];

// Validation schemas
const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "الاسم يجب أن يكون على الأقل حرفين" }).max(100, { message: "الاسم يجب أن يكون أقل من 100 حرف" }),
  email: z.string().trim().email({ message: "البريد الإلكتروني غير صحيح" }).max(255, { message: "البريد الإلكتروني طويل جداً" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون على الأقل 6 أحرف" }),
  countryCode: z.string().min(1, { message: "اختاري رمز البلد" }),
  phoneNumber: z.string().trim().min(8, { message: "رقم الهاتف قصير جداً" }).max(15, { message: "رقم الهاتف طويل جداً" }).regex(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط" })
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, isAuthenticated, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+216");
  const [phoneError, setPhoneError] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [signupFormData, setSignupFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Validate form in real-time
  useEffect(() => {
    const isValid = 
      signupFormData.name.trim().length >= 2 &&
      signupFormData.email.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupFormData.email) &&
      signupFormData.phoneNumber.length >= 6 &&
      /^\d+$/.test(signupFormData.phoneNumber) &&
      signupFormData.password.length >= 6;
    
    setFormValid(isValid);
  }, [signupFormData]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignupFormData(prev => ({ ...prev, phoneNumber: value }));
    
    if (value.length > 0 && value.length < 6) {
      setPhoneError("رقم الهاتف قصير جداً");
    } else if (value.length > 0 && !/^\d+$/.test(value)) {
      setPhoneError("رقم الهاتف يجب أن يحتوي على أرقام فقط");
    } else {
      setPhoneError("");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Basic client-side validation
    if (!email || !email.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال البريد الإلكتروني",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال كلمة المرور",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const result = await login(email.trim(), password);
    
    if (result.success) {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في أكاديمية الأم",
      });
      // Navigation is handled by useEffect
    } else {
      // Display detailed error message from API
      const errorMessage = result.message || "تحقق من البيانات المدخلة";
      const fieldName = (result as any).field;
      
      let title = "خطأ في تسجيل الدخول";
      if (fieldName === 'email') {
        title = "خطأ في البريد الإلكتروني";
      } else if (fieldName === 'password') {
        title = "خطأ في كلمة المرور";
      }
      
      toast({
        title,
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const name = (formData.get('name') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const password = formData.get('password') as string || '';
    const countryCode = formData.get('countryCode') as string || '+216';
    const phoneNumber = (formData.get('phoneNumber') as string || '').trim();
    
    // Validate form data with Zod
    try {
      const validatedData = signupSchema.parse({
        name,
        email,
        password,
        countryCode,
        phoneNumber
      });
      
      // Combine country code with phone number
      const fullPhoneNumber = validatedData.countryCode + validatedData.phoneNumber;
      
      const result = await register(validatedData.name, validatedData.email, validatedData.password, fullPhoneNumber);
      
      if (result.success) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "مرحباً بك في أكاديمية الأم",
        });
        // Navigation is handled by useEffect
      } else {
        // Display detailed error message from API
        const errorMessage = result.message || "حاول مرة أخرى";
        const fieldName = (result as any).field;
        
        let title = "خطأ في إنشاء الحساب";
        if (fieldName === 'email') {
          title = "خطأ في البريد الإلكتروني";
        } else if (fieldName === 'password') {
          title = "خطأ في كلمة المرور";
        } else if (fieldName === 'name') {
          title = "خطأ في الاسم";
        } else if (fieldName === 'phone') {
          title = "خطأ في رقم الهاتف";
        }
        
        toast({
          title,
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        const fieldPath = firstError.path[0];
        
        let title = "خطأ في البيانات المدخلة";
        if (fieldPath === 'email') {
          title = "خطأ في البريد الإلكتروني";
        } else if (fieldPath === 'password') {
          title = "خطأ في كلمة المرور";
        } else if (fieldPath === 'name') {
          title = "خطأ في الاسم";
        } else if (fieldPath === 'phoneNumber') {
          title = "خطأ في رقم الهاتف";
        } else if (fieldPath === 'countryCode') {
          title = "خطأ في رمز البلد";
        }
        
        toast({
          title,
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "خطأ غير متوقع",
          description: "حاول مرة أخرى",
          variant: "destructive"
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-accent to-secondary-soft py-12">
      <div className="container mx-auto px-4">
        {/* Header Text */}
        <div className="text-center mb-12">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            سجلي دخولك للوصول إلى دوراتك وتتبع تقدمك، أو انضمي إلينا لتبدئي رحلة التعلم
          </p>
        </div>

        {/* Desktop View - Both cards side by side */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login Card - First on desktop */}
          <Card className="card-cute p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-soft to-secondary-soft rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-center text-foreground mb-6">
              تسجيل الدخول
            </h3>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-foreground">البريد الإلكتروني</Label>
                <Input 
                  id="login-email" 
                  name="email"
                  type="email" 
                  placeholder="أدخلي بريدك الإلكتروني"
                  className="mt-1 text-left"
                  dir="ltr"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="login-password" className="text-foreground">كلمة المرور</Label>
                <div className="relative">
                  <Input 
                    id="login-password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخلي كلمة المرور"
                    className="mt-1 text-left pr-10"
                    dir="ltr"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 mt-[2px]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="btn-hero w-full rounded-full py-3 mt-6" disabled={isLoading}>
                {isLoading ? "جاري تسجيل الدخول..." : "دخول إلى حسابي"}
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </form>


            <div className="mt-6 text-center">
              <p className="text-muted-foreground leading-relaxed text-sm">
                مرحباً بعودتك! سجلي الدخول للوصول إلى دوراتك وتتبع تقدمك في رحلة التعلم
              </p>
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

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <Label htmlFor="desktop-signup-name" className="text-foreground">الاسم الكامل</Label>
                <Input 
                  id="desktop-signup-name" 
                  name="name"
                  type="text" 
                  placeholder="أدخلي اسمك الكامل"
                  className="mt-1 text-left"
                  dir="ltr"
                  value={signupFormData.name}
                  onChange={(e) => setSignupFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="desktop-signup-email" className="text-foreground">البريد الإلكتروني</Label>
                <Input 
                  id="desktop-signup-email" 
                  name="email"
                  type="email" 
                  placeholder="أدخلي بريدك الإلكتروني"
                  className="mt-1 text-left"
                  dir="ltr"
                  value={signupFormData.email}
                  onChange={(e) => setSignupFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="desktop-signup-phone" className="text-foreground">رقم الهاتف *</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          id="desktop-signup-phone" 
                          name="phoneNumber"
                          type="tel" 
                          placeholder="ادخلي رقم الهاتف"
                          className={`pl-10 text-left ${phoneError ? 'border-red-500' : ''}`}
                          dir="ltr"
                          value={signupFormData.phoneNumber}
                          onChange={handlePhoneChange}
                          required
                        />
                      </div>
                      <Select name="countryCode" defaultValue="+216" value={selectedCountryCode} onValueChange={setSelectedCountryCode} required>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              <div className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.value}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {phoneError && (
                      <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                    )}
              </div>
              
              <div>
                <Label htmlFor="desktop-signup-password" className="text-foreground">كلمة المرور</Label>
                <div className="relative">
                  <Input 
                    id="desktop-signup-password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="اختاري كلمة مرور قوية"
                    className="mt-1 text-left pr-10"
                    dir="ltr"
                    value={signupFormData.password}
                    onChange={(e) => setSignupFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 mt-[2px]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="btn-secondary w-full rounded-full py-3 mt-6" disabled={isLoading || !formValid}>
                {isLoading ? "جاري إنشاء الحساب..." : "سجلي الآن مجاناً"}
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-muted-foreground leading-relaxed text-xs">
                بالتسجيل، أنت توافقين على شروط الخدمة وسياسة الخصوصية
              </p>
            </div>
          </Card>
        </div>

        {/* Mobile View - Switching cards */}
        <div className="md:hidden max-w-md mx-auto">
          <div className="relative overflow-hidden">
            {/* Login Card */}
            <div className={`transition-all duration-500 ease-in-out transform ${
              isLogin ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute inset-0'
            }`}>
              <Card className="card-cute p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-soft to-secondary-soft rounded-full flex items-center justify-center">
                    <LogIn className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-foreground mb-6">
                  تسجيل الدخول
                </h3>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="mobile-login-email" className="text-foreground">البريد الإلكتروني</Label>
                    <Input 
                      id="mobile-login-email" 
                      name="email"
                      type="email" 
                      placeholder="أدخلي بريدك الإلكتروني"
                      className="mt-1 text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile-login-password" className="text-foreground">كلمة المرور</Label>
                    <div className="relative">
                      <Input 
                        id="mobile-login-password" 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخلي كلمة المرور"
                        className="mt-1 text-left pr-10"
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 mt-[2px]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="btn-hero w-full rounded-full py-3 mt-6" disabled={isLoading}>
                    {isLoading ? "جاري تسجيل الدخول..." : "دخول إلى حسابي"}
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                </form>

              </Card>
            </div>

            {/* Signup Card */}
            <div className={`transition-all duration-500 ease-in-out transform ${
              !isLogin ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute inset-0'
            }`}>
              <Card className="card-cute p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-soft to-primary-soft rounded-full flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-foreground mb-6">
                  انضمي إلينا
                </h3>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="mobile-signup-name" className="text-foreground">الاسم الكامل</Label>
                    <Input 
                      id="mobile-signup-name" 
                      name="name"
                      type="text" 
                      placeholder="أدخلي اسمك الكامل"
                      className="mt-1 text-left"
                      dir="ltr"
                      value={signupFormData.name}
                      onChange={(e) => setSignupFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile-signup-email" className="text-foreground">البريد الإلكتروني</Label>
                    <Input 
                      id="mobile-signup-email" 
                      name="email"
                      type="email" 
                      placeholder="أدخلي بريدك الإلكتروني"
                      className="mt-1 text-left"
                      dir="ltr"
                      value={signupFormData.email}
                      onChange={(e) => setSignupFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile-signup-phone" className="text-foreground">رقم الهاتف *</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            id="mobile-signup-phone" 
                            name="phoneNumber"
                            type="tel" 
                            placeholder="ادخلي رقم الهاتف"
                            className={`pl-10 text-left ${phoneError ? 'border-red-500' : ''}`}
                            dir="ltr"
                            value={signupFormData.phoneNumber}
                            onChange={handlePhoneChange}
                            required
                          />
                        </div>
                        <Select name="countryCode" defaultValue="+216" value={selectedCountryCode} onValueChange={setSelectedCountryCode} required>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                <div className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.value}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                      )}
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile-signup-password" className="text-foreground">كلمة المرور</Label>
                    <div className="relative">
                      <Input 
                        id="mobile-signup-password" 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="اختاري كلمة مرور قوية"
                        className="mt-1 text-left pr-10"
                        dir="ltr"
                        value={signupFormData.password}
                        onChange={(e) => setSignupFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 mt-[2px]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="btn-secondary w-full rounded-full py-3 mt-6" disabled={isLoading || !formValid}>
                    {isLoading ? "جاري إنشاء الحساب..." : "سجلي الآن مجاناً"}
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                </form>
              </Card>
            </div>
          </div>

          {/* Switch Text */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              {isLogin ? (
                <>
                  جديدة في أكاديمية الأم؟{' '}
                  <button 
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:text-primary-light transition-colors underline font-medium"
                  >
                    سجلي الآن
                  </button>
                </>
              ) : (
                <>
                  لديك حساب بالفعل؟{' '}
                  <button 
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:text-primary-light transition-colors underline font-medium"
                  >
                    سجلي الدخول
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Auth;