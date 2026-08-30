import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Clock, CheckCircle2, Circle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function LearningPaths() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.getLearningPaths(user.id)
      .then(setPaths)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleGenerateAIPath = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const gaps = await api.getGaps(user.id);
      const topGaps = gaps.gaps.slice(0, 3);
      const newPath = await api.generateLearningPath({
        userId: user.id,
        gaps: topGaps,
        preferences: { style: 'mixed' }
      });
      setPaths(prev => [newPath.path, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            Learning Paths
          </h1>
          <p className="text-slate-500 mt-2">Personalized journeys to close your competency gaps.</p>
        </div>
        <button
          onClick={handleGenerateAIPath}
          disabled={generating}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate AI Path
        </button>
      </div>

      {paths.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Active Paths</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You don't have any learning paths yet. Let AI analyze your competency gaps and create a personalized journey.</p>
          <button
            onClick={handleGenerateAIPath}
            disabled={generating}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-70 mx-auto"
          >
            {generating ? 'Analyzing Gaps & Generating...' : 'Generate My First Path'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {paths.map(path => (
            <div key={path.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-slate-900">{path.title}</h2>
                    {path.aiGenerated && (
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm">{path.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {path.estimatedDuration}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-8">
                {(path.steps || []).map((step: any, index: number) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'pending' && (index === 0 || path.steps[index-1].status === 'completed');

                  return (
                    <div key={step.id} className="relative">
                      {/* Node */}
                      <span className={cn(
                        "absolute -left-[31px] sm:-left-[39px] top-1 h-5 w-5 rounded-full border-[4px] border-white flex items-center justify-center",
                        isCompleted ? "bg-emerald-500" :
                        isCurrent ? "bg-blue-600 ring-4 ring-blue-100" : "bg-slate-200"
                      )}>
                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </span>

                      <div className={cn(
                        "rounded-xl border p-4 sm:p-5 transition-colors",
                        isCurrent ? "bg-blue-50/50 border-blue-100" :
                        isCompleted ? "bg-white border-slate-100" : "bg-slate-50 border-slate-100 opacity-70"
                      )}>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="font-semibold text-slate-800">{step.title}</h3>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                            step.stepType === 'course' ? "bg-purple-100 text-purple-700" :
                            step.stepType === 'quiz' ? "bg-orange-100 text-orange-700" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {step.stepType}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{step.description}</p>
                        
                        {isCurrent && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">{step.estimatedHours}h estimated</span>
                            {step.stepType === 'course' ? (
                              <Link to="/courses" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                Go to Course <ArrowRight className="h-4 w-4" />
                              </Link>
                            ) : (
                              <Link to="/quizzes" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                Take Quiz <ArrowRight className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
