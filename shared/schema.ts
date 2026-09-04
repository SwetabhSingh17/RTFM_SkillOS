import { pgTable, serial, text, integer, boolean, timestamp, json, index } from "drizzle-orm/pg-core";

// --- Enums and Auth ---
export enum UserRole {
  ADMIN = "admin",
  HR = "hr",           // Department Head / HR / Training Coordinator
  TRAINER = "trainer", // Trainer / Mentor
  LEARNER = "learner", // Learner (Official)
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("learner"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  organization: text("organization"), // e.g., "MoSPI", "NSO", "DES"
  primaryLanguage: text("primary_language").default("English"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organization),
}));


// --- Competency Framework ---
export const competencyDomains = pgTable("competency_domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Statistical, Technical, Digital Governance, Behavioural
  description: text("description"),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
});

export const competencyItems = pgTable("competency_items", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => competencyDomains.id).notNull(),
  name: text("name").notNull(), // e.g., "Python Programming", "Survey Design"
  description: text("description"),
  proficiencyLevels: json("proficiency_levels").$type<string[]>(), // ["Beginner", "Intermediate", "Advanced", "Expert"]
  category: text("category"), // sub-category
  isActive: boolean("is_active").notNull().default(true),
});

// --- User Competency Profile ---
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  designation: text("designation").notNull(), // e.g., "Joint Director", "Statistical Investigator"
  department: text("department").notNull(),
  jobRole: text("job_role").notNull(),
  currentAssignment: text("current_assignment"),
  educationalQualifications: text("educational_qualifications"),
  workExperienceYears: integer("work_experience_years").default(0),
  previousTrainings: json("previous_trainings").$type<string[]>(),
  careerLevel: text("career_level"), // Junior, Mid, Senior, Leadership
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userCompetencies = pgTable("user_competencies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  competencyItemId: integer("competency_item_id").references(() => competencyItems.id).notNull(),
  currentLevel: integer("current_level").notNull().default(0), // 0-100 score
  targetLevel: integer("target_level").notNull().default(80),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  lastAssessedAt: timestamp("last_assessed_at"),
  aiNotes: text("ai_notes"), // LLM-generated insights
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userCompIdx: index("user_comp_idx").on(table.userId, table.competencyItemId),
}));


// --- iGOT Karmayogi Integration ---
export const igotCourses = pgTable("igot_courses", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(), // iGOT course ID
  title: text("title").notNull(),
  description: text("description"),
  provider: text("provider"),
  duration: text("duration"), // "4 hours", "2 weeks"
  difficulty: text("difficulty"), // Beginner, Intermediate, Advanced
  competenciesCovered: json("competencies_covered").$type<number[]>(), // competency_item IDs
  prerequisites: json("prerequisites").$type<number[]>(),
  language: text("language").default("English"),
  thumbnailUrl: text("thumbnail_url"),
  courseUrl: text("course_url"),
  isActive: boolean("is_active").notNull().default(true),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
}, (table) => ({
  titleIdx: index("igot_title_idx").on(table.title),
}));

export const igotEnrollments = pgTable("igot_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => igotCourses.id).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  progressPercent: integer("progress_percent").notNull().default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  externalEnrollmentId: text("external_enrollment_id"),
});


// --- Learning Paths ---
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedDuration: text("estimated_duration"), // "8 weeks", "40 hours"
  targetCompetencies: json("target_competencies").$type<number[]>(),
  aiGenerated: boolean("ai_generated").notNull().default(true),
  status: text("status").notNull().default("active"), // active, paused, completed, archived
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userPathIdx: index("user_path_idx").on(table.userId, table.status),
}));

export const learningPathSteps = pgTable("learning_path_steps", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").references(() => learningPaths.id).notNull(),
  sequence: integer("sequence").notNull(),
  stepType: text("step_type").notNull(), // "course", "quiz", "milestone"
  courseId: integer("course_id").references(() => igotCourses.id),
  quizId: integer("quiz_id"),
  title: text("title").notNull(),
  description: text("description"),
  estimatedHours: integer("estimated_hours"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("pending"),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  pathStepIdx: index("path_step_idx").on(table.pathId, table.sequence),
}));


// --- Learning Materials & Quiz Generation ---
export const learningMaterials = pgTable("learning_materials", {
  id: serial("id").primaryKey(),
  uploadedById: integer("uploaded_by_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileType: text("file_type").notNull(), // pdf, pptx, docx, video
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  extractedText: text("extracted_text"),
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, ready, failed
  processedAt: timestamp("processed_at"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => learningMaterials.id),
  title: text("title").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  timeLimit: integer("time_limit"), // in minutes
  totalQuestions: integer("total_questions").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft, published, archived
  generatedByAI: boolean("generated_by_ai").notNull().default(true),
  aiModel: text("ai_model"), // e.g., "gemma-4-e4b"
  generationPrompt: text("generation_prompt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  sequence: integer("sequence").notNull(),
  questionType: text("question_type").notNull().default("mcq_single"), // mcq_single, mcq_multi, true_false
  questionText: text("question_text").notNull(),
  options: json("options").$type<{ id: string; text: string }[]>().notNull(),
  correctAnswers: json("correct_answers").$type<string[]>().notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty"),
  bloomLevel: text("bloom_level"), // remember, understand, apply, analyze, evaluate, create
  competencyItemId: integer("competency_item_id").references(() => competencyItems.id),
  points: integer("points").notNull().default(1),
}, (table) => ({
  quizSeqIdx: index("quiz_seq_idx").on(table.quizId, table.sequence),
}));

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  score: integer("score"),
  maxScore: integer("max_score").notNull(),
  percentageScore: integer("percentage_score"),
  status: text("status").notNull().default("in_progress"), // in_progress, submitted, expired
  timeSpent: integer("time_spent"), // seconds
  responses: json("responses").$type<{ questionId: number; selected: string[]; correct: boolean; timeSpent: number }[]>(),
  aiFeedback: text("ai_feedback"),
}, (table) => ({
  userQuizIdx: index("user_quiz_idx").on(table.userId, table.quizId),
}));

// --- NSSTA TPAC Recommended Trainings ---
export const nsstaTrainings = pgTable("nssta_trainings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  location: text("location"),
  mode: text("mode"), // online, offline, hybrid
  targetRoles: json("target_roles").$type<string[]>(),
  competenciesCovered: json("competencies_covered").$type<number[]>(),
  isActive: boolean("is_active").notNull().default(true),
});
