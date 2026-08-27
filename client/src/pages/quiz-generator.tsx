import { useState, useEffect } from 'react';
import { Brain, FileText, Upload, Sparkles, Loader2, Play, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function QuizGenerator() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  useEffect(() => {
    api.getMaterials().then(setMaterials).catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!uploadFile || !user) return;
    setUploading(true);
    setError('');
    try {
      const result = await api.uploadMaterial(uploadFile, uploadFile.name, user.id);
      // Process the material
      await api.processMaterial(result.material.id);
      // Refresh materials list
      const updated = await api.getMaterials();
      setMaterials(updated);
      setSelectedMaterial(result.material.id);
      setUploadFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedMaterial) {
      setError('Please select a material first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setQuestions([]);

    try {
      const result = await api.generateQuiz({
        materialId: selectedMaterial,
        difficulty,
        numberOfQuestions: numQuestions,
      });

      setGenerationResult(result);
      // Fetch the generated quiz questions
      if (result.quizId) {
        const quiz = await api.getQuiz(result.quizId);
        if (quiz?.questions) {
          setQuestions(quiz.questions);
        }
      }

      // If no questions from API, show the count
      if (!questions.length && result.questions) {
        setQuestions(new Array(result.questions).fill(null).map((_, i) => ({
          questionText: `Question ${i + 1} generated successfully`,
          options: [],
          correctAnswer: '',
          explanation: 'View in quiz to see details',
        })));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Ensure LM Studio/Ollama is running with a local model loaded.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          AI Quiz Generator
        </h1>
        <p className="text-slate-500 mt-2">Upload training materials and use local LLMs to automatically generate competency assessments.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {!generationResult && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Upload Material</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">Upload statistical manuals, training documents, or any learning material (PDF/DOCX/TXT).</p>

            {uploadFile ? (
              <div className="w-full">
                <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 mb-3 border border-slate-200">
                  <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 truncate flex-1">{uploadFile.name}</span>
                  <button onClick={() => setUploadFile(null)} className="text-slate-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : 'Upload & Process'}
                </button>
              </div>
            ) : (
              <label className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && setUploadFile(e.target.files[0])}
                />
              </label>
            )}

            {/* Available materials */}
            {materials.length > 0 && (
              <div className="w-full mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2 text-left">Or select existing material:</p>
                <div className="space-y-1.5">
                  {materials.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMaterial(m.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg text-sm flex items-center gap-2 transition-colors border",
                        selectedMaterial === m.id
                          ? "bg-orange-50 border-orange-200 text-orange-800"
                          : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700"
                      )}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{m.title}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded ml-auto shrink-0",
                        m.processingStatus === "ready" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>{m.processingStatus}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              Generator Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Competency</label>
                <select className="w-full border-slate-200 rounded-xl shadow-sm p-3 border bg-slate-50 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400">
                  <option>Survey Design & Methodology</option>
                  <option>National Accounts</option>
                  <option>Data Visualization</option>
                  <option>SDG Indicators</option>
                  <option>Python Programming</option>
                  <option>Cybersecurity</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full border-slate-200 rounded-xl shadow-sm p-3 border bg-slate-50 text-sm"
                  >
                    <option value="easy">Beginner</option>
                    <option value="medium">Intermediate</option>
                    <option value="hard">Advanced</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Questions</label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={e => setNumQuestions(parseInt(e.target.value) || 5)}
                    min={1}
                    max={20}
                    className="w-full border-slate-200 rounded-xl shadow-sm p-3 border bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">AI Model (Local)</label>
                <select className="w-full border-slate-200 rounded-xl shadow-sm p-3 border bg-slate-50 text-sm text-slate-600">
                  <option>Default Local Model (LM Studio / Ollama)</option>
                </select>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">
                <strong>💡 Tip:</strong> Ensure LM Studio or Ollama is running locally on the configured port. Any loaded model will be used automatically.
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedMaterial}
                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {isGenerating ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Generating Assessment...</>
                ) : (
                  <><Sparkles className="h-5 w-5" /> Generate Quiz with AI</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Results */}
      {generationResult && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Generation Complete!</h3>
                <p className="text-sm text-slate-500">
                  Successfully generated {generationResult.questions || questions.length} questions.
                  Quiz ID: {generationResult.quizId}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setGenerationResult(null); setQuestions([]); }}
                className="px-4 py-2 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50"
              >
                Generate Another
              </button>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2 text-sm">
                <Play className="h-4 w-4" /> Published
              </button>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((q: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex gap-4">
                    <div className="font-bold text-2xl text-slate-200">{String(i + 1).padStart(2, '0')}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-slate-900 mb-4">{q.questionText || q.question_text}</h3>
                      <div className="grid md:grid-cols-2 gap-2.5 mb-4">
                        {(q.options || []).map((opt: any, idx: number) => {
                          const optText = typeof opt === 'string' ? opt : opt.text;
                          const isCorrect = q.correctAnswers
                            ? q.correctAnswers.includes(typeof opt === 'string' ? `opt_${idx}` : opt.id)
                            : (q.correctAnswer === optText);
                          return (
                            <div key={idx} className={cn(
                              "p-3 rounded-lg border text-sm",
                              isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-medium"
                                : "border-slate-200 bg-slate-50"
                            )}>
                              {optText}
                            </div>
                          );
                        })}
                      </div>
                      {(q.explanation) && (
                        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg border border-blue-100">
                          <span className="font-bold">AI Explanation: </span>{q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
