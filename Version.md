# Version History

## [v1.1.0-alpha] - AI Engine & UX Polish

### Added
- **Dynamic AI Model Auto-Detection**: The backend now queries LM Studio's `/v1/models` endpoint to automatically bind to whichever model is currently loaded in memory, eliminating hardcoded model names and 400 errors.
- **Real-Time Token Streaming**: Upgraded the AI Chatbox to use Server-Sent Events (SSE) and an Async Generator loop, streaming the AI's response word-by-word instantly like ChatGPT instead of waiting for the full generation.
- **Automated Startup Scripts**: Added `start_server.bat` (Windows) and `start_server.sh` (Mac/Linux) to handle dual concurrent installation and server launching.
- **UI Enhancements**: Made the main navigation sidebar sticky (`h-screen`) to prevent the user profile and logout buttons from scrolling out of view, and updated the AI Chatbox with a blinking "Thinking..." animation.
- **Concurrency Bug Fixes**: Fixed a critical React state batching bug that caused user prompts to be overwritten by the assistant during fast streaming initializations.
- **Context-Aware Chat**: The AI assistant now implicitly understands the user's current page context by injecting the route data directly into the system prompt.

## [v1.0.0-alpha] - SIH 2026 Prototype

### Added
- **Local AI Integration**: Full support for LM Studio / Ollama local AI hosting. Replaced cloud API dependency to ensure MoSPI data privacy.
- **Frontend App**: Modern Vite + React UI tailored with MoSPI branding.
- **Dashboard View**: New interactive dashboard displaying KPI metrics and timeline-based learning paths.
- **Quiz Generator Engine**: Drag-and-drop document upload with AI-generated MCQs based on local context.
- **Database Schema**: Re-architected PostgreSQL database using Drizzle ORM to support Competency Domains and iGOT courses instead of old academic tables.
- **Mock Seed Data**: Automatically loads the initial MoSPI competency framework and sample iGOT courses for demo purposes.
- **Context Documentation**: Added `Context.md` for AI agent handoff.
- **Project Documentation**: Added README, Installation Guide, Contributing, Security, and Code of Conduct files.

### Removed
- Removed legacy APMS (Academic Project Management System) schema.
- Dropped support for Docker, Redis, and BullMQ for the prototype MVP to simplify local setup and review.
