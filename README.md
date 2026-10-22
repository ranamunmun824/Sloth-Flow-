# SlothFlow — The Lazy-Day AI Assistant

> **"Do less busywork. Keep your brain for better things."**  
> *Built with open-weight Gemma 4 for the DEV.to "Slow and Steady" Open-Weight AI Challenge.*

---

## 🦥 1. Project Overview

**SlothFlow** is a lightweight, calm productivity web application designed to reduce unnecessary cognitive overhead. 

Modern life bombards us with unstructured inputs: chaotic thoughts, sprawling meeting notes, difficult messages to answer, and unrealistic to-do lists. Rather than forcing you into a rigid, overwhelming productivity system, SlothFlow uses **open-weight Gemma 4** to turn messy input into tiny, stress-free actions, realistic schedules with built-in pauses, and two-sentence summaries.

Crucially, SlothFlow supports **both Hosted Gemma 4 (via Google GenAI)** and **Local Gemma 4 (via Ollama)**, giving users genuine privacy sovereignty and offline capability.

---

## 📸 Screenshots

*(UI Mockups & Captures)*

```
+---------------------------------------------------------------------------------+
|  🦥 SlothFlow [Gemma 4]             [● Hosted: gemma-4-26b-a4b-it]              |
|                                                                                 |
|  "Let AI handle the little things."                                             |
|  Turn messy thoughts into tiny plans, long notes into clear summaries...        |
|                                                                                 |
|  [ Start being a sloth ]   [ Make a Tiny Plan ]                                 |
|                                                                                 |
|  +--------------------+   +--------------------+   +--------------------+       |
|  | Organize thoughts  |   | Plan my day        |   | Summarize chaos    |       |
|  | Unstructured dumps |   | Pacing with breaks |   | Exactly 2 lines    |       |
|  +--------------------+   +--------------------+   +--------------------+       |
+---------------------------------------------------------------------------------+
```

---

## 🌿 2. Features

1. **Brain Dump Workspace**
   - Paste unstructured thoughts, obligations, and reminders.
   - Specify your current energy (Very Low, Low, Medium, High) and available time.
   - Gemma 4 outputs:
     - One-sentence core focus.
     - **Micro-Action under 5 minutes** to build effortless momentum.
     - Actionable prioritized tasks with effort estimates.
     - Tasks that can wait safely (anti-burnout).
     - Tasks to drop or delegate.
     - Copy as formatted text or export as `.md`.

2. **Tiny Plan Scheduler**
   - Input your tasks, timeline, and deadline constraints.
   - Gemma 4 produces a realistic schedule with sloth breaks and an explicit stopping point.
   - **Interactive Anti-Burnout Buttons**:
     - *Make the plan easier*: Sends a live prompt to Gemma 4 to reduce task friction and expand breaks.
     - *Fit into less time*: Intelligently condenses tasks to the top essentials.
     - *Increase available time*: Dynamically increments planning time.
     - Save plans to browser `localStorage`.

3. **Two-Line Summary**
   - Summarize rambling emails, transcripts, or notes.
   - Guaranteed **exactly two concise sentences** for the core summary.
   - Extracts key decisions, action items, dates, and deadlines.
   - **Ambiguity Detection**: Highlights when source text lacks sufficient clarity or evidence.
   - Explicit privacy guarantee (no private inbox snooping).

4. **Reply Assistant**
   - Draft thoughtful, respectful message replies.
   - Select from 5 tones: *Friendly, Professional, Casual, Polite but firm, Brief & direct*.
   - Never invents commitments or false promises on your behalf.
   - Edit directly in place and copy with one click.

5. **DEV.to Blog Studio**
   - Tailored technical article generator for the DEV.to **"Slow and Steady"** challenge.
   - Pre-fills verified architecture details directly from your codebase.
   - Markdown editor with side-by-side rendered preview.
   - Refinement shortcuts (*Regenerate intro*, *Improve technical details*, *Make more concise*).
   - Automated 11-point **Quality & Honesty Checklist** before submission.

6. **Protected DEV.to API Publishing**
   - Server-side route calling the official Forem API (`POST https://dev.to/api/articles`).
   - **Default: Draft mode (`published: false`)**.
   - **Explicit Confirmation Modal** before public publishing (`published: true`).
   - Protected by server-side `PUBLISHER_ACCESS_CODE` to prevent unauthorized publishing through your server.
   - Rate-limiting cooldown to prevent duplicate submissions.

---

## 🏛️ 3. Architecture & Data Flow

