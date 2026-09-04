import type {
  AuthUser,
  CompetencyFramework,
  CompetencyGapsResponse,
  CompetencyProfileResponse,
  Course,
  Enrollment,
  LearnerAnalytics,
  LearningMaterial,
  LearningPath,
  Quiz,
  QuizDetails,
  QuizGenerateResponse,
  WorkforceAnalytics,
} from "./types";

const API_BASE = "/api";

export type ChatStreamEvent =
  | { type: "content"; content: string }
  | { type: "reasoning"; content: string }
  | { type: "done" }
  | { type: "error"; error: string };

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ success: boolean; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: Record<string, unknown>) =>
    request<{ success: boolean; user: AuthUser }>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  getMe: () =>
    request<{ user: AuthUser }>("/auth/me"),

  completeOnboarding: () =>
    request<{ success: boolean }>("/auth/complete-onboarding", { method: "POST" }),

  // Health
  health: () => request<Record<string, unknown>>("/health"),

  // Competencies
  getFrameworks: () => request<CompetencyFramework[]>("/competencies/frameworks"),
  getCompetencyProfile: (userId: number) => request<CompetencyProfileResponse>(`/competencies/profile/${userId}`),
  submitAssessment: (data: {
    userId: number;
    assessments: Array<{
      competencyItemId: number;
      currentLevel: number;
      targetLevel: number;
      priority: string;
    }>;
  }) =>
    request<{ success: boolean }>("/competencies/assess", { method: "POST", body: JSON.stringify(data) }),
  getGaps: (userId: number) => request<CompetencyGapsResponse>(`/competencies/gaps/${userId}`),
  saveProfile: (data: Record<string, unknown>) =>
    request<{ success: boolean; message?: string }>("/competencies/profile", { method: "POST", body: JSON.stringify(data) }),

  // Learning Paths
  getLearningPaths: (userId: number) => request<LearningPath[]>(`/learning-paths/${userId}`),
  generateLearningPath: (data: { userId: number; gaps: CompetencyGapsResponse["gaps"]; preferences: Record<string, unknown> }) =>
    request<{ success: boolean; path: LearningPath }>("/learning-paths/generate", { method: "POST", body: JSON.stringify(data) }),
  updatePathStep: (pathId: number, stepId: number, status: string) =>
    request<{ success: boolean }>(`/learning-paths/${pathId}/steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // iGOT Courses
  getCourses: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<Course[]>(`/igot/courses${query}`);
  },
  getCourseDetails: (id: number) => request<Course>(`/igot/courses/${id}`),
  enrollCourse: (userId: number, courseId: number) =>
    request<{ success: boolean }>("/igot/enroll", { method: "POST", body: JSON.stringify({ userId, courseId }) }),
  getEnrollments: (userId: number) => request<Enrollment[]>(`/igot/enrollments/${userId}`),

  // Quiz
  generateQuiz: (data: { materialId: number; difficulty: string; numberOfQuestions: number }) =>
    request<QuizGenerateResponse>("/quiz/generate", { method: "POST", body: JSON.stringify(data) }),
  getQuizzes: () => request<Quiz[]>("/quiz"),
  getQuiz: (id: number) => request<QuizDetails>(`/quiz/${id}`),
  startAttempt: (quizId: number, userId: number) =>
    request<Record<string, unknown>>(`/quiz/${quizId}/attempt`, { method: "POST", body: JSON.stringify({ userId }) }),
  submitAttempt: (attemptId: number, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/quiz/attempts/${attemptId}`, { method: "PUT", body: JSON.stringify(data) }),
  getAttemptResults: (attemptId: number) => request<Record<string, unknown>>(`/quiz/attempts/${attemptId}`),

  // Materials
  getMaterials: () => request<LearningMaterial[]>("/materials"),
  getMaterial: (id: number) => request<LearningMaterial>(`/materials/${id}`),
  uploadMaterial: async (file: File, title: string, userId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("userId", userId.toString());

    const res = await fetch(`${API_BASE}/materials/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<{ success: boolean; material: LearningMaterial }>;
  },
  processMaterial: (id: number) =>
    request<{ success: boolean; extractedText: string }>(`/materials/${id}/process`, { method: "POST" }),

  // Analytics
  getLearnerAnalytics: (userId: number) => request<LearnerAnalytics>(`/analytics/learner/${userId}`),
  getWorkforceAnalytics: () => request<WorkforceAnalytics>("/analytics/workforce"),
  getQuizPerformance: () => request<Record<string, unknown>>("/analytics/quiz-performance"),

  // AI Chat
  chat: (messages: { role: string; content: string }[]) =>
    request<{ response: string }>("/chat", { method: "POST", body: JSON.stringify({ messages }) }),

  chatStream: async function*(messages: { role: string; content: string }[]): AsyncGenerator<ChatStreamEvent> {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      credentials: "include",
      body: JSON.stringify({ messages })
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    if (!res.body) throw new Error("ReadableStream not yet supported in this browser.");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            const dataStr = part.slice(6);
            if (dataStr === "[DONE]") {
              yield { type: "done" };
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.type) yield parsed;
            } catch {
              // Ignore incomplete JSON chunks (though unlikely with SSE)
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  getExplanation: (question: string, userAnswer: string, correctAnswer: string) =>
    request<{ explanation: string }>("/chat/explain", {
      method: "POST",
      body: JSON.stringify({ question, userAnswer, correctAnswer }),
    }),

  // Users (Admin)
  getUsers: () => request<{ users: AuthUser[] }>("/users"),

  bulkUploadUsers: (users: Record<string, unknown>[]) =>
    request<{ successCount: number; errorCount: number; errors: any[] }>("/users/bulk-upload", {
      method: "POST",
      body: JSON.stringify({ users }),
    }),
};
