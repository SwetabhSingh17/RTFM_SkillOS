---
name: igot-integrator
description: Handles seamless integration with iGOT Karmayogi APIs and NSSTA's TPAC for course catalog retrieval, recommendations, and progress tracking.
---

# iGOT Integrator Skill

This skill defines the interaction protocols with external government learning ecosystems, primarily iGOT Karmayogi.

## Responsibilities
1. **Catalog Retrieval**: Fetch and sync the latest course catalogs from iGOT Karmayogi and NSSTA's TPAC via APIs.
2. **Metadata Processing**: Extract and index course metadata (tags, descriptions, difficulty levels) to facilitate semantic search and matching.
3. **Enrollment & Tracking**: Monitor user enrollment, track course completion status, and retrieve learning hours.
4. **Competency Score Updates**: Automatically update the official's competency scores in the LMS upon successful course completion in the external platforms.

## Security & Interoperability
- Ensure all API communications use secure, authenticated channels (OAuth2/Token-based authentication).
- Comply with government cybersecurity and data privacy guidelines.
- Implement robust error handling and fallback mechanisms for API timeouts or downtime.

## Workflow
- Run scheduled jobs to sync course catalogs.
- When the `competency-analyzer` identifies a gap, query the indexed catalog to find the most relevant courses.
- Present the recommendations via the user dashboard with direct links to the external platform.
