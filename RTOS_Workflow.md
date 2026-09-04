# RTOS (Real-Time Orchestration System) Workflow in SkillOS

## Concept
In the context of the Official Statistics Learning Platform, the **RTOS** acts as the central nervous system. It processes events continuously rather than waiting for manual batch updates, ensuring that an official's competency profile, learning recommendations, and UI dashboards always reflect their exact current state.

## Core Components
1. **Event Emitter / WebSockets**: Captures live events instantly (e.g., course completed, quiz submitted, material uploaded).
2. **Asynchronous Task Queue (Redis/BullMQ)**: Handles computationally heavy AI tasks (like PDF parsing or LLM MCQ generation) without blocking the main application thread.
3. **State Sync Engine**: Pushes delta updates to the frontend dashboards dynamically.

## Implementation Workflow in the App

### 0. New User Registration (The Cold Start Engine)
- **User Action**: A new official registers, providing structured metadata vectors: Education, Designation, Department, and Experience.
- **System Response (Inference Engine)**: Before RTOS takes over, the `Competency Analyzer` uses a mapping matrix to assign initial *Estimated Scores* (e.g., M.Sc Statistics = 70/100 in Statistical).
- **Gap Calculation**: The system subtracts the *Estimated Baseline* from the *Target Profile* required for their role to identify initial skill gaps.
- **Initial Recommendations**: The `Learning Recommender` filters out advanced courses where gaps are massive, and selects beginner-to-intermediate iGOT courses to patch the exact delta.
- **Hand-off to RTOS**: The moment the user completes a recommended course or takes an AI quiz, the RTOS overwrites the *Estimated* score with the *Proven* score, self-correcting the learning path in real-time.

### 1. Data Ingestion & Event Trigger
- **User Action**: An official finishes a quiz or an iGOT course completion webhook fires.
- **RTOS Response**: The event is pushed to the real-time event bus. The system acknowledges the trigger immediately (low latency) and queues the downstream processing.

### 2. Async AI Processing
- **User Action**: A trainer uploads a 50-page PDF document on "Survey Design".
- **RTOS Response**: 
  - The API responds instantly to the frontend: "Processing Document".
  - The file is placed in a background task queue.
  - The AI worker extracts text, chunks it, and prompts the LLM to generate MCQs.
  - Progress (e.g., "Generated 5/20 questions") is continuously pushed to the client UI via WebSockets.

### 3. Real-Time Competency Recalculation
- **User Action**: A learner scores 90% on an advanced Python quiz.
- **RTOS Response**:
  - The `Competency Analyzer` service is triggered instantly via the event bus.
  - The technical skill score is updated in the database.
  - The `Gap Analysis Algorithm` recalculates the skill delta against the official's target job role.

### 4. Dynamic Recommendation & Dashboard Sync
- **System Action**: Competency gaps have shifted.
- **RTOS Response**:
  - The `Learning Recommender` queries the iGOT index for new, relevant courses that patch the remaining gaps.
  - WebSockets push the updated Competency Radar Chart and new Course Cards directly to the Learner's dashboard in real-time, requiring no page refresh.
