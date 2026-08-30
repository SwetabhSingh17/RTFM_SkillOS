# RTFM_SkillOS Portal

**AI-Enabled Learning Platform for India's Official Statistical System**

Welcome to the RTFM_SkillOS Portal! This project is developed for the Smart India Hackathon (SIH 2026 - Problem 26101). It is designed to act as a smart, AI-driven learning management system specifically tailored to the Ministry of Statistics and Programme Implementation (MoSPI).

## What it does
- **Competency Gap Analysis**: Automatically evaluates user profiles to find skill gaps.
- **Personalized Learning**: Recommends iGOT Karmayogi courses based on those gaps.
- **AI Quiz Generation**: Uses localized AI to read training documents and instantly create assessments.
- **Dashboards**: Easy-to-use interfaces for learners and trainers to monitor progress.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (using Drizzle ORM)
- **AI Engine**: Local LLMs (LM Studio or Ollama). Features real-time token streaming and dynamic auto-detection of the currently loaded model (Gemma, Llama, Qwen, Granite, etc.) for zero-configuration AI swapping.

## Quick Start
We've included automated startup scripts to get you running instantly:
- **Windows**: Double-click `start_server.bat`
- **Mac/Linux**: Run `./start_server.sh` in your terminal

*(These scripts will auto-install dependencies and launch the backend and frontend simultaneously.)*
## Documentation
Please check out our other documentation files for more info:
- [Installation Guide](Installation_Guide.md) - For step-by-step setup instructions.
- [Contributing](contributing.md) - Learn how to contribute to the project.
- [Code of Conduct](Codeofconduct.md) - Our community guidelines.
- [Security](Security.md) - Information on reporting vulnerabilities.
- [Version](Version.md) - Current version and changelog.
