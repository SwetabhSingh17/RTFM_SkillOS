---
name: competency-analyzer
description: Performs AI-based competency assessment and automated skill-gap analysis based on user profiles and predefined competency frameworks.
---

# Competency Analyzer Skill

This skill governs how the platform assesses an official's existing competencies and identifies skill gaps.

## Responsibilities
1. **Profile Construction**: Aggregate data from the official's profile, including designation, department, job role, current assignment, educational qualifications, work experience, and previous trainings.
2. **Framework Mapping**: Evaluate the aggregated profile against predefined competency frameworks (Statistical, Technical, Digital Governance, Behavioural/Managerial).
3. **Skill-Gap Identification**: Compare current competency levels with required competency levels for the official's current role and future career progression.
4. **Pathway Recommendation**: Use Semantic Search, ML, and NLP to match identified skill gaps with relevant training modules from iGOT Karmayogi and NSSTA's TPAC.

## Workflow
- Retrieve user profile and historical learning data.
- **Cold Start Inference**: For new users, process metadata vectors (Education, Role, Department, Experience) through a mapping matrix to generate an *Estimated Baseline Score*.
- Run the skill-gap analysis algorithm (rule-based + LLM inference) by subtracting the Baseline Score from the Role's Target Score.
- Generate a "Competency Report" detailing current levels across the required domains.
- Pass the identified gaps to the learning recommender engine.
- **RTOS Correction**: Instantly overwrite estimated baselines with actual performance scores once the user completes a quiz or course.

## Domains Covered
- **Statistical**: Survey Design, Sampling, National Accounts, etc.
- **Technical**: Python, R, SQL, AI/ML, Cloud Computing, etc.
- **Digital Governance**: Cybersecurity, Data Privacy, etc.
- **Behavioural**: Leadership, Communication, Project Management, etc.
