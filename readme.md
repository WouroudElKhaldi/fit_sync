# FitSync 🏋️‍♂️ 

FitSync is a high-performance, dual-role fitness ecosystem designed for both serious lifters and professional personal trainers. It bridges the gap between manual workout logging and professional CRM coaching platforms.

This project is built as a **Turborepo Monorepo**, sharing strictly typed data models across a NestJS backend, a React web dashboard, and a React Native mobile app.

---

## 🚀 The "Vibe Coding" Development Process

This project was built using a modern **Agent-First IDE approach ("Vibe Coding")**, heavily utilizing Google Antigravity, Claude Code, and Stitch AI. However, rather than relying on generic AI outputs or one-shot monolithic prompts, I acted as the Technical Director to architect, constrain, and orchestrate the AI agents to produce a production-ready, premium SaaS application. 

Drawing on full-stack engineering and UI/UX design principles, the process involved a strategic back-and-forth with AI models to ensure scalability, normalization, and visual excellence.

### The Iterative Steps Taken:

1. **Ideation, Architecture & Schema Normalization:** Before writing a single line of code, I engaged in a deep architectural brainstorming session with an advanced LLM to draft a comprehensive Functional Requirements Document (FRD). We iteratively refined a strictly normalized PostgreSQL database schema. I manually corrected the AI's tendency to build "flat" tables, ensuring the database inherently handled complex fitness logic—specifically, separating "Planned" workout targets (`expectedReps`, `expectedWeight`) from "Actual" user execution (`actualReps`, `actualWeight`) and creating a many-to-many master dictionary for Exercises, Muscles, and Equipment.

2. **UI/UX Direction & System Design (Stitch AI):** To prevent the AI UI generator from hallucinating disjointed designs, I authored a strict `Design.md` system. This defined a premium, midnight-inspired aesthetic utilizing Deep Charcoal (`#1F2937`), Vibrant Purple primary actions (`#8B5CF6`), and Bronze highlights for PRs (`#B06B00`). Instead of asking Stitch AI to "build a dashboard," I orchestrated the generation iteratively—first locking in the global layout and navigation, then generating specific complex views (like the full-page draggable Calendar Planner and glassmorphism Master Data slide-over panels) one route at a time.

3. **Backend Agent Orchestration (Google Antigravity):** I seeded Google Antigravity with the finalized `schema.prisma` and the TRD. I instructed the agent to scaffold the NestJS REST API and Socket.io gateway. When the AI generated basic CRUD operations, I stepped in to manually review the code, guiding the agent to optimize Prisma relational queries (avoiding the N+1 problem) and ensuring the real-time chat WebSockets were properly authenticated.

4. **Monorepo Assembly & Type Safety:** I manually structured the project using Turborepo to handle the complex workspace. By generating the Prisma client inside a dedicated `packages/database` directory and exporting it, I forced the AI to utilize these shared, strict TypeScript interfaces across both the NestJS backend and the React frontend, eliminating type mismatches.

5. **Frontend Execution & Iterative Polish:** With the backend compiling, I directed Antigravity to wire up the React Vite dashboard. I managed the AI's output limits by having it build components incrementally. Finally, I manually intervened to refine Tailwind CSS paddings and margins for better visual breathing room, and polished the drag-and-drop mechanics.

6. **Initial UI & Dummy Data:** After initializing the app and resolving initial setup configuration issues, I constructed the core UI utilizing dummy data. This allowed me to rapidly iterate on the visual hierarchy and UX without being blocked by backend data constraints.

7. **Authentication & Security:** Once the UI was visually locked in, I implemented secure JWT-based authentication across the app, tying the frontend states to verified backend sessions and protecting private routes.

8. **Dynamic Dashboard & Backend Integration:** I connected the dashboard to the real backend endpoints, transitioning the entire platform to be fully dynamic. Simultaneously, I orchestrated the AI to build out all missing backend functionalities and database queries required to support the complex UI interactions.

9. **Feature Completion & Final Polish:** All core features were successfully integrated into the dashboard: complete authentication, workout creation and logging, advanced real-time chatting, sharing workouts between trainers, sending system complaints to the dashboard owner, account verification, and session reviews. Finally, I refined and finalized the design of the entire dashboard to ensure a flawless, premium aesthetic.

---

## 🛠 Tech Stack & Architecture

This project utilizes **Turborepo** to manage multiple applications and shared packages efficiently.

* **Monorepo Tooling:** Turborepo, npm workspaces.
* **Backend (`apps/backend`):** NestJS, Prisma ORM, PostgreSQL, Socket.io (WebSockets).
* **Web Dashboard (`apps/web`):** React.js (Vite), Tailwind CSS, Zustand.
* **Mobile App (`apps/mobile`):** React Native, Expo SDK 54, NativeWind v4, React Navigation v7.
* **Shared Packages (`packages/`):** Shared TypeScript types, unified database client.

---

## ✨ Core Features

