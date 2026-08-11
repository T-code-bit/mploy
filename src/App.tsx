import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import CVBuilder from "./pages/CVBuilder";
import Academy from "./pages/Academy";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import EmployerPortal from "./pages/EmployerPortal";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import SsoCallback from "./pages/SsoCallback";
import Admin from "./pages/Admin";
import Reviews from "./pages/Reviews";
import CookieConsent from "./components/CookieConsent";
import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";
import CareerCoachChatbot from "./components/CareerCoachChatbot";
import PromoBanners from "./components/PromoBanners";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sso-callback" element={<SsoCallback />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>
            } />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/cv-builder" element={
              <ProtectedRoute><CVBuilder /></ProtectedRoute>
            } />
            <Route path="/academy" element={<Academy />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/employer" element={
              <ProtectedRoute requiredRole="employer"><EmployerPortal /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
          <BackToTop />
          <CareerCoachChatbot />
          <PromoBanners />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
