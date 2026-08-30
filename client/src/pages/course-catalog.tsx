import { useState, useEffect } from 'react';
import { Library, Search, Filter, BookOpen, Clock, Award, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [coursesData, enrollments] = await Promise.all([
        api.getCourses(),
        api.getEnrollments(user.id).catch(() => []),
      ]);
      setCourses(coursesData);
      setEnrolledIds(new Set(enrollments.map((e: any) => e.courseId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    if (!user) return;
    setEnrolling(courseId);
    try {
      await api.enrollCourse(user.id, courseId);
      setEnrolledIds(prev => new Set([...prev, courseId]));
    } catch (err: any) {
      console.error(err);
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = !difficulty || c.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
    Advanced: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
            <Library className="h-6 w-6 text-white" />
          </div>
          iGOT Karmayogi Courses
        </h1>
        <p className="text-slate-500 mt-2">Browse and enroll in courses from the iGOT Karmayogi platform aligned with your competency gaps.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm min-w-[150px]"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{filteredCourses.length} courses found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledIds.has(course.id);
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md hover:border-slate-200 transition-all duration-300 hover:-translate-y-0.5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full border",
                      difficultyColors[course.difficulty] || 'bg-slate-50 text-slate-600 border-slate-200'
                    )}>
                      {course.difficulty}
                    </span>
                    {course.provider && (
                      <span className="text-xs text-slate-400 font-medium">{course.provider}</span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-slate-800 mb-2 leading-snug">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{course.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </span>
                    )}
                    {course.language && (
                      <span className="flex items-center gap-1">
                        🌐 {course.language}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  {isEnrolled ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="w-full bg-gradient-to-r from-[#0F204C] to-[#1a3366] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-[#1a3366] hover:to-[#0F204C] disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      {enrolling === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><BookOpen className="h-4 w-4" /> Enroll Now</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Library className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
