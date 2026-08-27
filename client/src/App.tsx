import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, GraduationCap, LayoutDashboard, Brain, Target, BarChart3,
  FileText, LogOut, User, ChevronRight, Menu, X, MessageCircle, Sparkles,
  Library, Settings
} from 'lucide-react';
import { api } from './lib/api';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/learner-dashboard';
import QuizGenerator from './pages/quiz-generator';
import CompetencyProfile from './pages/competency-profile';
import CourseCatalog from './pages/course-catalog';
import QuizTake from './pages/quiz-take';
import QuizResults from './pages/quiz-results';
import AdminAnalytics from './pages/admin-analytics';
import LearningPaths from './pages/learning-paths';
import LoginPage from './pages/login';
import AIChatbox from './components/ai-chatbox';

// Auth Context
interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

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

  if (role === "supervisor" || role === "admin" || role === "coordinator") {
    base.push({ path: "/quiz/generate", icon: Brain, label: "AI Quiz Generator" });
  }

  if (role === "admin" || role === "coordinator") {
    base.push({ path: "/admin/analytics", icon: BarChart3, label: "Admin Analytics" });
  }

  return base;
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role || "student");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
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
          <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">SkillOS</h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">AI Learning Platform</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden p-1 hover:bg-white/10 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
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
                <p className="text-xs text-slate-400 capitalize">{user.role === "student" ? "Learner" : user.role} • {user.organization}</p>
              </div>
            </div>
            <button
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading SkillOS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-slate-900">SkillOS</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/competency-profile" element={<CompetencyProfile />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/quizzes" element={<QuizTake />} />
            <Route path="/quiz/generate" element={<QuizGenerator />} />
            <Route path="/quiz/:id/results" element={<QuizResults />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Routes>
        </main>
      </div>
      {/* AI Chatbox - floating */}
      <AIChatbox />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
