import { useState, useEffect } from 'react';
import { Target, Award, BookOpen, Clock, Activity, TrendingUp, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getLearnerAnalytics(user.id).catch(() => null),
      api.getGaps(user.id).catch(() => null),
      api.getCourses().catch(() => []),
    ]).then(([analyticsData, gapsData, coursesData]) => {
      setAnalytics(analyticsData);
      setGaps(gapsData);
      setCourses(coursesData);
    }).finally(() => setLoading(false));
  }, [user]);

  // Prepare radar chart data from domain summary
  const radarData = gaps?.domainSummary?.map((d: any) => ({
    domain: d.domain.replace(' Competencies', '').replace('Behavioural & ', ''),
    current: d.averageCurrentLevel,
    target: 80,
  })) || [
    { domain: 'Statistical', current: 58, target: 80 },
    { domain: 'Technical', current: 38, target: 80 },
    { domain: 'Governance', current: 33, target: 80 },
    { domain: 'Managerial', current: 50, target: 80 },
  ];

  const stats = analytics ? [
    { label: "Learning Hours", value: `${analytics.learningHours}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Competency Gap", value: `${analytics.competency.averageGapPercent}%`, icon: Target, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Courses Done", value: `${analytics.courses.completed}`, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Badges Earned", value: `${analytics.badges}`, icon: Award, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ] : [
    { label: "Learning Hours", value: "—", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Competency Gap", value: "—", icon: Target, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Courses Done", value: "—", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Badges Earned", value: "—", icon: Award, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  const topGaps = (gaps?.gaps || []).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Learner'}</span>
          </h1>
          <p className="text-slate-500 mt-1">Here's your learning progress for the India Official Statistics System.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
            <Activity className="h-4 w-4" />
            {user?.role === 'learner' ? 'Learner' : user?.role}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
            {user?.organization}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={cn("bg-white p-5 rounded-2xl shadow-sm border flex flex-col hover:shadow-md transition-all duration-300 hover:-translate-y-0.5", stat.border)}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
            </div>
            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recommended Path + Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommended Path */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="text-blue-600 h-5 w-5" />
                AI Recommended Path
              </h2>
              <Link to="/learning-paths" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pb-2">
              {[
                { title: "Introduction to Official Statistics", provider: "iGOT Karmayogi", status: "completed", time: "Completed last week" },
                { title: "Survey Design & Sampling", provider: "NSSTA", status: "current", time: "Due in 3 days", progress: 65 },
                { title: "Data Visualization with R", provider: "ISI Delhi", status: "upcoming", time: "Starts next month" },
                { title: "SDG Indicator Framework", provider: "NITI Aayog", status: "upcoming", time: "Recommended" },
              ].map((item, i) => (
                <div key={i} className="relative pl-6">
                  <span className={cn(
                    "absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-[3px] border-white flex items-center justify-center",
                    item.status === "completed" ? "bg-emerald-500" :
                    item.status === "current" ? "bg-blue-600 ring-4 ring-blue-100" : "bg-slate-200"
                  )}>
                    {item.status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <div className={cn(
                    "p-4 rounded-xl border transition-colors",
                    item.status === "current" ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100"
                  )}>
                    <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.provider} • {item.time}</p>
                    {item.status === 'current' && item.progress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="text-orange-500 h-5 w-5" />
                Recommended iGOT Courses
              </h2>
              <Link to="/courses" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                Browse All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(courses.length > 0 ? courses.slice(0, 4) : [
                { title: "Python for Government", provider: "DIID MoSPI", difficulty: "Intermediate", duration: "8 hours" },
                { title: "Cybersecurity Awareness", provider: "MeitY", difficulty: "Beginner", duration: "2 hours" },
              ]).map((course: any, i: number) => (
                <div key={i} className="p-4 border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-colors cursor-pointer">
                  <h4 className="font-medium text-sm text-slate-800 mb-1">{course.title}</h4>
                  <p className="text-xs text-slate-500">{course.provider} • {course.duration}</p>
                  <span className={cn(
                    "inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full",
                    course.difficulty === "Beginner" ? "bg-green-50 text-green-600" :
                    course.difficulty === "Intermediate" ? "bg-yellow-50 text-yellow-600" :
                    "bg-red-50 text-red-600"
                  )}>{course.difficulty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Competency Radar + Top Gaps */}
        <div className="space-y-6">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold mb-4">Competency Radar</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Target" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeDasharray="4 4" />
                  <Radar name="Current" dataKey="current" stroke="#0F204C" fill="#0F204C" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-[#0F204C] rounded-full" />Current</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-slate-400 rounded-full" />Target</span>
            </div>
          </div>

          {/* Top Skill Gaps */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Top Skill Gaps</h2>
              <Link to="/competency-profile" className="text-xs text-blue-600 font-medium hover:underline">View Profile</Link>
            </div>
            <div className="space-y-4">
              {(topGaps.length > 0 ? topGaps : [
                { competencyName: "Data Visualization", currentLevel: 30, targetLevel: 80, severity: "critical" },
                { competencyName: "Python Programming", currentLevel: 35, targetLevel: 70, severity: "high" },
                { competencyName: "AI & Machine Learning", currentLevel: 15, targetLevel: 60, severity: "critical" },
              ]).map((gap: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{gap.competencyName}</span>
                    <span className={cn(
                      "text-xs font-semibold px-1.5 py-0.5 rounded",
                      gap.severity === "critical" ? "text-red-600 bg-red-50" :
                      gap.severity === "high" ? "text-orange-600 bg-orange-50" :
                      "text-amber-600 bg-amber-50"
                    )}>
                      {gap.severity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-1000",
                        gap.severity === "critical" ? "bg-red-500" :
                        gap.severity === "high" ? "bg-orange-500" : "bg-amber-500"
                      )}
                      style={{ width: `${gap.currentLevel || 30}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Current: {gap.currentLevel}%</span>
                    <span>Target: {gap.targetLevel}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