* **Dual-Role RBAC:** A single user model that seamlessly transitions between standard "Athlete" mode and professional "Trainer/Admin" mode.
* **Granular Workout Engine:** Tracks "Expected vs. Actual" sets, reps, and weights, allowing for highly accurate progressive overload and volume calculations.
* **Master Data Management:** A highly normalized, relational library of Exercises mapped to specific Muscles (Primary/Secondary) and Equipment.
* **Trainer CRM Dashboard:** A web-based calendar and client management interface for trainers to bulk-assign workout templates and monitor client adherence.
* **Workout Builder & Templates:** A sophisticated drag-and-drop interface allowing trainers to build customized workout protocols and save them to a reusable library.
* **Advanced Real-Time Chat (Comms Hub):** * WebSocket-integrated private messaging and group channels.
  * Rich text messaging with interactive emoji support, real-time online presence, and read receipts.
  * Seamlessly attach and send Workout Templates directly in chats.
  * **Group Management:** Create groups, invite trainers/admins to groups, accept/reject group invitations, rename groups, remove members, and delete groups.
  * **Privacy & Control:** Soft-delete (clear) chat histories locally and block/unblock users.
* **Networking & Discovery:** A robust system to discover other trainers/admins, send connection requests, and manage your professional network.
* **Real-time Notifications:** In-app popups and notification indicators for new messages, group invites, and connection requests.
* **Secure Authentication & Account Management:** JWT-based session handling, password recovery via email (OTP), and account settings management.

---

## 📂 Repository Structure

```text
fit_sync/
├── .turbo
├── apps/
│   ├── backend/            # NestJS API & WebSocket Gateway
│   ├── web/                # React Vite Admin & Trainer Dashboard
│   └── mobile/             # React Native Expo Application
├── packages/
│   ├── database/           # Centralized database package (Prisma client hub)
│   │   ├── prisma/
│   │   │   ├── seed.ts     # Master dictionary data seed script
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── shared-types/       # Exported Zod validation schemas & constants
├── package.json            # Root configuration and execution workspace mappings
├── turbo.json              # Turborepo task graph pipeline configurations
└── README.md
```

## 🛠️ Local Setup & Installation

Follow these exact steps to get the entire FitSync monorepo running on your local machine.

### Prerequisites
*   Node.js (v24 or higher)
*   npm
*   PostgreSQL running locally (ensure you have your username and password ready)

### 1. Clone the Repository
Open your terminal and clone the repository to your local machine:

```bash
git clone https://github.com/WouroudElKhaldi/fit_sync.git
cd fit_sync
```

### 2. Environment Configuration
Because this is a monorepo, environment variables are decoupled to match their specific execution boundaries. You need to create two separate `.env` files.

#### File 1: Root Configuration
Create a `.env` in the root `fit_sync` folder to configure globally shared execution tasks (like Prisma triggers):

```env
# /fit_sync/.env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fitsync?schema=public"
```

#### File 2: Backend Services
Create a dedicated `.env` inside `apps/backend/` for the NestJS API parameters:

```env
# /fit_sync/apps/backend/.env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fitsync?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=3000
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_specific_password"
SUPPORT_EMAIL="your_email@gmail.com"
```

### 3. Install Workspace Dependencies
Install dependencies globally for all root pipelines, internal applications, and workspace packages. Run this single command from the root `fit_sync` folder:

```bash
npm install
```

### 4. Database Setup & Prisma ORM Generation
You must push your database schema and generate the Prisma Client before running the apps so TypeScript knows your database structure. Run these commands from the root directory:

```bash
# 1. Push the schema definitions from your shared package to PostgreSQL
npx prisma db push --schema=packages/database/prisma/schema.prisma

# 2. Generate the type-safe internal packages client
npx prisma generate --schema=packages/database/prisma/schema.prisma
```

### 5. Feeding the Database Seeds
Populate your database with the core structural dictionaries (Exercises, Muscles, Equipment) and baseline test accounts.

> **Note:** Before running this, ensure your `packages/database/package.json` file contains the following seed command under the "prisma" key: `"seed": "ts-node prisma/seed.ts"`

Run the seeder engine via npm workspace targeting from the root directory:

```bash
npm run seed --workspace=packages/database
```

## 💻 Running the Applications
The project uses Turborepo to efficiently run multiple applications at once.

### 🌐 Booting Web and Backend Services
To spin up your NestJS API application and React Vite web dashboard concurrently, run this from the root folder:

```bash
npm run dev
```

*   **Web UI Dashboard:** `http://localhost:5173`
*   **Backend API Server:** `http://localhost:3000`

*(Optional: To view and edit your raw database data visually, open a new terminal and run: `npx prisma studio --schema=packages/database/prisma/schema.prisma`. This opens at `http://localhost:5555`)*

### 📱 Booting the React Native Mobile Application
> **⚠️ Crucial Monorepo Constraint:** You must never run the mobile compilation command from the repository root folder. Doing so will cause the Metro asset bundler paths to lose tracking alignment.

Open a new, dedicated terminal tab and navigate straight into the mobile workspace folder:

```bash
cd apps/mobile
```

Launch the Expo development server, explicitly clearing the cache to ensure NativeWind and Metro compile cleanly:

```bash
npx expo start -c
```

*(If you are using Windows PowerShell and need to force debug mode, run: `$env:EXPO_DEBUG="true"; npx expo start -c`)*

Scan the generated QR code using the Expo Go application on your iOS or Android physical device, or press `a` or `i` to launch in a local emulator.