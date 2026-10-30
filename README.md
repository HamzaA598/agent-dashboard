# Event-Driven Multi-Agent Orchestration Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Trigger.dev](https://img.shields.io/badge/Trigger.dev-v4.6-emerald?style=flat-square)](https://trigger.dev/)
[![E2B](https://img.shields.io/badge/E2B-Firecracker_KVM-orange?style=flat-square)](https://e2b.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-lightgreen?style=flat-square)](https://orm.drizzle.team/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat-square)](https://neon.tech/)

An enterprise-grade, event-driven multi-agent orchestration platform designed to decouple interactive user streaming from long-running, compute-heavy autonomous workflows. Powered by a distributed saga pattern, durable background worker execution, isolated Firecracker micro-VM sandboxes, and real-time Server-Sent Events (SSE).

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       Next.js 16 App Router Client     |
                      |   (Streaming Chat UI & Token Metrics) |
                      +-------------------+-------------------+
                                          |
                        HTTP POST (Turn)  |  Unidirectional SSE Stream
                                          v
                      +---------------------------------------+
                      |         Next.js API Route (/chat)     |
                      |  - TCP Chunk Remainder Buffer         |
                      |  - Session Context & Turn Routing     |
                      +-------------------+-------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         [Lightweight Turns (<15s)]              [Durable Tasks (>15s)]
         +------------------------+              +-------------------------+
         | In-Request Vercel AI   |              | Trigger.dev Background  |
         | Execution (Groq/Gemini)|              | Worker (Durable Saga)   |
         +------------------------+              +------------+------------+
                                                              |
                                                              v
                                                 +-------------------------+
                                                 | E2B Micro-VM Sandbox    |
                                                 | (Firecracker KVM Linux) |
                                                 | - Safe Shell Execution  |
                                                 | - Surgical File Patching|
                                                 +-------------------------+
                                                              |
                                                              v
                                                 +-------------------------+
                                                 | Neon PostgreSQL         |
                                                 | (Drizzle ORM Ledger)    |
                                                 +-------------------------+
```

---

## Key Engineering Highlights

### 1. Decoupled In-Request vs. Durable Background Workers
Serverless edge functions suffer from strict execution timeouts (15s–60s). This platform uses an intelligent dispatch model:
- **Fast Conversational Turns:** Handled in-request with immediate SSE token streaming.
- **Autonomous & Tool-Heavy Workloads:** Dispatched out-of-band to **Trigger.dev durable execution workers**, allowing long-running tasks to execute reliably across network disconnects, server resets, or timeouts.

### 2. Surgical Micro-VM Sandboxes (E2B Firecracker KVM)
Provides autonomous coding and research agents with isolated Linux micro-VMs:
- **Thread-Scoped Reuse:** Eliminates 3–5s container cold-start overhead per tool call.
- **Surgical Tool Suite:** Dedicated tools for safe command execution, directory traversal, file inspection, and structured diff patching without contaminating host environments.

### 3. Fragment-Safe Server-Sent Events (SSE) Gateway
TCP fragmentation frequently splits UTF-8 tokens and structured JSON tool payloads across packet boundaries:
- Implemented an in-memory **TCP chunk remainder buffer** that stores incomplete payloads until boundary delimiters arrive, ensuring zero parse crashes on streaming UIs.

### 4. Concurrency & Anti-Runaway Controls
- Enforces anti-parallel tool-calling directives to prevent agent race conditions.
- Uses an isolated synthesis runner to prevent recursive infinite loops during subagent delegations.

---

## Tech Stack

| Domain | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend & API** | Next.js 16 (App Router), React 19, TypeScript | High-performance React Server Components & Streaming SSR |
| **Durable Execution** | Trigger.dev v4.6 | Fault-tolerant, background worker saga execution |
| **Sandboxing** | E2B Code Interpreter (Firecracker KVM) | Hardware-isolated Linux execution environments |
| **Database & ORM** | Neon PostgreSQL Serverless, Drizzle ORM | Type-safe, ultra-low-latency SQL schema & migrations |
| **AI SDK & Models** | Vercel AI SDK (`ai`), Groq, Google Generative AI | High-throughput streaming inference & structured output |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons | Responsive modern dashboard design system |

---

## Project Structure

```
├── app/
│   ├── api/chat/route.ts       # SSE streaming chat gateway & turn router
│   ├── agents/                 # Agent registry & inspection dashboard
│   ├── chat/                   # Interactive streaming chat interface
├── lib/
│   ├── ai/
│   │   ├── agents/             # Orchestrator, Coder, Researcher subagents
│   │   ├── tools/              # Sandboxed command, read, write, patch tools
│   │   └── llms/               # Model provider configurations
│   └── db/
│       ├── schema.ts           # Drizzle relational schema & types
│       └── index.ts            # Neon serverless client connection pool
├── trigger/
│   ├── run-agent.ts            # Durable background worker tasks
│   └── test-run.ts             # Synthetic load and verification harnesses
└── drizzle.config.ts           # Drizzle migration and connection config
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm or npm
- Neon PostgreSQL Database URL
- Trigger.dev Account & API Keys
- E2B API Key

### 1. Clone & Install
```bash
git clone https://github.com/HamzaA598/agent-dashboard.git
cd agent-dashboard
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file:
```env
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
TRIGGER_SECRET_KEY="tr_dev_..."
E2B_API_KEY="e2b_..."
GROQ_API_KEY="gsk_..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

### 3. Run Database Migrations
```bash
npx drizzle-kit push
```

### 4. Start Development Server & Trigger Worker
```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Trigger.dev background worker listener
npx @trigger.dev/cli@latest dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.
