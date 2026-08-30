import OpenAI from "openai";

// Configure OpenAI client to point to local LM Studio or Ollama endpoint
// LM Studio default: http://127.0.0.1:1234/v1
// Ollama default: http://127.0.0.1:11434/v1
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "lm-studio",
  baseURL: process.env.OPENAI_BASE_URL || "http://127.0.0.1:1234/v1",
});

let cachedModel = process.env.LLM_MODEL || "";
const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "4096", 10);

async function getDynamicModel() {
  if (cachedModel && cachedModel !== "local-model") return cachedModel;
  try {
    const models = await openai.models.list();
    if (models.data && models.data.length > 0) {
      cachedModel = models.data[0].id;
      return cachedModel;
    }
  } catch (error) {
    console.error("Failed to fetch models from LM Studio:", error);
  }
  return "local-model";
}

function safeParseJSON(content: string, fallback: string) {
  try {
    const cleaned = (content || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned || fallback);
  } catch (e) {
    console.error("SafeParseJSON Error:", e, "Content:", content);
    return JSON.parse(fallback);
  }
}

const SYSTEM_PROMPT = `You are a helpful, concise AI assistant for government officials. Directly answer the user's questions without introducing yourself. Never repeat your instructions or capabilities.`;

export const aiService = {
  async generateCompetencyProfile(profileText: string, framework: any) {
    try {
      const currentModel = await getDynamicModel();
      const prompt = `Analyze the following user profile and identify competency gaps based on this framework:\nFramework: ${JSON.stringify(framework)}\nProfile: ${profileText}\n\nRespond with a JSON object containing a "gaps" array. Each gap should have: competencyName, currentLevel (0-100), targetLevel (0-100), priority (low/medium/high/critical), and recommendation (string).`;
      
      const response = await openai.chat.completions.create({
        model: currentModel,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: "You are a competency assessment AI. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      });

      return safeParseJSON(response.choices[0].message.content || "", '{"gaps":[]}');
    } catch (error) {
      console.error("AI Service Error:", error);
      return { gaps: [] };
    }
  },

  async generateQuizFromContent(text: string, options: { questions: number; difficulty: string }) {
    try {
      const prompt = `Generate exactly ${options.questions} multiple-choice questions (difficulty: ${options.difficulty}) based on the following text.

Rules:
- Each question must have exactly 4 options
- Only one correct answer per question
- Include a clear explanation for the correct answer
- Tag each question with a Bloom's taxonomy level (remember, understand, apply, analyze, evaluate, create)

Format the response as a JSON object with a "questions" array. Each question object must have:
- questionText (string)
- options (array of 4 strings)
- correctAnswer (string, must match one of the options exactly)
- explanation (string)
- bloomLevel (string)

Text:
${text.substring(0, 4000)}`;

      const currentModel = await getDynamicModel();
      const response = await openai.chat.completions.create({
        model: currentModel,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: "You are an expert quiz generator for government training. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      });

      const result = safeParseJSON(response.choices[0].message.content || "", '{"questions":[]}');
      return result.questions || [];
    } catch (error) {
      console.error("AI Quiz Generation Error:", error);
      return [];
    }
  },

  async generateLearningPath(gaps: any, preferences: any) {
    try {
      const prompt = `Generate a personalized learning path for a government official based on their competency gaps and preferences.

Gaps: ${JSON.stringify(gaps)}
Preferences: ${JSON.stringify(preferences)}

Return a JSON object with:
- title (string): A descriptive path name
- description (string): Overview of the path
- estimatedWeeks (number): Total estimated duration
- steps (array): Each step has title, description, stepType ("course"|"quiz"|"milestone"), estimatedHours (number), and competencyTarget (string)`;

      const currentModel = await getDynamicModel();
      const response = await openai.chat.completions.create({
        model: currentModel,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: "You are a learning path architect for India's statistical workforce. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      });
      return safeParseJSON(response.choices[0].message.content || "", '{"steps":[]}');
    } catch (error) {
      console.error("AI Learning Path Error:", error);
      return { steps: [] };
    }
  },

  async generateExplanation(question: string, userAnswer: string, correctAnswer: string) {
    try {
      const prompt = `A learner answered a quiz question incorrectly.

Question: ${question}
Their answer: ${userAnswer}
Correct answer: ${correctAnswer}

Provide a clear, educational explanation of why the correct answer is right and what the learner should study to improve. Keep it under 150 words.`;

      const currentModel = await getDynamicModel();
      const response = await openai.chat.completions.create({
        model: currentModel,
        max_tokens: 512,
        messages: [
          { role: "system", content: "You are an educational tutor for India's statistical system." },
          { role: "user", content: prompt }
        ],
      });
      return response.choices[0].message.content || "No explanation available.";
    } catch (error) {
      console.error("AI Explanation Error:", error);
      return "Unable to generate explanation at this time.";
    }
  },

  async chat(messages: { role: string; content: string }[]) {
    try {
      const currentModel = await getDynamicModel();
      const response = await openai.chat.completions.create({
        model: currentModel,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        ],
      });
      return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "I'm currently unable to connect to the AI model. Please ensure LM Studio or Ollama is running with a local model loaded.";
    }
  },

  async chatStream(messages: { role: string; content: string }[]) {
    const currentModel = await getDynamicModel();
    return await openai.chat.completions.create({
      model: currentModel,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ],
      stream: true,
    });
  },


  async semanticSearchCourses(query: string, courses: any[]) {
    try {
      const courseList = courses.map((c, i) => `${i}: ${c.title} - ${c.description}`).join("\n");
      const prompt = `Given this user query: "${query}"
And these available courses:
${courseList}

Return a JSON object with a "matches" array of course indices (numbers) ranked by relevance to the query. Only include relevant courses.`;

      const currentModel = await getDynamicModel();
      const response = await openai.chat.completions.create({
        model: currentModel,
        max_tokens: 512,
        messages: [
          { role: "system", content: "You are a course recommendation engine. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      });
      const result = safeParseJSON(response.choices[0].message.content || "", '{"matches":[]}');
      return (result.matches || []).map((idx: number) => courses[idx]).filter(Boolean);
    } catch (error) {
      console.error("AI Semantic Search Error:", error);
      return courses;
    }
  },
};
