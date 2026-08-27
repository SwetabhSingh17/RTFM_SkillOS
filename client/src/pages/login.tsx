import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2, Shield, BookOpen, Brain, BarChart3 } from 'lucide-react';
import { useAuth } from '../App';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
    setLoading(true);
    try {
      await login(user, pass);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a1628] via-[#0F204C] to-[#1a3366] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">RTFM_SkillOS</h1>
              <p className="text-xs text-slate-400 tracking-wider uppercase">AI-Enabled Learning Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Empowering India's
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Statistical Workforce
            </span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            AI-powered competency assessment, personalized learning paths, and seamless iGOT Karmayogi integration for India's Official Statistical System.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { icon: Brain, label: "AI-Powered Assessment", desc: "Intelligent competency gap analysis" },
            { icon: BookOpen, label: "iGOT Integration", desc: "Karmayogi course recommendations" },
            { icon: Shield, label: "Secure & Scalable", desc: "Government-grade security" },
            { icon: BarChart3, label: "Analytics Dashboard", desc: "Workforce intelligence insights" },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <item.icon className="h-5 w-5 text-orange-400 mb-2" />
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400">
          <span>Ministry of Statistics & Programme Implementation</span>
          <span>•</span>
          <span>SIH 2026 — Problem Statement 26101</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">RTFM_SkillOS</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to your RTFM_SkillOS account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0F204C] to-[#1a3366] hover:from-[#1a3366] hover:to-[#0F204C] text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Quick login buttons for demo */}
          <div className="mt-6">
            <p className="text-xs text-slate-400 text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Admin", user: "admin", pass: "admin123", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
                { label: "Coordinator", user: "coordinator", pass: "coord123", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                { label: "Trainer", user: "trainer", pass: "train123", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                { label: "Learner", user: "learner", pass: "learn123", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
              ].map((acc) => (
                <button
                  key={acc.user}
                  onClick={() => quickLogin(acc.user, acc.pass)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
