🧙‍♂️ Mentor Merlin

A production-grade training slot booking system built with modern full-stack architecture, strong business validation rules, and secure authentication.

⸻

✨ Vision

Mentor Merlin is not just a calendar.
It is a structured training orchestration platform designed to:
	•	Enforce curriculum integrity (7 unique modules required)
	•	Prevent duplicate module booking
	•	Respect seat capacity
	•	Support draft → confirmed lifecycle
	•	Maintain real-time consistency between UI and database

The system balances:
	•	⚡ Performance (SSR for critical data)
	•	🔐 Security (Better Auth + middleware protection)
	•	🧠 Business logic enforcement (backend-first validation)
	•	🎨 Clean SaaS-grade UI

⸻

🏗️ Architecture Overview

Client (React + tRPC)
        ↓
Next.js App Router (Server Components + Middleware)
        ↓
tRPC Router Layer
        ↓
Service Layer (Business Rules)
        ↓
Prisma ORM
        ↓
Database

This layered structure ensures:
	•	Separation of concerns
	•	Scalable business logic
	•	Maintainable validation rules
	•	Clean mutation boundaries

⸻

🛠️ Tech Stack

Frontend
	•	Next.js (App Router)
	•	React 18
	•	TypeScript
	•	Tailwind CSS
	•	shadcn/ui
	•	date-fns
	•	Sonner (toast notifications)
	•	tRPC React client

Backend
	•	tRPC (typesafe API layer)
	•	Prisma ORM
	•	Transaction-based booking logic
	•	Structured execution logging

Authentication
	•	Better Auth
	•	Session-based auth
	•	Multi-session support
	•	JWT plugin
	•	Middleware-based route protection

Security
	•	CSP with nonce (middleware-generated)
	•	Strict route matching
	•	Server-side validation for all mutations
	•	Capacity conflict detection

⸻

📦 Core Features

1️⃣ Calendar System
	•	Server-side rendered month data
	•	Module mapping
	•	Remaining seat computation
	•	Gap day handling
	•	Module uniqueness enforcement
	•	7-hour completion tracking

Calendar UI enforces:
	•	Cannot select inactive days
	•	Cannot select full capacity days
	•	Cannot select duplicate modules
	•	Cannot exceed required hours
	•	Locks when booking is CONFIRMED

⸻

2️⃣ Booking Lifecycle

Status Types
	•	DRAFT
	•	CONFIRMED

Flow
	1.	User selects training days
	2.	Booking remains DRAFT until confirmed
	3.	Confirm mutation validates:
	•	Active training days
	•	Unique modules
	•	Capacity
	•	Required total hours
	4.	Booking becomes CONFIRMED
	5.	Calendar locks
	6.	Scheduled page displays grouped slots

If a slot is removed:
	•	Booking automatically reverts to DRAFT
	•	Calendar unlocks
	•	User can reselect missing modules

No hard redirects. No forced navigation.

⸻

3️⃣ Scheduled Classes Page
	•	Groups slots by month
	•	Displays module order + name
	•	Shows booking progress
	•	Supports optimistic slot removal
	•	Automatically syncs with calendar via invalidation

⸻

4️⃣ Optimistic UI

Implemented across:
	•	Slot removal
	•	Booking submission
	•	Calendar selection updates

Ensures smooth UX while preserving server authority.

⸻

5️⃣ Middleware Protection

Routes under /protected/*:
	•	Require valid session cookie
	•	Redirect unauthenticated users
	•	Inject CSP nonce

Middleware does NOT access database.
Session validation handled via Better Auth.

⸻

🧠 Business Rules (Critical Design)

These are enforced server-side inside transactions:
	•	Training day must exist and be active
	•	Total hours must meet requirement
	•	Modules must be unique
	•	Seat capacity must not be exceeded
	•	Booking must belong to user

This ensures the frontend can never bypass constraints.

⸻

🗂️ Project Structure

app/
  (auth)/
  protected/
  _components/
  layout.tsx
  page.tsx

server/
  api/
  services/
  logging/

prisma/
  schema.prisma

proxy.ts


⸻

🔐 CSP Implementation

Middleware generates a unique nonce per request.

Headers injected:

Content-Security-Policy:
default-src 'self';
script-src 'self' 'nonce-<dynamic>' 'strict-dynamic';
...

Nonce is forwarded via x-nonce header and consumed in RootLayout.

⸻

🚀 How to Run the Project

1️⃣ Install Dependencies

bun install


⸻

2️⃣ Configure Environment Variables

Required:

DATABASE_URL=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
NEXT_PUBLIC_BASE_URL=

Add social providers if needed.

⸻

3️⃣ Setup Database

npx prisma generate
npx prisma migrate dev

If using Better Auth JWT plugin:
Ensure jwks model exists in schema.

⸻

4️⃣ Seed Training Days

bun seeders/seed-training-days.ts


⸻

5️⃣ Run Development Server

bun run dev

Visit:

http://localhost:3000


⸻

🧪 Recommended Development Workflow
	1.	Modify business logic in service layer
	2.	Keep mutations transactional
	3.	Always validate server-side
	4.	Invalidate queries on mutation success
	5.	Use router.refresh() only when SSR involved

⸻

📈 Future Enhancements
	•	Payment integration
	•	Admin panel for module management
	•	Analytics dashboard
	•	Email reminders
	•	Audit trail viewer
	•	Multi-role access (mentor / student)

⸻

🎯 Design Philosophy

Mentor Merlin is built around:
	•	Deterministic booking behavior
	•	Predictable UI state
	•	Server-authoritative validation
	•	Clean separation of concerns

It is intentionally structured like a real SaaS product — not a demo app.

⸻

🧙‍♂️ Final Note

Mentor Merlin is designed to be extensible, secure, and production-ready.

Every part of the system — from nonce-based CSP to transactional booking validation — exists to enforce correctness over convenience.

This project demonstrates full-stack maturity across:
	•	Authentication
	•	Authorization
	•	UI state management
	•	Business validation
	•	Database integrity
	•	Security hardening

⸻

Built with clarity, discipline, and architectural intent.

🪄 Mentor Merlin