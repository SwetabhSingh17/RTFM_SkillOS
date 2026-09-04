# Hackathon Implementation Roadmap: AI-Enabled Learning Platform for Official Statistics

## Problem Statement Overview
**SIH 2026 - Problem Statement ID: 26101**
Build an AI-enabled learning platform that:
- Identifies competency gaps for officials in India's Official Statistical System
- Recommends personalized training via iGOT Karmayogi integration
- Generates quizzes/MCQs from uploaded learning materials
- Provides interactive dashboards for learners and administrators

**Organization:** MoSPI (Ministry of Statistics and Programme Implementation)  
**Department:** Data Informatics & Innovation Division (DIID)  
**Theme:** Smart Education | **Category:** Software

---

## Phase 1: Foundation & Architecture (Week 1-2)

### 1.1 Database Schema Redesign
- [x] **Replace academic tables** with learning platform tables:
  - `competency_frameworks` - Statistical, Technical, Digital Governance, Behavioural domains
  - `competency_items` - Individual competencies with proficiency levels
  - `user_competencies` - User's current competency scores
  - `learning_paths` - AI-generated personalized learning paths
  - `igot_courses` - Cached iGOT Karmayogi course catalog
  - `quiz_generations` - AI-generated quizzes from uploaded content
  - `quiz_attempts` - User quiz results and analytics
  - `learning_materials` - Uploaded documents/videos for quiz generation
  - `assessment_sessions` - Adaptive assessment tracking

- [x] **Update user roles** for statistical system:
  - `admin` → Platform Admin
  - `hr` → Department Head / Training Coordinator
  - `trainer` → Trainer / Mentor
  - `learner` → Learner (Official)

- [x] **Add indexes** for competency queries, iGOT course search, quiz lookups

### 1.2 API Architecture
- [x] **Modular route structure** (keep existing pattern):
  - `/api/auth` - Authentication (reuse with role updates)
  - `/api/competencies` - Competency framework & user profiles
  - `/api/learning-paths` - AI-generated personalized paths
  - `/api/igot` - iGOT Karmayogi integration
  - `/api/quiz` - Quiz generation & attempts
  - `/api/analytics` - Dashboard analytics
  - `/api/materials` - Learning material upload/processing

- [x] **Add AI service layer** for:
  - Competency gap analysis (ML/NLP)
  - Learning path recommendation engine
  - Quiz/MCQ generation from content (LLM integration)
  - Semantic search for iGOT course matching

### 1.3 Configuration & Infrastructure
- [x] **Environment variables** for AI services (Local LM Studio/Ollama API, iGOT API)
- [x] **Rate limiting** for AI endpoints (expensive operations)
- [x] **File upload handling** for learning materials (PDF, PPTX, video)
- [x] **WebSocket events** for real-time quiz generation progress, learning updates

---

## Phase 2: Core Features - Competency & Learning (Week 2-3)

### 2.1 Competency Profiling Engine
- [x] **Competency Framework Definition** (4 domains from problem statement):
  1. **Statistical Competencies** - Survey Design, Sampling, National Accounts, Price/Labour/Agricultural/Industrial Statistics, SDG Indicators, Metadata Standards, Data Quality
  2. **Technical Competencies** - Python, R, SQL, Stata, SPSS, SAS, GIS, Data Visualization, AI/ML, Cloud Computing, APIs, Open Data
  3. **Digital Governance** - Cybersecurity, Data Privacy, Digital Signatures, Government Cloud, Digital Public Infrastructure
  4. **Behavioural/Managerial** - Leadership, Communication, Project Management, Ethics, Decision Making, Change Management

- [x] **User Competency Profile Creation**:
  - Auto-populate from user metadata (designation, department, role, experience, qualifications, training history)
  - Manual override capability for admins/trainers
  - **Cold Start Handling**: Infer an *Estimated Baseline Competency* for new users using Weight Vectors (Education, Role, Dept, Experience). Subtracted from the Target Role Profile to find initial gaps. Hand-off to RTOS upon first user action for self-correction.

- [x] **Gap Analysis Algorithm**:
  - Compare user profile against role-based competency requirements
  - Weight gaps by organizational priority, career progression, emerging tech
  - Output: Ranked skill gaps with priority scores

### 2.2 iGOT Karmayogi Integration
- [x] **API Client** for iGOT:
  - Course catalogue retrieval
  - Course metadata (duration, level, prerequisites, competencies covered)
  - Enrollment status tracking
  - Completion webhook handling

- [x] **Course Recommendation Engine**:
  - Map iGOT courses to competency framework items
  - Filter by user's gaps, role, department priorities
  - Rank by relevance, difficulty progression, time commitment

### 2.3 Personalized Learning Paths
- [x] **Path Generation Algorithm**:
  - Sequence courses logically (prerequisites → advanced)
  - Balance workload (hours/week based on role)
  - Include milestones and checkpoints
  - Adapt based on quiz performance

