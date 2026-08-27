import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function QuizTake() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuizzes()
      .then(setQuizzes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          Quizzes & Assessments
        </h1>
        <p className="text-slate-500 mt-2">AI-generated competency assessments from training materials.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Quizzes Available</h3>
          <p className="text-sm text-slate-500 mb-4">Quizzes will appear here once a trainer generates them from uploaded materials.</p>
          {(user?.role === 'supervisor' || user?.role === 'admin') && (
            <button
              onClick={() => navigate('/quiz/generate')}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600"
            >
              Generate a Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <span className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full border",
                  quiz.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
                  quiz.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                )}>
                  {quiz.difficulty}
                </span>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded",
                  quiz.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                  quiz.status === 'draft' ? 'bg-slate-100 text-slate-500' :
                  'bg-slate-100 text-slate-400'
                )}>{quiz.status}</span>
              </div>

              <h3 className="font-semibold text-slate-800 mb-2 text-sm leading-snug flex-1">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{quiz.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {quiz.totalQuestions} questions
                </span>
                {quiz.timeLimit && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {quiz.timeLimit} min
                  </span>
                )}
                {quiz.generatedByAI && (
                  <span className="flex items-center gap-1 text-orange-500">
                    ✨ AI Generated
                  </span>
                )}
              </div>

              <button
                onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-sm"
              >
                View Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
