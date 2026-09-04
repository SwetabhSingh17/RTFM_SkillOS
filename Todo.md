 # Project TODO List

## 1. Database & Infrastructure
- [x] Migrate existing schema to learning-focused tables (competencies, courses, quizzes).
- [x] Implement environment variables for LLM services and iGOT APIs.
- [x] Set up Redis and background task queues for RTOS architecture.

## 2. API & Integration
- [x] Build iGOT API client (fetch catalog, track enrollments).
- [x] Implement file upload handlers for PDF/PPTX/Video.
- [x] Set up WebSocket server for real-time frontend updates.

## 3. AI & Assessment
- [x] Write prompt engineering templates for MCQ generation.
- [x] Integrate text extraction libraries for documents.
- [x] Develop the skill-gap analysis algorithm matching profiles against the 4 domains.
- [x] Implement the "Cold Start" logic to infer initial baselines from user onboarding metadata.
- [x] Define Cold Start Weight Vectors (Education, Designation, Department, Experience) and mapping matrix.
- [x] Implement the gap calculation (Target Profile - Estimated Baseline).

## 4. Frontend & Dashboards
- [x] Create Learner Dashboard (Competency Radar, Progress Timeline).
- [x] Create Admin Dashboard (Workforce Heatmaps, Analytics).
- [x] Implement the Quiz taking UI with instant feedback support.
- [x] Refactor existing UI to match MoSPI/Government branding.
- [x] Implement Admin HR Panel for bulk user upload via CSV.
- [x] Implement new User Registration and Onboarding flow to capture Cold Start Metadata.

## 5. Security & Deployment
- [x] Implement standard Role-Based Access Control (RBAC).
- [x] Containerize the app using Docker.
- [x] Prepare mock data (seeders) for the hackathon presentation.