- [x] **Path Management UI**:
  - Visual learning journey (timeline/roadmap view)
  - Progress tracking per course
  - Notifications for upcoming deadlines

---

## Phase 3: AI-Powered Assessment Engine (Week 3-4)

### 3.1 Quiz/MCQ Generation from Content
- [ ] **Content Processing Pipeline**:
  - Text extraction from PDF, PPTX, DOCX
  - Video transcript extraction (speech-to-text)
  - Chunking for LLM context windows

- [ ] **LLM-Powered Question Generation**:
  - Prompt engineering for MCQs (single/multiple choice)
  - Difficulty calibration (Bloom's taxonomy levels)
  - Distractor quality validation
  - Explanation generation for correct/incorrect answers

- [ ] **Quiz Assembly**:
  - Topic-based quiz creation
  - Adaptive difficulty based on user performance
  - Question bank management (reuse, versioning)

### 3.2 Assessment Delivery & Analytics
- [ ] **Quiz Taking Interface**:
  - Timed/untimed modes
  - Instant feedback with explanations
  - Progress saving (resume later)

- [ ] **Performance Analytics**:
  - Competency-level scoring
  - Weak area identification
  - Learning path adjustment triggers
  - Trainer/admin cohort reports

---

## Phase 4: Dashboards & Analytics (Week 4-5)

### 4.1 Learner Dashboard (Official)
- [ ] **Competency Radar Chart** - Visual gap analysis across 4 domains
- [ ] **Learning Path Progress** - Timeline with completion %
- [ ] **Recommended Courses** - iGOT cards with match scores
- [ ] **Quiz History** - Scores, trends, weak topics
- [ ] **Learning Hours Tracker** - Weekly/monthly goals
- [ ] **Achievements/Badges** - Gamification

### 4.2 Administrator Dashboard (Dept Head/HR)
- [ ] **Workforce Competency Heatmap** - Department/role view
- [ ] **Training Effectiveness** - Pre/post assessment deltas
- [ ] **Course Utilization** - iGOT enrollment/completion rates
- [ ] **Skill Gap Trends** - Emerging needs prediction
- [ ] **Resource Allocation** - Budget/trainer planning
- [ ] **Export Reports** - Excel/PDF for MoSPI reporting

### 4.3 Trainer/Mentor Dashboard
- [ ] **Learner Cohort View** - Assigned officials progress
- [ ] **Quiz Performance** - Class-level analytics
- [ ] **Content Management** - Upload materials, review generated quizzes
- [ ] **Intervention Alerts** - Struggling learners flagging

---

## Phase 5: UI/UX - Spatial OS Adaptation (Week 4-5 parallel)

### 5.1 Design System Migration
- [ ] **Retain Cybertruck/Spatial aesthetic** (glassmorphism, holographic grids, physics animations)
- [ ] **New color palette** - MoSPI/Government branding compliant
- [ ] **Component library audit** - Reuse shadcn/ui primitives, add learning-specific components

### 5.2 New Pages Required
| Page | Route | Target Role |
|------|-------|-------------|
| Competency Profile | `/competency-profile` | Learner, Trainer, Admin |
| Learning Paths | `/learning-paths` | Learner |
| Course Catalog (iGOT) | `/courses` | Learner, Trainer |
| Quiz Generator | `/quiz/generate` | Trainer, Admin |
| Quiz Taking | `/quiz/:id/take` | Learner |
| Quiz Results | `/quiz/:id/results` | Learner, Trainer |
| Learner Dashboard | `/dashboard/learner` | Learner |
| Admin Analytics | `/dashboard/admin` | Admin, HR |
| Trainer Dashboard | `/dashboard/trainer` | Trainer |
| Material Upload | `/materials/upload` | Trainer, Admin |

### 5.3 Navigation Restructure
- [ ] **Sidebar reorganization** by role:
  - Learner: Dashboard, My Profile, Learning Paths, Courses, Quizzes, Progress
  - Trainer: Dashboard, My Learners, Quiz Generator, Materials, Analytics
  - HR: Dashboard, Department Analytics, Course Management, Reports
  - Admin: All + System Management, User Management

---

## Phase 5.5: RTOS (Real-Time Orchestration System) Integration
- [x] **Event-Driven Backbone**: Implement WebSocket/Redis queues for asynchronous task management.
- [x] **Live Competency Sync**: Automatically trigger competency recalculation and dashboard updates upon quiz completion or iGOT webhook events.
- [x] **Background AI Jobs**: Offload heavy LLM document parsing and quiz generation to background workers to prevent UI blocking.

---

## Phase 6: Security, Testing & Deployment (Hackathon Prep)
- [x] Seed Data Generation: 
  - Mock profiles (Junior, Mid, Senior officials)
  - Pre-generated skill-gap histories
- [x] RBAC Implementation: Ensure learners cannot access `/admin` or `/quiz/generate`.
- [x] Containerization: Write `Dockerfile` and `docker-compose.yml` for Postgres, Redis, Server, and Client.
- [x] **Security Hardening**:
  - [x] RBAC validation on all new endpoints
  - [x] Input sanitization for file uploads (XSS prevention)
  - [x] API rate limiting on AI endpoints
  - [x] Audit logging for competency changes, quiz generations
  - [x] **Data privacy** - PII handling per government guidelines

### 6.2 Testing Strategy
- [ ] **Unit tests** - Competency algorithms, quiz generation prompts
- [ ] **Integration tests** - iGOT API, LLM service, WebSocket
- [ ] **E2E tests** - Critical flows: Profile → Gap Analysis → Path → Quiz → Dashboard
- [ ] **Load testing** - Concurrent quiz generation, dashboard queries

### 6.3 Deployment Preparation
- [ ] **Dockerfile** for containerized deployment
- [ ] **docker-compose.yml** with PostgreSQL, Redis (caching)
- [ ] **Health check endpoint** `/api/health`
- [ ] **Environment validation** at startup (Zod schema for all env vars)
- [ ] **Production build optimization** - Bundle analysis, code splitting

---

## Phase 7: Hackathon Submission Polish (Week 6)

### 7.1 Demo Readiness
- [ ] **Seed data** - Realistic competency frameworks, sample users, iGOT course samples
- [ ] **Demo scripts** - 3-4 minute walkthrough scenarios
- [ ] **Presentation materials** - Architecture diagram, AI flow, impact metrics

### 7.2 Documentation
- [ ] **API documentation** (OpenAPI/Swagger)
- [ ] **User guides** for each role
- [ ] **Technical architecture document**

---

## Resource Allocation & Risks

### Team Roles (Suggested)
| Role | Responsibilities |
|------|------------------|
| **Backend Lead** | Database, API, AI services, iGOT integration |
| **Frontend Lead** | Dashboards, UI components, Spatial OS adaptation |
| **AI/ML Engineer** | Competency algorithms, quiz generation prompts, recommendation engine |
| **Full Stack** | Cross-cutting features, testing, deployment |

### Key Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| iGOT API access/limits | High | High | Mock service for development; cache aggressively |
| LLM cost/hardware requirements | High | Medium | Use lightweight local models (Gemma 4 E4B) via LM Studio/Ollama |
| Competency framework complexity | Medium | High | Start with 2 domains, expand iteratively |
| Time constraints (6 weeks) | High | Critical | Prioritize MVP: Profile → Gaps → Recommendations → Quiz |

---

## Success Criteria (Hackathon Judging)

### Must Have (MVP)
- [ ] User login → Competency profile auto-generated
- [ ] Gap analysis against at least 2 domains
- [ ] iGOT course recommendations (mock or real API)
- [ ] Upload document → Generate 5 MCQs with explanations
- [ ] Learner dashboard with competency radar + progress
- [ ] Admin dashboard with department overview

### Should Have
- [ ] Adaptive learning path with milestones
- [ ] Quiz taking interface with instant feedback
- [ ] Real-time notifications for new recommendations
- [ ] Export analytics to Excel

### Nice to Have
- [ ] Multi-language support (Hindi/English)
- [ ] Voice-driven navigation (Web Speech API)
- [ ] Offline PWA mode
- [ ] Predictive skill forecasting

---

## Timeline Summary

```
Week 1: ████████ Foundation - Schema, API structure, Config
Week 2: ████████ Core - Competency engine, iGOT integration, Learning paths
Week 3: ████████ AI Assessment - Quiz generation, Assessment delivery
Week 4: ████████ Dashboards - Learner/Admin/Trainer views
Week 5: ████████ UI Polish - Spatial OS adaptation, Navigation, Testing
Week 6: ████████ Submission - Demo prep, Documentation, Deployment
```

**Total: 6 Weeks** (adjust based on hackathon timeline)

---

## Appendix: Current APMS Assets to Leverage

| Asset | Reusability | Adaptation Needed |
|-------|-------------|-------------------|
| Authentication (Passport.js, sessions) | High | Role mapping only |
| RBAC middleware | High | New role definitions |
| WebSocket notifications | High | New event types |
| Dashboard components (StatsCard, Progress3D) | High | Data source + visualizations |
| Holographic data grids | High | Column definitions |
| Spatial OS UI (glassmorphism, animations) | High | Theme colors, new components |
| Database bootstrap (`db:ensure`) | High | New schema |
| Deployment scripts (`start_server.bat`) | Medium | Docker addition |
| File upload infrastructure | Low | New processing pipeline |
| Excel export (`xlsx`) | High | New report templates |
