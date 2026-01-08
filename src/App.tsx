import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Dashboard from "./pages/Dashboard";
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
import Admin from "./pages/Admin";
import AdminPlayers from "./pages/AdminPlayers";
import AdminTeams from "./pages/AdminTeams";
import AdminNotebook from "./pages/AdminNotebook";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminMessaging from "./pages/AdminMessaging";
import AdminAutomations from "./pages/AdminAutomations";
import AdminContent from "./pages/AdminContent";
import AdminGamification from "./pages/AdminGamification";
import AdminBookings from "./pages/AdminBookings";
import AdminProSwings from "./pages/AdminProSwings";
import AdminTeamsOverview from "./pages/AdminTeamsOverview";
import AdminTransactions from "./pages/AdminTransactions";
import AdminDrills from "./pages/AdminDrills";
import DrillLibrary from "./pages/DrillLibrary";
import MyProgress from "./pages/MyProgress";
import Calendar from "./pages/Calendar";
import KnowledgeBase from "./pages/KnowledgeBase";
import Team from "./pages/Team";
import Brain from "./pages/Brain";
import ThankYou from "./pages/ThankYou";
import Offer from "./pages/Offer";
import Order from "./pages/Order";
import OrderStarter from "./pages/OrderStarter";
import OrderHybrid from "./pages/OrderHybrid";
import OrderWinter from "./pages/OrderWinter";
import OrderTeam from "./pages/OrderTeam";
import WelcomeAI from "./pages/WelcomeAI";
import UpgradeHybrid from "./pages/UpgradeHybrid";
import HybridWelcome from "./pages/HybridWelcome";
import Teams from "./pages/coach/Teams";
import TeamDetail from "./pages/coach/TeamDetail";
import AdminWebhookEvents from "./pages/AdminWebhookEvents";
import TeamInvites from "./pages/coach/TeamInvites";
import TeamReports from "./pages/coach/TeamReports";
import TeamSettings from "./pages/coach/TeamSettings";
import TeamJoin from "./pages/TeamJoin";
import AthleteProfileDemo from "./pages/AthleteProfileDemo";

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
          <Route path="/offer/:plan" element={<Offer />} />
          <Route path="/order/:plan" element={<Order />} />
          <Route path="/order/starter" element={<OrderStarter />} />
          <Route path="/order/hybrid" element={<OrderHybrid />} />
          <Route path="/order/winter" element={<OrderWinter />} />
          <Route path="/order/team" element={<OrderTeam />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/team/join" element={<TeamJoin />} />
          <Route path="/athlete-demo" element={<AthleteProfileDemo />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
          <Route path="/analyze/:id" element={<ProtectedRoute><AnalyzeResults /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/my-progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/brain" element={<ProtectedRoute><Brain /></ProtectedRoute>} />
          <Route path="/drills" element={<ProtectedRoute><DrillLibrary /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Coach routes */}
          <Route path="/coach" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="/coach/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="/coach/teams/:teamId" element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} />
          <Route path="/coach/teams/:teamId/invites" element={<ProtectedRoute><TeamInvites /></ProtectedRoute>} />
          <Route path="/coach/teams/:teamId/reports" element={<ProtectedRoute><TeamReports /></ProtectedRoute>} />
          <Route path="/coach/teams/:teamId/settings" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/players" element={<ProtectedRoute><AdminPlayers /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute><AdminTeams /></ProtectedRoute>} />
          <Route path="/admin/drills" element={<ProtectedRoute><AdminDrills /></ProtectedRoute>} />
          <Route path="/admin/messaging" element={<ProtectedRoute><AdminMessaging /></ProtectedRoute>} />
          <Route path="/admin/automations" element={<ProtectedRoute><AdminAutomations /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute><AdminContent /></ProtectedRoute>} />
          <Route path="/admin/notebook" element={<ProtectedRoute><AdminNotebook /></ProtectedRoute>} />
          <Route path="/admin/gamification" element={<ProtectedRoute><AdminGamification /></ProtectedRoute>} />
          <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/pro-swings" element={<ProtectedRoute><AdminProSwings /></ProtectedRoute>} />
          <Route path="/admin/teams-overview" element={<ProtectedRoute><AdminTeamsOverview /></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
          <Route path="/admin/webhook-events" element={<ProtectedRoute><AdminWebhookEvents /></ProtectedRoute>} />
          
          {/* Public success page */}
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/welcome-ai" element={<WelcomeAI />} />
          <Route path="/hybrid-welcome" element={<ProtectedRoute><HybridWelcome /></ProtectedRoute>} />
          <Route path="/upgrade-hybrid" element={<ProtectedRoute><UpgradeHybrid /></ProtectedRoute>} />
          <Route path="/facility" element={<Facility />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
