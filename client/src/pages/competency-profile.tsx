import { useState, useEffect } from 'react';
import { Target, Save, Loader2, User, Briefcase, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function CompetencyProfile() {
  const { user } = useAuth();
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [gaps, setGaps] = useState<any>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [assessments, setAssessments] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getFrameworks().catch(() => []),
      api.getCompetencyProfile(user.id).catch(() => ({ profile: null, competencies: [] })),
      api.getGaps(user.id).catch(() => null),
    ]).then(([fw, profileData, gapsData]) => {
      setFrameworks(fw);
      setProfile(profileData.profile);
      setCompetencies(profileData.competencies);
      setGaps(gapsData);
      // Initialize assessments with current values
      const initial: Record<number, number> = {};
      profileData.competencies.forEach((c: any) => {
        initial[c.competencyItemId] = c.currentLevel;
      });
      setAssessments(initial);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleSaveAssessments = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = Object.entries(assessments).map(([itemId, level]) => ({
        competencyItemId: parseInt(itemId),
        currentLevel: level,
        targetLevel: 80,
        priority: level < 30 ? 'critical' : level < 50 ? 'high' : level < 70 ? 'medium' : 'low',
      }));
      await api.submitAssessment({ userId: user.id, assessments: data });
      // Refresh gaps
      const newGaps = await api.getGaps(user.id);
      setGaps(newGaps);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const chartData = gaps?.domainSummary?.map((d: any) => ({
    name: d.domain.replace(' Competencies', '').replace('Behavioural & ', 'B&M'),
    level: d.averageCurrentLevel,
    gap: 80 - d.averageCurrentLevel,
  })) || [];

  const COLORS = ['#0F204C', '#FF9933', '#138808', '#6366f1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          Competency Profile
        </h1>
        <p className="text-slate-500 mt-2">Assess your current skill levels across all competency domains.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Profile Info + Chart */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{user?.name}</h3>
                <p className="text-sm text-slate-500">{user?.organization}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>{profile?.designation || 'Statistical Investigator'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <User className="h-4 w-4 text-slate-400" />
                <span>{profile?.department || 'Data Informatics & Innovation Division'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>{profile?.educationalQualifications || 'M.Sc. Statistics'}</span>
              </div>
            </div>
          </div>

          {/* Domain Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Domain Overview</h3>
            {chartData.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="level" radius={[0, 4, 4, 0]} barSize={18}>
                      {chartData.map((_, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Complete your self-assessment to see domain overview.</p>
            )}
          </div>

          {/* Stats */}
          {gaps && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-3">Gap Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{gaps.totalGaps}</p>
                  <p className="text-xs text-blue-600">Total Items</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {gaps.gaps?.filter((g: any) => g.severity === 'critical').length || 0}
                  </p>
                  <p className="text-xs text-red-600">Critical Gaps</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Self-Assessment */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Self-Assessment</h2>
              <button
                onClick={handleSaveAssessments}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 shadow-md shadow-blue-500/20"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Assessment
              </button>
            </div>

            <div className="space-y-3">
              {frameworks.map((domain: any) => (
                <div key={domain.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDomain(expandedDomain === domain.name ? null : domain.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{domain.icon || '📋'}</span>
                      <div className="text-left">
                        <h3 className="font-semibold text-slate-800">{domain.name}</h3>
                        <p className="text-xs text-slate-500">{domain.items?.length || 0} competency items</p>
                      </div>
                    </div>
                    {expandedDomain === domain.name ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>

                  {expandedDomain === domain.name && (
                    <div className="border-t border-slate-100 p-4 space-y-5 bg-slate-50/50">
                      {(domain.items || []).map((item: any) => {
                        const currentValue = assessments[item.id] ?? 50;
                        return (
                          <div key={item.id}>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-slate-700">{item.name}</label>
                              <span className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded-full",
                                currentValue < 30 ? "bg-red-100 text-red-700" :
                                currentValue < 50 ? "bg-orange-100 text-orange-700" :
                                currentValue < 70 ? "bg-yellow-100 text-yellow-700" :
                                "bg-green-100 text-green-700"
                              )}>
                                {currentValue}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={currentValue}
                              onChange={e => setAssessments(prev => ({ ...prev, [item.id]: parseInt(e.target.value) }))}
                              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                              <span>Beginner</span>
                              <span>Intermediate</span>
                              <span>Advanced</span>
                              <span>Expert</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {frameworks.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">No competency frameworks loaded. Run the seed script to populate data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
