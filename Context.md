# AI Context for RTFM_SkillOS Portal (SIH 2026 - Problem 26101)

## Project Overview
This project is an AI-Enabled Learning Platform for India's Official Statistical System (MoSPI). It evaluates existing competencies, identifies skill gaps, and recommends personalized learning pathways (via iGOT Karmayogi integration).

## Tech Stack
- **Frontend**: Vite + React, Tailwind CSS v4, Lucide React icons, React Router.
- **Backend**: Express (Node.js), TypeScript.
- **Database**: Drizzle ORM configured for PostgreSQL.
- **AI Integration**: Local LLM hosting (Ollama or LM Studio) using the Gemma 4 E4B model. The `aiService` uses the `openai` npm package configured with a custom `baseURL` (e.g., `http://localhost:1234/v1` or `http://localhost:11434/v1`) to talk to the local model.

## Core Features
1. **Competency Gap Analysis**: Evaluates user profile metadata to determine gaps in Statistical, Technical, Digital Governance, and Behavioural domains.
2. **Personalized Learning Paths**: Recommends iGOT courses and NSSTA TPAC trainings based on detected gaps.
3. **AI Assessment Engine**: Generates MCQs and quizzes from uploaded learning materials (PDF/DOCX) using local LLMs.
4. **Dashboards**: Separate views for Learners, Trainers, and Admins to track learning hours, competency progress, and organization-wide metrics.
5. **Context-Aware AI Assistant**: A globally available chat agent that understands the user's active page route (e.g., competencies, courses, or quizzes) to provide highly contextual answers.

## Important Design Decisions
- The project was migrated from an older Academic Project Management System (APMS). Academic tables were dropped in favor of competency frameworks.
- The UI uses MoSPI/Government colors (Navy Blue, Saffron, Green) with modern aesthetics (glassmorphism, clean layouts).
- The AI implementation is designed specifically for **local hosting** (Ollama/LM Studio) due to data privacy constraints. We don't use OpenAI/Anthropic cloud APIs directly, though we use the OpenAI Node.js client configured to point to localhost.

## Where to find things
- `shared/schema.ts`: Contains the database schema (competency domains, learning paths, quizzes, iGOT courses, user profiles).
- `server/services/aiService.ts`: Contains the prompts and API calls for the local LLM.
- `server/routes/`: Express endpoints for quizzes, materials, learning paths, etc.
- `client/src/pages/`: React components for the frontend dashboards and quiz interfaces.
- `client/src/App.tsx`: App routing and Sidebar navigation.

*For future AI Agents: When making modifications to AI features, ensure you use local model configurations and avoid adding hardcoded references to proprietary cloud LLMs.*
