import { useState, useEffect, createContext, useContext, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, GraduationCap, LayoutDashboard, Brain, Target, BarChart3,
  FileText, LogOut, ChevronRight, Menu, X, Library, Users
} from 'lucide-react';
import { api } from './lib/api';
import { cn } from './lib/utils';
import type { AuthUser } from './lib/types';

// Pages
const Dashboard = lazy(() => import('./pages/learner-dashboard'));
const QuizGenerator = lazy(() => import('./pages/quiz-generator'));
const CompetencyProfile = lazy(() => import('./pages/competency-profile'));
const CourseCatalog = lazy(() => import('./pages/course-catalog'));
const QuizTake = lazy(() => import('./pages/quiz-take'));
const QuizSession = lazy(() => import('./pages/quiz-session'));
const QuizResults = lazy(() => import('./pages/quiz-results'));
const AdminAnalytics = lazy(() => import('./pages/admin-analytics'));
const AdminUsers = lazy(() => import('./pages/admin-users'));
const LearningPaths = lazy(() => import('./pages/learning-paths'));
const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const OnboardingPage = lazy(() => import('./pages/onboarding'));
const AIChatbox = lazy(() => import('./components/ai-chatbox'));

// Auth Context
interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    setUser(data.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Navigation items by role
function getNavItems(role: string) {
  const base = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/competency-profile", icon: Target, label: "My Profile" },
    { path: "/learning-paths", icon: BookOpen, label: "Learning Paths" },
    { path: "/courses", icon: Library, label: "iGOT Courses" },
    { path: "/quizzes", icon: FileText, label: "Quizzes" },
  ];

  if (role === "trainer" || role === "admin" || role === "hr") {
    base.push({ path: "/quiz/generate", icon: Brain, label: "AI Quiz Generator" });
  }

  if (role === "admin" || role === "hr") {
    base.push({ path: "/admin/users", icon: Users, label: "User Management" });
    base.push({ path: "/admin/analytics", icon: BarChart3, label: "Admin Analytics" });
  }

  return base;
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = useMemo(() => getNavItems(user?.role || "learner"), [user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-72 h-screen bg-gradient-to-b from-[#0a1628] to-[#0F204C] text-white flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="h-10 w-10 bg-gradient-to-br from-[#FF9933] to-[#e68a2e] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF9933]/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">RTFM_SkillOS</h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">AI Learning Platform</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ml-auto lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-300 border border-orange-500/20 shadow-sm shadow-orange-500/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-orange-400" : "text-slate-400")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto text-orange-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {user && (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role} • {user.organization}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <div className="px-4 pb-4">
          <div className="text-[10px] text-slate-500 text-center">
            MoSPI • Official Statistics • v2.0
          </div>
        </div>
      </aside>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce onboarding for new users, except when they are already on the onboarding page
  if (user.onboardingCompleted === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading RTFM_SkillOS...</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-slate-900">RTFM_SkillOS</span>
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/competency-profile" element={<CompetencyProfile />} />
              <Route path="/learning-paths" element={<LearningPaths />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/quizzes" element={<QuizTake />} />
              <Route path="/quiz/:id/session" element={<QuizSession />} />
              <Route path="/quiz/generate" element={<QuizGenerator />} />
              <Route path="/quiz/:id/results" element={<QuizResults />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      {/* AI Chatbox - floating */}
      <Suspense fallback={null}>
        <AIChatbox />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
