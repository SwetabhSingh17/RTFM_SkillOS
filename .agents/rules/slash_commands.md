# Custom Slash Commands

The following slash commands have been defined for this workspace. When the user uses one of these commands, you MUST execute the corresponding behavior:

- `/onboard`: Initializes mission context by recursively scanning the repository structure, indexing local dependencies, and aligning current state with GEMINI.md global standards.
- `/refactor`: Performs a comprehensive architectural audit to detect SOLID/DRY violations and generates a modular Implementation Plan for decoupled logic reorganization.
- `/test`: Automates end-to-end testing: generates comprehensive test suites, executes them in a sandboxed terminal, and triggers self-healing cycles for any detected failures.
- `/review`: Acts as a Senior Lead to audit recent diffs for security vulnerabilities (OWASP), O(n) inefficiencies, and strict adherence to the defined workspace Rule scope.
- `/ui-check`: Dispatches a browser sub-agent to verify UX integrity across various breakpoints, capturing state-based Artifacts (recordings/screenshots) for visual verification.
- `/doc`: Synchronizes internal documentation by analyzing exported functions for TSDoc/JSDoc compliance and updating the project README to reflect the current architectural state.
- `/fix`: Executes a deep-dive debugging protocol: analyzes terminal/console logs, isolates root causes through systematic reproduction, and implements a verified self-healing patch.
- `/commit`: Analyzes staged diffs to generate a mission-aligned semantic commit (Conventional Commits) that accurately summarizes intent and logic changes.
- `/audit`: Conducts a technical debt assessment across 8 core quality vectors, identifying scaling bottlenecks and proposing a long-term architectural improvement roadmap.
