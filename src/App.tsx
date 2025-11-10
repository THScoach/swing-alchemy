import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Analyze from "./pages/Analyze";
import AnalyzeResults from "./pages/AnalyzeResults";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import PricingPage from "./pages/PricingPage";
import About from "./pages/About";
import Facility from "./pages/Facility";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Store from "./pages/Store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/facility" element={<Facility />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
          <Route path="/analyze/:id" element={<ProtectedRoute><AnalyzeResults /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
