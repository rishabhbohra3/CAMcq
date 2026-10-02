# CAMcq — Local Interactive MCQ Learner

A local-first MCQ practice app for self-study. Drop in JSON question sets, get a clean per-course dashboard, and practice with progress tracking, spaced repetition, XP, bookmarks, and keyboard shortcuts. Everything runs and saves on your machine — no cloud, no accounts.

---

## Quick Start

### Mac / Linux
```bash
./setup.sh
```
If the script isn't executable yet:
```bash
chmod +x setup.sh && ./setup.sh
```

### Windows
**Just double-click `CAMcq.bat`.** That's it — no PowerShell, no terminal commands.

The first run installs Node.js (via winget) and downloads dependencies; subsequent runs go straight to launching the app. A console window stays open while the app is running — close it (or press `Ctrl+C`) to stop.

> If you'd prefer the PowerShell launcher, `setup.ps1` is also included. Run it with:
> ```powershell
> powershell -ExecutionPolicy Bypass -File .\setup.ps1
> ```

### What the script does
1. Checks if Node.js is installed; if not, installs it (Homebrew on Mac, winget on Windows).
2. Runs `npm install` on first launch (subsequent launches skip this).
3. Starts the app at **http://localhost:5173** and opens it in your browser.

To stop the app, press `Ctrl+C` in the terminal window.

---

## Loading Questions

1. Drop any `.json` file (following the schema below) into the **`data/questions/`** folder.
2. Refresh the dashboard — the new course appears automatically.

The filename becomes the URL slug (e.g. `aws-saa-c03.json` → `/course/aws-saa-c03`).

A working example is included: **[`data/questions/sample-linux-basics.json`](data/questions/sample-linux-basics.json)** — open it to see a full course with multiple sections, topics, and subtopics.

### JSON Schema

