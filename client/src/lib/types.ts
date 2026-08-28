export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

export interface LearnerAnalytics {
  competency: {
    totalItems: number;
    averageLevel: number;
    averageGapPercent: number;
    highPriorityGaps: number;
  };
  quizzes: {
    totalAttempts: number;
    completed: number;
    averageScore: number;
    bestScore: number;
  };
  courses: {
    enrolled: number;
    completed: number;
    inProgress: number;
  };
  learningPaths: {
    active: number;
    total: number;
  };
  learningHours: number;
  badges: number;
}

export interface CompetencyDomainSummary {
  domain: string;
  averageGapPercent: number;
  averageCurrentLevel: number;
  itemCount: number;
  criticalItems: number;
}

export interface CompetencyGap {
  competencyId: number;
  competencyName: string;
  domain: string;
  currentLevel: number;
  targetLevel: number;
  gapSize: number;
  gapPercent: number;
  priority: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface CompetencyGapsResponse {
  gaps: CompetencyGap[];
  domainSummary: CompetencyDomainSummary[];
  totalGaps: number;
}

export interface CompetencyItem {
  id: number;
  domainId: number;
  name: string;
  description: string | null;
}

export interface CompetencyFramework {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  items: CompetencyItem[];
}

export interface UserProfile {
  id: number;
  userId: number;
  designation: string;
  department: string;
  jobRole: string;
  currentAssignment: string | null;
  educationalQualifications: string | null;
  workExperienceYears: number | null;
  previousTrainings: string[] | null;
  careerLevel: string | null;
}

export interface UserCompetency {
  id: number;
  userId: number;
  competencyItemId: number;
  currentLevel: number;
  targetLevel: number;
  priority: string;
}

export interface CompetencyProfileResponse {
  profile: UserProfile | null;
  competencies: UserCompetency[];
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  provider: string | null;
  duration: string | null;
  difficulty: string | null;
  language: string | null;
}

export interface Enrollment {
  id: number;
  courseId: number;
  userId: number;
  status: string;
  progressPercent: number;
  course: Course | null;
}

export interface LearningPathStep {
  id: number;
  pathId: number;
  sequence: number;
  stepType: 'course' | 'quiz' | 'milestone' | string;
  title: string;
  description: string | null;
  estimatedHours: number | null;
  status: 'pending' | 'completed' | string;
}

export interface LearningPath {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  estimatedDuration: string | null;
  aiGenerated: boolean;
  status: string;
  steps: LearningPathStep[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  timeLimit: number | null;
  totalQuestions: number;
  status: string;
  generatedByAI: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: QuizOption[];
  correctAnswers: string[];
  explanation: string | null;
  bloomLevel: string | null;
}

export interface QuizDetails extends Quiz {
  questions: QuizQuestion[];
}

export interface QuizGenerateResponse {
  success: boolean;
  quizId: number;
  message: string;
  questions: number;
}

export interface LearningMaterial {
  id: number;
  title: string;
  fileType: string;
  fileUrl: string;
  processingStatus: string;
}

export interface WorkforceHeatmapItem {
  name: string;
  averageLevel: number;
  assessedUsers: number;
}

export interface WorkforceHeatmapDomain {
  domain: string;
  averageLevel: number;
  totalAssessments: number;
  items: WorkforceHeatmapItem[];
}

export interface WorkforceAnalytics {
  heatmap: WorkforceHeatmapDomain[];
  orgStats: {
    totalLearners: number;
    totalEnrollments: number;
    completedCourses: number;
    totalQuizAttempts: number;
    averageQuizScore: number;
  };
}
