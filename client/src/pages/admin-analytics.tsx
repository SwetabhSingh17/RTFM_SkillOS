import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, Target, Loader2, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import { Navigate } from 'react-router-dom';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWorkforceAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (user?.role === 'student') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const stats = data?.orgStats ? [
    { label: 'Total Learners', value: data.orgStats.totalLearners, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Course Enrollments', value: data.orgStats.totalEnrollments, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Quiz Attempts', value: data.orgStats.totalQuizAttempts, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Quiz Score', value: `${data.orgStats.averageQuizScore}%`, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : [];

  const heatmapData = data?.heatmap?.map((d: any) => ({
    name: d.domain.replace(' Competencies', '').replace('Behavioural & ', 'B&M'),
    level: d.averageLevel,
  })) || [];

  const COLORS = ['#0F204C', '#FF9933', '#138808', '#6366f1'];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Workforce Intelligence
          </h1>
          <p className="text-slate-500 mt-2">Organization-wide competency heatmaps and learning metrics.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm">
          Export Report <ArrowUpRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat: any, i: number) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
            </div>
            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Domain Proficiency */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6">Average Proficiency by Domain</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="level" radius={[4, 4, 0, 0]} barSize={40}>
                  {heatmapData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Heatmap (List View) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">Critical Skill Gaps (Org-wide)</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {(data?.heatmap || []).flatMap((d: any) => d.items).sort((a: any, b: any) => a.averageLevel - b.averageLevel).slice(0, 8).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-1/3 min-w-[120px]">
                  <p className="text-xs font-medium text-slate-700 truncate" title={item.name}>{item.name}</p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        item.averageLevel < 40 ? "bg-red-500" :
                        item.averageLevel < 60 ? "bg-orange-500" :
                        item.averageLevel < 75 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${item.averageLevel || 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-xs font-bold text-slate-600">{item.averageLevel}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
