# RecallOps 🧠⚡
> **AI-Powered Production Incident Response Agent with Persistent Hindsight Memory**

RecallOps is an AI-powered SRE assistant built for hackathons and production incident management. Unlike standard chatbots that only analyze static error logs, RecallOps uses **Hindsight Memory Engine** to retain verified root causes, fixes, and postmortem outcomes. When new outages occur, RecallOps recalls matching historical experiences to pinpoint fixes faster and avoid repeating previous investigations.

---

## 🌟 Key Features

1. **Incident Intake & Analysis**: Form accepting service, environment, severity, raw error logs, and symptoms.
2. **Context Extraction & Structured Hypotheses**: Uses LLM (Gemini / Groq) to extract error classifications and distinguish unverified AI hypotheses from verified facts.
3. **Hindsight Episodic Memory Engine**:
   - **Retain**: Stores verified root causes, code fixes, and verification evidence upon incident resolution.
   - **Recall**: Searches and ranks matching past incidents by semantic, service, and symptom relevance.
   - **Reflect**: Synthesizes high-level cross-incident observations over stored memories.
4. **Investigation Workbench**: Interactive UI displaying raw logs, Hindsight recalled memories with match scores, supporting evidence to check, and recommended remediation steps.
5. **Memory Explorer**: Interactive memory browser to inspect retained lessons, execute manual `recall` queries, and synthesize `reflect` insights.
6. **Live Hackathon Demo Suite**: Controlled "Before Memory vs After Memory" test runner demonstrating persistent learning live.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React + Vite + Tailwind UI                │
│    Dashboard   │   Investigation Workbench   │  Explorer    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (Axios)
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js + Express Backend                │
│  Incident Routes  │  Agent Orchestrator  │  Memory Routes  │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
┌───────▼────────┐    ┌────────▼───────┐     ┌────────▼───────┐
│ MongoDB Data   │    │  LLM Engine    │     │ Hindsight Engine│
│ Incident Logs &│    │ Gemini / Groq  │     │ Retain, Recall │
│ Resolutions    │    │ Analysis       │     │ & Reflect      │
└────────────────┘    └────────────────┘     └────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+
- **npm**: v9+

### 2. Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/recallops
HINDSIGHT_API_URL=http://localhost:8888
HINDSIGHT_BANK_ID=recallops-incidents
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Running the Server & Client
Run from root directory:
```bash
# Install root dependencies
npm install

# Install server & client dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Start both frontend and backend concurrently
npm run dev
```

The application will be accessible at:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## ⚡ Hindsight REST API Integration

RecallOps uses the official Hindsight Memory Engine endpoints:
- `POST /retain`: Retains a verified incident lesson (`{ bank_id, content, metadata }`).
- `POST /recall`: Recalls matching historical memories (`{ bank_id, query, top_k }`).
- `POST /reflect`: Synthesizes cross-incident observations (`{ bank_id, query }`).

---

## 🎬 Live 3-Minute Hackathon Demo Script

1. **Open Dashboard (`http://localhost:3000`)**: Highlight active incidents, severity badges, and Hindsight Memory Engine status indicator.
2. **Inspect Incident (`INC-2026-001`)**: Open the investigation workbench to view raw exception logs, extracted context, and Hindsight historical matches (`INC-101`).
3. **Run Demo Suite (`http://localhost:3000/demo`)**:
   - **Step 1 (Test A)**: Run analysis without memory. Notice generic unverified AI hypotheses.
   - **Step 2 (Resolve & Retain)**: Submit verified root cause ("Database connection leak in payment checkout handler") and retain in Hindsight.
   - **Step 3 (Test B)**: Submit a new similar outage. Demonstrate that RecallOps recalls `INC-2026-001`, cites the exact past verified fix, and pinpoints the code change!
