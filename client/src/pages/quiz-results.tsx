import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, Award, Loader2, Brain } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function QuizResults() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getQuiz(parseInt(id))
      .then(data => {
        setQuiz(data);
        setQuestions(data?.questions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Quiz not found.</p>
        <Link to="/quizzes" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Back to Quizzes</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link to="/quizzes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      {/* Quiz Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{quiz.title}</h1>
            {quiz.description && <p className="text-sm text-slate-500 mb-3">{quiz.description}</p>}
            <div className="flex gap-3 text-xs">
              <span className={cn(
                "px-2.5 py-1 rounded-full border font-medium",
                quiz.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
                quiz.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              )}>{quiz.difficulty}</span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                {quiz.totalQuestions} questions
              </span>
              {quiz.generatedByAI && (
                <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium flex items-center gap-1">
                  <Brain className="h-3 w-3" /> AI Generated
                </span>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-5 text-center min-w-[100px]">
            <Award className="h-6 w-6 mx-auto mb-1" />
            <p className="text-2xl font-bold">{quiz.totalQuestions}</p>
            <p className="text-xs opacity-80">Questions</p>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-4">
        {questions.map((q: any, i: number) => (
          <div key={q.id || i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex gap-4">
              <div className="font-bold text-2xl text-slate-200 select-none">{String(i + 1).padStart(2, '0')}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base font-medium text-slate-900 flex-1">{q.questionText}</h3>
                  {q.bloomLevel && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium ml-3 shrink-0">
                      {q.bloomLevel}
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-2 mb-4">
                  {(q.options || []).map((opt: any, idx: number) => {
                    const optText = typeof opt === 'string' ? opt : opt.text;
                    const optId = typeof opt === 'string' ? `opt_${idx}` : opt.id;
                    const isCorrect = (q.correctAnswers || []).includes(optId);
                    return (
                      <div key={idx} className={cn(
                        "p-3 rounded-xl border text-sm flex items-start gap-2",
                        isCorrect
                          ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      )}>
                        {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />}
                        <span>{optText}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
                    <span className="font-semibold">Explanation: </span>{q.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400">No questions found for this quiz.</p>
        </div>
      )}
    </div>
  );
}
