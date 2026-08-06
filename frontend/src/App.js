import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingScreen from "@/components/LoadingScreen";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollTopButton from "@/components/ScrollTopButton";
import PublicLayout from "@/components/PublicLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import JoinNetwork from "@/pages/JoinNetwork";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import Legal from "@/pages/Legal";
import MaintenanceGate from "@/components/MaintenanceGate";
import { useAuth } from "@/context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function FloatingUI() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (<><WhatsAppButton /><ScrollTopButton /></>);
}

const withLayout = (Page) => (
  <MaintenanceGate>
    <PublicLayout>
      <Page />
    </PublicLayout>
  </MaintenanceGate>
);

function App() {
  return (
    <BrowserRouter>
      <LoadingScreen />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={withLayout(Home)} />
        <Route path="/about" element={withLayout(About)} />
        <Route path="/projects" element={withLayout(Projects)} />
        <Route path="/projects/:slug" element={withLayout(ProjectDetail)} />
        <Route path="/join" element={withLayout(JoinNetwork)} />
        <Route path="/careers" element={withLayout(Careers)} />
        <Route path="/contact" element={withLayout(Contact)} />
        <Route path="/privacy" element={withLayout(() => <Legal type="privacy" />)} />
        <Route path="/terms" element={withLayout(() => <Legal type="terms" />)} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingUI />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
