import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chapter from "./pages/Chapter";
import AdminDashboard from "./pages/AdminDashboard";
import CoursePacks from "./pages/CoursePacks";
import CourseViewer from "./pages/CourseViewer";
import Reviews from "./pages/Reviews";
import Workshops from "./pages/Workshops";
import WorkshopViewer from "./pages/WorkshopViewer";
import ChallengeViewer from "./pages/ChallengeViewer";
import Challenges from "./pages/Challenges";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import BlogEditor from "./pages/BlogEditor";
import PackDetail from "./pages/PackDetail";
import CourseDetail from "./pages/CourseDetail";
import CapsulesManagement from "./pages/CapsulesManagement";
import NotFound from "./pages/NotFound";
import ChallengesManagement from "./pages/ChallengesManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pack/:id" element={<PackDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/chapter/:packageId" element={
              <ProtectedRoute>
                <CourseViewer />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/capsules" element={<CapsulesManagement />} />
            <Route path="/admin/challenges" element={<ChallengesManagement />} />
            <Route path="/courses" element={
              <ProtectedRoute>
                <CoursePacks />
              </ProtectedRoute>
            } />
            <Route path="/course-viewer/:packageId" element={
              <ProtectedRoute>
                <CourseViewer />
              </ProtectedRoute>
            } />
            <Route path="/course/:packageId" element={<CourseDetail />} />
            <Route path="/reviews" element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            } />
            <Route path="/workshops" element={
              <ProtectedRoute>
                <Workshops />
              </ProtectedRoute>
            } />
            <Route path="/workshop/:workshopId" element={
              <ProtectedRoute>
                <WorkshopViewer />
              </ProtectedRoute>
            } />
            <Route path="/challenges" element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            } />
            <Route path="/challenge/:challengeId" element={
              <ProtectedRoute>
                <ChallengeViewer />
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            } />
            <Route path="/blog/:id" element={
              <ProtectedRoute>
                <BlogDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog/new" element={<BlogEditor />} />
            <Route path="/admin/blog/edit/:id" element={<BlogEditor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
