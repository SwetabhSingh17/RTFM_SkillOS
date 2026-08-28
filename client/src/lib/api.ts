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
    request<{ success: boolean; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) =>
    request<{ success: boolean; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  getMe: () =>
    request<{ user: any }>("/auth/me"),

  // Health
  health: () => request<any>("/health"),

  // Competencies
  getFrameworks: () => request<any[]>("/competencies/frameworks"),
  getCompetencyProfile: (userId: number) => request<any>(`/competencies/profile/${userId}`),
  submitAssessment: (data: any) =>
    request<any>("/competencies/assess", { method: "POST", body: JSON.stringify(data) }),
  getGaps: (userId: number) => request<any>(`/competencies/gaps/${userId}`),
  saveProfile: (data: any) =>
    request<any>("/competencies/profile", { method: "POST", body: JSON.stringify(data) }),

  // Learning Paths
  getLearningPaths: (userId: number) => request<any[]>(`/learning-paths/${userId}`),
  generateLearningPath: (data: any) =>
    request<any>("/learning-paths/generate", { method: "POST", body: JSON.stringify(data) }),
  updatePathStep: (pathId: number, stepId: number, status: string) =>
    request<any>(`/learning-paths/${pathId}/steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // iGOT Courses
  getCourses: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>(`/igot/courses${query}`);
  },
  getCourseDetails: (id: number) => request<any>(`/igot/courses/${id}`),
  enrollCourse: (userId: number, courseId: number) =>
    request<any>("/igot/enroll", { method: "POST", body: JSON.stringify({ userId, courseId }) }),
  getEnrollments: (userId: number) => request<any[]>(`/igot/enrollments/${userId}`),

  // Quiz
  generateQuiz: (data: { materialId: number; difficulty: string; numberOfQuestions: number }) =>
    request<any>("/quiz/generate", { method: "POST", body: JSON.stringify(data) }),
  getQuizzes: () => request<any[]>("/quiz"),
  getQuiz: (id: number) => request<any>(`/quiz/${id}`),
  startAttempt: (quizId: number, userId: number) =>
    request<any>(`/quiz/${quizId}/attempt`, { method: "POST", body: JSON.stringify({ userId }) }),
  submitAttempt: (attemptId: number, data: any) =>
    request<any>(`/quiz/attempts/${attemptId}`, { method: "PUT", body: JSON.stringify(data) }),
  getAttemptResults: (attemptId: number) => request<any>(`/quiz/attempts/${attemptId}`),

  // Materials
  getMaterials: () => request<any[]>("/materials"),
  getMaterial: (id: number) => request<any>(`/materials/${id}`),
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
    return res.json();
  },
  processMaterial: (id: number) =>
    request<any>(`/materials/${id}/process`, { method: "POST" }),

  // Analytics
  getLearnerAnalytics: (userId: number) => request<any>(`/analytics/learner/${userId}`),
  getWorkforceAnalytics: () => request<any>("/analytics/workforce"),
  getQuizPerformance: () => request<any>("/analytics/quiz-performance"),

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
              if (parsed.error) {
                yield { type: "error", error: String(parsed.error) };
                return;
              }

              if (parsed.type === "done" || parsed.done === true) {
                yield { type: "done" };
                return;
              }

              if ((parsed.type === "reasoning" || parsed.type === "thinking") && parsed.content) {
                yield { type: "reasoning", content: String(parsed.content) };
                continue;
              }

              if (parsed.type === "content" && parsed.content) {
                yield { type: "content", content: String(parsed.content) };
                continue;
              }

              // Backward compatibility and provider-specific fallbacks
              if (parsed.reasoning) {
                yield { type: "reasoning", content: String(parsed.reasoning) };
              }
              if (parsed.reasoning_content) {
                yield { type: "reasoning", content: String(parsed.reasoning_content) };
              }
              if (parsed.thinking) {
                yield { type: "reasoning", content: String(parsed.thinking) };
              }
              if (parsed.content) {
                yield { type: "content", content: String(parsed.content) };
              }
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
};