```
                      +-----------------------------+
                      |   SlothFlow Web Interface  |
                      |   (React 19 + TypeScript)   |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
      (Mode A: Hosted Gemma 4)                    (Mode B: Local Gemma 4)
               |                                           |
     POST /api/ai/generate                        POST /v1/chat/completions
               |                                           |
    +----------v----------+                     +----------v----------+
    | Node.js / Express   |                     | Local Ollama Daemon |
    | Server Runtime      |                     | (http://localhost:  |
    +----------+----------+                     |      11434)         |
               |                                +----------+----------+
    Google GenAI SDK                                       |
    (process.env.GEMINI_API_KEY)                Gemma 4 Local Weights
               |                                (gemma4:e2b / e4b)
    +----------v----------+                     [100% On-Device / Offline]
    | Google Gemma 4 API  |
    | gemma-4-26b-a4b-it  |
    +---------------------+

   [DEV.to Publishing Data Flow]
   React Web UI ---> POST /api/devto/articles ---> Official DEV.to Forem API
                     (Validates Access Code &       (POST https://dev.to/api/articles)
                      injects DEVTO_API_KEY)
```

### Local vs. Hosted Isolation Guarantee:
- **Local Mode**: The browser makes HTTP fetch calls directly to `http://localhost:11434`. Prompts never pass through any cloud backend or the hosted server.
- **Hosted Mode**: Input is sent to the application server, which signs requests with the server's `GEMINI_API_KEY` to Google's official GenAI API.

---

## ⚡ 4. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **Build Tool**: Vite 8 with `@vitejs/plugin-react`
- **Hosted AI SDK**: `@google/genai` (v2.4.0+)
- **Local AI Runtime**: Ollama (OpenAI-compatible `/v1/chat/completions` API)
- **External Publishing**: DEV.to Forem REST API v1
- **Persistence**: Browser `localStorage` (configurable, can be wiped anytime)

---

## 📦 5. Setup & Installation

### Prerequisites
- Node.js 20+ installed
- (Optional for hosted mode) A Google AI Studio API key (`GEMINI_API_KEY`)
- (Optional for local mode) Ollama installed

### Step 1: Clone and Install
```bash
git clone https://github.com/your-username/slothflow.git
cd slothflow
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Fill in the variables:
```ini
# GEMINI_API_KEY: Required for hosted Gemma 4 AI API calls
GEMINI_API_KEY="your-gemini-api-key"

# DEVTO_API_KEY: DEV.to Forem API key for publishing articles
DEVTO_API_KEY="your-devto-api-key"

# PUBLISHER_ACCESS_CODE: Secret code protecting DEV.to draft and publish actions
PUBLISHER_ACCESS_CODE="my-secret-publish-passcode"

# APP_URL: Optional hosting URL
APP_URL="http://localhost:3000"
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💻 6. Local Gemma 4 Setup (Ollama)

To run SlothFlow with 100% on-device privacy:

1. **Install Ollama**: Download from [ollama.com](https://ollama.com).
2. **Download Gemma 4 weights**:
   ```bash
   ollama pull gemma4:e2b
   ```
   *(Or `ollama pull gemma4:e4b` for a larger model if you have 8GB+ VRAM).*
3. **Start Ollama with Browser CORS Allowed**:
   Because modern browsers enforce CORS security when a web page talks to `localhost:11434`, launch Ollama with permitted origins:
   ```bash
   # On macOS / Linux:
   OLLAMA_ORIGINS="*" ollama serve

   # On Windows (Command Prompt):
   set OLLAMA_ORIGINS=*
   ollama serve
   ```
4. In SlothFlow, navigate to **Settings**, toggle to **Local Gemma 4 (Ollama)**, and click **Test Local Connection**.

---

## 🔒 7. Privacy & Offline Behavior

- **Local Inference**: 100% offline once the weights are downloaded. Prompts never leave your computer.
- **Hosted Inference**: Sends prompts over TLS/HTTPS to Google's hosted Gemma 4 endpoint.
- **Offline Capabilities**:
  - ✅ Brain Dump, Tiny Plan, Summaries, and Reply Assistant run completely offline in Local Mode.
  - ❌ Hosted Gemma API, DEV.to Draft Saving, and DEV.to Publishing require an active internet connection.
- **Data Retention**: All user task histories are stored strictly in client-side `localStorage`. No user notes are logged or retained on the server.

---

## 🧪 8. Verification & Testing

SlothFlow includes runtime validation and route verification:

1. **Health Check**:
   ```bash
   curl -i http://localhost:3000/api/health
   ```
2. **Config Status Check**:
   ```bash
   curl -i http://localhost:3000/api/config-status
   ```
3. **TypeScript & Build Verification**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 📄 9. License

This project is open-source under the **Apache 2.0 License**. See the `LICENSE` file for details.