```json
{
  "title": "Course Name",
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
                  "id": "unique-q-id-001",
                  "question": "Your question text?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "answer": 1,
                  "explanation": "Why option B is correct (optional)."
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

### Schema Rules

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Shown on the dashboard card |
| `description` | no | One-line subtitle on the course card |
| `sections[]` | yes | Top level grouping (e.g. "Compute", "Networking") |
| `sections[].topics[]` | yes | Mid-level grouping (e.g. "EC2", "VPC") |
| `topics[].subtopics[]` | yes | Leaf grouping that holds questions |
| `questions[].id` | yes | **Must be unique across the whole file** — used for progress tracking. Keep stable even if you edit text. |
| `questions[].options` | yes | Array of 2–5 strings |
| `questions[].answer` | yes | **Zero-indexed** index of the correct option (0 = first, 1 = second, etc.) |
| `questions[].explanation` | no | Shown after answering in Practice mode |

### Passage-Based Questions (Reading Comprehension / Case Studies)

A subtopic can also hold **passage groups** — a shared piece of context (passage, scenario, case study) with multiple questions about it. During practice, the passage stays pinned on one side of the screen while you answer questions on the other. On mobile the passage stacks on top with a collapse toggle.

Add a `passages` array to any subtopic — alongside (or instead of) `questions`:

```json
{
  "name": "Pricing Decisions",
  "passages": [
    {
      "id": "p-pricing-001",
      "title": "Aurora Analytics — Pricing Pivot",
      "passage": "Aurora Analytics, a five-year-old SaaS company...\n\nFirst, large customers...",
      "questions": [
        {
          "id": "p-pricing-001-q1",
          "question": "Based on the passage, what is the primary financial risk?",
          "options": ["...", "...", "...", "..."],
          "answer": 1,
          "explanation": "..."
        }
      ]
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `passages[].id` | yes | Unique identifier for the passage group |
| `passages[].title` | no | Optional short title shown above the passage |
| `passages[].passage` | yes | The passage / scenario text. Use `\n\n` for paragraph breaks; whitespace is preserved |
| `passages[].questions[]` | yes | Same shape as standalone questions — each has its own `id`, `options`, `answer`, `explanation` |

A working example: [`data/questions/sample-passage-reading.json`](data/questions/sample-passage-reading.json) — shows a mix of pure passage subtopics and subtopics that combine passages with standalone MCQs.

**Notes:**
- Questions within a passage group always appear **contiguously** in the queue — you won't be forced to re-read the passage by jumping back and forth.
- Subtopics that contain any passage are tagged with a **📖 Passage** badge in the course tree.
- Progress, XP, bookmarks, notes, and SM-2 spaced repetition all work identically to standalone questions — every passage question is tracked by its own `id`.

---

## Features & Usage

### Quiz Modes
- **Practice** — see correct/wrong feedback and the explanation immediately after each answer. Best for learning new material.
- **Exam Mode** — answer every question, then get a full score summary at the end. Simulates a real test.
- **Review** — only re-queues questions you previously got wrong or haven't seen yet. Best for plugging gaps.

### Drilling into a specific subtopic
On the course page, hover any subtopic row and click **Practice →** to start a focused mini-session on just that subtopic.

### XP & Streaks
- **+10 XP** per correct answer in Practice / Review
- **+5 XP** per correct answer in Exam (revealed at the end)
- Streak counter resets when you get one wrong; visual flash at 10+

### Spaced Repetition (SM-2)
Questions you've answered are scheduled for review based on how easy you found them. Wrong answers come back the next day; consistently correct answers space out further over time. Builds in automatically — no setup needed.

### Bookmarks & Notes
- Star any question with the **bookmark** icon (or press `B` during a quiz).
- Click the **note** icon to add personal notes that auto-save on blur.
- View all bookmarked questions for a course via the **Bookmarked** button on the course page.

## Where Progress is Saved

All progress lives in **`data/progress/<course-slug>.json`** on your machine. Each course gets its own file containing XP, per-question status, attempt counts, SM-2 scheduling data, bookmarks, and notes.

Back this folder up to keep your progress safe. To reset all progress for a course, use the **Reset** button on the course page (or delete the corresponding file in `data/progress/`).

---

## Updating an Existing Question File

You can freely edit a course's JSON file while the app is running. Refresh the dashboard or course page and the new content appears. **Progress is keyed by question `id`**, so here's what happens to existing progress when you update a file:

| Change you make | What happens to progress |
|---|---|
| Edit a question's text, options, or explanation (same `id`) | Progress kept — the question still counts as answered with the same status |
| Add a new question with a new `id` | Shows up as "unseen" — no progress yet |
| Remove a question (its `id` no longer exists in the file) | The orphaned entry stays in the progress file but is ignored — no impact |
| Change a question's `id` | Progress is **lost** for that question (treated as a brand-new question) |
| Change the file's name | The whole course is treated as new (slug changes) — old progress file is orphaned |
| Change the correct `answer` index | Future answers use the new correct option; past attempts keep their original status |
| Rename a section / topic / subtopic | Has no impact on progress (progress is per-question, not per-grouping) |

**Rule of thumb:** keep `id` values stable across edits and your progress will follow along correctly.

---

## Folder Structure

```
CAMcq/
├── data/
│   ├── questions/    ← drop your question JSON files here
│   └── progress/     ← auto-generated, one file per course
├── src/              ← React frontend
├── server/           ← Express filesystem API
├── setup.sh          ← Mac/Linux launcher
├── CAMcq.bat         ← Windows launcher (double-click)
└── setup.ps1         ← Windows launcher (PowerShell alternative)
```

---

## Tips for Authoring Question Sets

- **Keep `id` values stable.** Once you've answered questions and built up progress, changing an id resets that question's history.
- **Use a consistent id prefix** per file (e.g. `aws-001`, `aws-002`) so ids stay unique across courses.
- **Sections / Topics / Subtopics are all just labels** — name them however helps you study. The hierarchy is purely organizational.
- **Explanations are optional** but worth writing — they're the main thing you'll read in Practice mode.
- **For huge question banks**, split them across multiple JSON files. Each file becomes its own course on the dashboard.

---

## Troubleshooting

**"npm: command not found" on Mac**
The setup script installs Node.js via Homebrew. If Homebrew itself isn't installed, the script tries to install it. If that fails, install Node manually from <https://nodejs.org> and re-run `./setup.sh`.

**Port 5173 or 3001 already in use**
Another process is using the port. Stop it, or edit `vite.config.ts` (frontend port) / `server/index.js` (backend port) to change them.

**Course doesn't appear after dropping a JSON**
1. Check the file ends in `.json` and is inside `data/questions/`.
2. Validate the JSON (a typo in commas/quotes will silently skip the file).
3. Refresh the dashboard page.

**Progress reset**
Delete `data/progress/<slug>.json` for that course. The course itself stays intact.

---

## Tech Stack
React 18 + Vite + TypeScript · Tailwind CSS · Express · Framer Motion · Zustand · Lucide React
