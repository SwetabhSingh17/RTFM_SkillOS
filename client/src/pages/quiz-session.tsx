import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ArrowRight, Flag, HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function QuizSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // In a real app, we'd fetch the quiz details and questions here
    // api.getQuizQuestions(id).then(...)
    
    // For this prototype, we'll mock the quiz structure
    setQuiz({
      id,
      title: "Introduction to Public Policy",
      timeLimit: 15, // minutes
      questions: [
        {
          id: 101,
          text: "Which of the following is the primary objective of public policy?",
          options: [
            "Maximizing corporate profits",
            "Addressing public problems and providing public goods",
            "Increasing government employee salaries",
            "Reducing the number of laws"
          ],
          correctAnswer: "Addressing public problems and providing public goods",
          explanation: "Public policy is fundamentally about government action (or inaction) designed to address a public problem, such as healthcare, education, or infrastructure, benefiting society as a whole."
        },
        {
          id: 102,
          text: "In the policy-making cycle, what follows 'Policy Formulation'?",
          options: [
            "Agenda Setting",
            "Policy Evaluation",
            "Policy Implementation",
            "Problem Identification"
          ],
          correctAnswer: "Policy Implementation",
          explanation: "Once a policy is formulated and adopted, it must be implemented by the relevant government agencies before it can be evaluated."
        },
        {
          id: 103,
          text: "Which of these represents a 'Regulatory Policy'?",
          options: [
            "Building a new public school",
            "Providing welfare checks to citizens",
            "Imposing emission limits on factories",
            "Offering tax breaks to startups"
          ],
          correctAnswer: "Imposing emission limits on factories",
          explanation: "Regulatory policies aim to restrict or control the behavior of individuals or organizations (like factories) to protect public interests, such as the environment."
        }
      ]
    });
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60);
    }

    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => (t ? t - 1 : 0)), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !submitting) {
      handleSubmit();
    }
  }, [quiz, timeLeft]);

  const handleSelectOption = (option: string) => {
    if (showFeedback) return; // Prevent changing answer after feedback is shown
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswers[currentQuestionIndex]) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // In a real app, calculate score and submit to backend
    // await api.submitQuizAttempt(id, { answers: selectedAnswers });
    
    setTimeout(() => {
      navigate(`/quiz/${id}/results`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0F204C]" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = !!selectedAnswers[currentQuestionIndex];
  const isCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#0F204C]">{quiz.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        
        {timeLeft !== null && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold border",
            timeLeft < 60 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-200"
          )}>
            <Clock className="h-5 w-5" />
            <span className="tabular-nums tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 mb-8 rounded-full overflow-hidden">
        <div 
          className="bg-[#FF9933] h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden mb-6">
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let optionClass = "border-slate-200 hover:border-[#FF9933] hover:bg-[#FF9933]/5";
              let icon: any = null;

              if (showFeedback) {
                if (isCorrectOption) {
                  optionClass = "border-[#138808] bg-[#138808]/10 ring-1 ring-[#138808]";
                  icon = <CheckCircle2 className="h-6 w-6 text-[#138808]" />;
                } else if (isSelected && !isCorrectOption) {
                  optionClass = "border-red-500 bg-red-50 ring-1 ring-red-500 opacity-70";
                  icon = <XCircle className="h-6 w-6 text-red-500" />;
                } else {
                  optionClass = "border-slate-100 bg-slate-50 opacity-50";
                }
              } else if (isSelected) {
                optionClass = "border-[#0F204C] bg-[#0F204C]/5 ring-1 ring-[#0F204C]";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex justify-between items-center group",
                    optionClass
                  )}
                >
                  <span className={cn(
                    "font-medium text-lg",
                    showFeedback && !isCorrectOption && !isSelected ? "text-slate-400" : "text-slate-700"
                  )}>
                    {option}
                  </span>
                  {icon}
                  {!showFeedback && !isSelected && (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300 group-hover:border-[#FF9933] transition-colors" />
                  )}
                  {!showFeedback && isSelected && (
                    <div className="h-5 w-5 rounded-full border-[6px] border-[#0F204C]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Feedback Banner */}
        {showFeedback && (
          <div className={cn(
            "p-6 border-t border-slate-100 animate-in slide-in-from-bottom-4",
            isCorrect ? "bg-emerald-50/50" : "bg-red-50/50"
          )}>
            <div className="flex gap-4 items-start">
              <div className={cn(
                "p-3 rounded-xl",
                isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}>
                {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
              </div>
              <div>
                <h4 className={cn(
                  "font-bold mb-1",
                  isCorrect ? "text-emerald-800" : "text-red-800"
                )}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center">
        <button className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-2 px-4 py-2">
          <Flag className="h-4 w-4" /> Report Issue
        </button>
        
        <div className="flex gap-3">
          {!showFeedback ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!isAnswered}
              className="bg-[#0F204C] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#0F204C]/20 hover:bg-[#0a1628] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="bg-[#FF9933] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#FF9933]/20 hover:bg-[#e68a2e] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>Submitting... <Loader2 className="h-5 w-5 animate-spin" /></>
              ) : currentQuestionIndex === quiz.questions.length - 1 ? (
                "Finish Quiz"
              ) : (
                <>Next Question <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
