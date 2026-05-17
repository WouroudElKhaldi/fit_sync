# FitSync 🏋️‍♂️ 

FitSync is a high-performance, dual-role fitness ecosystem designed for both serious lifters and professional personal trainers. It bridges the gap between manual workout logging and professional CRM coaching platforms.

This project is built as a **Turborepo Monorepo**, sharing strictly typed data models across a Node.js backend, a React web dashboard, and an upcoming React Native mobile app.

---

## 🚀 The "Vibe Coding" Development Process

This project was built using a modern **Agent-First IDE approach ("Vibe Coding")**, heavily utilizing Google Antigravity, Claude Code and Stitch AI. However, rather than relying on generic AI outputs or one-shot monolithic prompts, I acted as the Technical Director to architect, constrain, and orchestrate the AI agents to produce a production-ready, premium SaaS application. 

Drawing on full-stack engineering and UI/UX design principles, the process involved a strategic back-and-forth with AI models to ensure scalability, normalization, and visual excellence.

### The Iterative Steps Taken:

1. **Ideation, Architecture & Schema Normalization:** 
   Before writing a single line of code, I engaged in a deep architectural brainstorming session with an advanced LLM to draft a comprehensive Functional Requirements Document (FRD). We iteratively refined a strictly normalized PostgreSQL database schema. I manually corrected the AI's tendency to build "flat" tables, ensuring the database inherently handled complex fitness logic-specifically, separating "Planned" workout targets (`expectedReps`, `expectedWeight`) from "Actual" user execution (`actualReps`, `actualWeight`) and creating a many-to-many master dictionary for Exercises, Muscles, and Equipment.

2. **UI/UX Direction & System Design (Stitch AI):** 
   To prevent the AI UI generator from hallucinating disjointed designs, I authored a strict `Design.md` system. This defined a premium, midnight-inspired aesthetic utilizing Deep Charcoal (`#1F2937`), Vibrant Purple primary actions (`#8B5CF6`), and Bronze highlights for PRs (`#B06B00`). Instead of asking Stitch AI to "build a dashboard," I orchestrated the generation iteratively-first locking in the global layout and navigation, then generating specific complex views (like the full-page draggable Calendar Planner and glassmorphism Master Data slide-over panels) one route at a time.

3. **Backend Agent Orchestration (Google Antigravity):** 
   I seeded Google Antigravity with the finalized `schema.prisma` and the TRD. I instructed the agent to scaffold the NestJS REST API and Socket.io gateway. When the AI generated basic CRUD operations, I stepped in to manually review the code, guiding the agent to optimize Prisma relational queries (avoiding the N+1 problem) and ensuring the real-time chat WebSockets were properly authenticated.

4. **Monorepo Assembly & Type Safety:** 
   I manually structured the project using Turborepo to handle the complex workspace. By generating the Prisma client inside a dedicated `packages/database` directory and exporting it, I forced the AI to utilize these shared, strict TypeScript interfaces across both the NestJS backend and the React frontend, eliminating type mismatches.

5. **Frontend Execution & Iterative Polish:** 
   With the backend compiling, I directed Antigravity to wire up the React Vite dashboard. I managed the AI's output limits by having it build components incrementally. Finally, I manually intervened to refine Tailwind CSS paddings and margins for better visual breathing room, and polished the drag-and-drop mechanics.

---

## 🛠 Tech Stack & Architecture

This project utilizes **Turborepo** to manage multiple applications and shared packages efficiently.

*   **Monorepo Tooling:** Turborepo, pnpm/npm workspaces.
*   **Backend (`apps/backend`):** NestJS, Prisma ORM, PostgreSQL, Socket.io (WebSockets).
*   **Web Dashboard (`apps/web`):** React.js (Vite), Tailwind CSS, Zustand.
*   **Mobile App (`apps/mobile`):** *[In Development]* React Native, Expo.
*   **Shared Packages (`packages/`):** Shared TypeScript types, unified database client.

---

## ✨ Core Features

*   **Dual-Role RBAC:** A single user model that seamlessly transitions between standard "Athlete" mode and professional "Trainer" mode.
*   **Granular Workout Engine:** Tracks "Expected vs. Actual" sets, reps, and weights, allowing for highly accurate progressive overload and volume calculations.
*   **Master Data Management:** A highly normalized, relational library of Exercises mapped to specific Muscles (Primary/Secondary) and Equipment.
*   **Trainer CRM Dashboard:** A web-based calendar and client management interface for trainers to bulk-assign workout templates and monitor client adherence.
*   **Real-Time Chat:** WebSocket-integrated private messaging between clients and trainers.

---

## 📂 Repository Structure

```text
fit_sync/
├── .turbo
├── apps/
│   ├── backend/            # NestJS API, Prisma Schema, WebSocket Gateway
│   ├── web/                # React Vite Admin & Trainer Dashboard
│   └── mobile/             # (Upcoming) React Native Application
├── packages/
│   ├── database/           # Centralized database package
│   │   ├── schema.prisma
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── shared-types/       # Exported Zod validation schemas & constants
├── .gitignore
├── .aignore                # Antigravity AI ignore rules
├── .vscode
├── package.json
├── turbo.json              # Turborepo pipeline configuration
└── README.md