---
name: ai-quiz-generator
description: Generates objective type questions (MCQs) and quizzes from uploaded learning materials (documents, presentations, videos) using LLMs and NLP.
---

# AI Quiz Generator Skill

This skill provides guidelines and procedures for generating dynamic assessments from learning materials.

## Responsibilities
1. **Content Extraction**: Parse and extract text from various file formats (PDF, DOCX, PPTX) and multimedia (video transcripts).
2. **Context Chunking**: Split extracted text into logical chunks suitable for LLM processing while retaining semantic context.
3. **MCQ Generation**: Use prompt engineering to generate high-quality Multiple Choice Questions (MCQs) from the context. Ensure questions assess comprehension, application, and analysis rather than just rote memorization.
4. **Evaluation and Feedback**: Generate correct answers, distractors (incorrect options), and detailed explanations/feedback for each option to reinforce learning outcomes.
5. **Formatting**: Output the generated quizzes in a standardized JSON schema for seamless integration into the LMS database.

## Workflow
- When a user uploads a document, invoke the extraction pipeline.
- Pass the extracted text through the LLM with a strict JSON output instruction.
- Validate the output schema before saving it to the database.

## Best Practices
- Ensure distractors are plausible.
- Keep the language clear and unambiguous.
- Validate that the correct answer is factually supported by the provided text.
