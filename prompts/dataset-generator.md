# CAMcq Dataset Generator Prompt

Copy everything below the line into Claude (or any LLM), fill in the `<<...>>` placeholders in **Part 1**, and send it.
Save the output as `data/questions/<your-course-slug>.json` — the filename becomes the course URL.

---

You are an expert exam-question writer. Generate a multiple-choice question dataset for my practice app, **CAMcq**. Output must be a single valid JSON file that follows the schema in Part 2 exactly.

## Part 1 — Topic details (filled in by me)

- **Course title:** <<e.g. CA Final – Direct Tax>>
- **Course description:** <<one line, e.g. "Case studies on the Income-tax Act, 1961 for A.Y. 2026-27">>
- **ID prefix:** <<short, unique per file, e.g. `dt` → ids like `dt-001`, `dt-ctx-1-q1`>>
- **Exam / level / audience:** <<e.g. CA Final students, May 2027 attempt>>
- **Applicable law / version / year:** <<e.g. Finance Act 2025, A.Y. 2026-27 — or "N/A">>
- **Question style:** <<`standalone` | `passages` (case studies) | `mixed`>>
- **Difficulty:** <<easy | moderate | hard | mixed (e.g. 30/50/20)>>
- **Number of questions:** <<e.g. 40 standalone + 5 passages × 4 questions>>
- **Options per question:** <<4 (default), allowed 2–5>>
- **Structure (sections → topics → subtopics):**
  <<Paste your outline. Example:
  - Section: Business & Profession
    - Topic: Presumptive Taxation
      - Subtopic: Section 44AD
      - Subtopic: Tax Audit Threshold
  - Section: Capital Gains
    - Topic: Exemptions
      - Subtopic: Section 54 / 54F
  Or write "Decide a sensible structure yourself.">>
- **Source material (optional):** <<paste notes / study material / ICAI MTP text, or "use your own knowledge">>
- **Extra instructions (optional):** <<e.g. "include numerical questions", "focus on amendments", "Hinglish not allowed">>

## Part 2 — Required JSON schema

```json
{
  "title": "Course Title",
  "description": "Optional one-line description",
  "sections": [
    {
      "name": "Section Name",
      "topics": [
        {
          "name": "Topic Name",
          "subtopics": [
            {
              "name": "Subtopic Name",
              "questions": [
                {
                  "id": "prefix-001",
                  "question": "Question text?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "answer": 1,
                  "explanation": "Why B is correct and why the others are wrong."
                }
              ],
              "passages": [
                {
                  "id": "prefix-ctx-1",
                  "title": "Short case title",
                  "passage": "Full case study / scenario text. Use \n\n between paragraphs.",
                  "questions": [
                    {
                      "id": "prefix-ctx-1-q1",
                      "question": "Based on the case, ...?",
                      "options": ["...", "...", "...", "..."],
                      "answer": 0,
                      "explanation": "..."
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

A subtopic may have `questions`, `passages`, or both. Omit a key entirely if it would be empty.

## Part 3 — Rules (must follow)

**Format**
1. Output **only** the JSON — no markdown fences, no commentary before or after.
2. Must parse with `JSON.parse`: double quotes only, no trailing commas, no comments, escape inner quotes as `\"` and newlines as `\n`.
3. `answer` is a **zero-indexed** integer (0 = first option). It must be a valid index into `options`.
4. `options` has 2–5 strings; use the count from Part 1.
5. Every `id` (question **and** passage) is **unique across the whole file**, uses the ID prefix, and is lowercase kebab-case. Standalone: `prefix-001`, `prefix-002`… Passages: `prefix-ctx-1`, with questions `prefix-ctx-1-q1`, `prefix-ctx-1-q2`…
6. `sections[].name`, `topics[].name`, `subtopics[].name` are required; every topic has ≥1 subtopic, every subtopic has ≥1 question or passage.

**Quality**
7. Exactly one option is unambiguously correct. Distractors must be plausible (common mistakes, wrong section numbers, miscalculations) — never joke options.
8. **Spread the correct answer position evenly** across 0/1/2/3 — don't cluster on one index.
9. Avoid "All of the above" / "None of the above" unless genuinely the best design.
10. Every question has an `explanation` (2–5 sentences) stating why the answer is right and, where useful, why key distractors are wrong. Cite sections / rules / provisions where applicable.
11. For numerical questions, show the working in the explanation (e.g. `₹95 lakh × 6% = ₹5.70 lakh`). Double-check every calculation.
12. Passages must be self-contained: include every figure needed to answer their questions. Each passage should carry 3–5 questions that test different aspects of the case.
13. Use the law/version/year stated in Part 1. If a fact is uncertain, choose a different question rather than guessing.
14. Use ₹ and Indian numbering (lakh / crore) for Indian-law content.

**Before returning,** silently verify: JSON is valid, all ids unique, every `answer` index is in range, the answer distribution is balanced, and the requested question count is met. If everything won't fit in one response, return as many complete sections as fit, still as one valid JSON file — I'll ask for the rest in a follow-up.

---

## Follow-up prompt (for large datasets)

Use this when the first response stopped early:

> Continue the same dataset. Generate the remaining sections: <<list sections/topics>>. Use the same schema and rules. Continue id numbering from `<<last id used, e.g. dt-040 / dt-ctx-5>>` — do not reuse any existing id. Output only a JSON object of the form `{ "sections": [ ... ] }` so I can merge it into the existing file's `sections` array.
