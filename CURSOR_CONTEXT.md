Got it ✅ — here’s a clean, opinionated CURSOR_CONTEXT.md tailored for your new Brand Deals MVP repo.
This will act as the “law of the land” inside Cursor, so any prompt you give will stay scoped, consistent, and won’t break the working app.

⸻

📌 CURSOR_CONTEXT.md

General Rules
	1.	Do not change anything unless explicitly asked.
	•	No refactors.
	•	No formatting-only changes.
	•	No renaming of variables, components, or files unless requested.
	2.	Always additive unless otherwise specified.
	•	New features = new files, new functions, or safe extensions to schema.
	•	Never remove existing logic unless the request is explicitly to remove.
	3.	UI Consistency
	•	Use our standard UI framework: Next.js + TailwindCSS + shadcn/ui.
	•	Cards must follow a clean, modern, responsive grid.
	•	Keep spacing balanced — no squashed UI, no excessive whitespace.
	•	Dashboard cards should always be in responsive grids (e.g., grid-cols-2 on desktop, stacked on mobile).
	4.	Styling
	•	Keep styles simple, clean, consistent.
	•	Remove unused or conflicting styles if discovered.
	•	Never introduce inline styles unless explicitly requested — always use Tailwind or shared UI components.
	5.	Functionality
	•	Never break existing flows:
	•	Auth
	•	Stripe subscriptions
	•	Workspace setup
	•	Dashboard
	•	Brand discovery (swipe UI)
	•	Media Pack generation
	•	CRM (Kanban board)
	•	Outreach (email sending)
	•	Additive only: new features must work alongside current ones.
	6.	Prisma & Database
	•	Use Prisma ORM with Neon (Postgres).
	•	Always extend schema carefully and run prisma migrate dev.
	•	Never remove fields unless explicitly instructed.
	•	Default to optional (?) if unsure for new fields.
	7.	Testing & CI
	•	Do not remove or break existing Playwright/Jest tests.
	•	When adding new features, add corresponding e2e tests.
	•	Always keep tests green before merging.
	8.	Mobile & Responsiveness
	•	UI must be responsive-first.
	•	Always test at breakpoints: 1440px (desktop), 768px (tablet), 375px (mobile).
	•	Avoid scrollbars unless absolutely required.
	9.	Media Pack Specifics
	•	Media packs must always have two options:
	•	Clean default template.
	•	Brand-themed (use logo/colors if present in DB).
	•	Exports: HTML preview + PDF.
	10.	Brand Color Logic

	•	If brand colors exist in DB → apply to headings and accent areas.
	•	If no colors found → fallback to neutral default styling.

⸻

Workflow Context

This MVP is focused ONLY on:
	•	User onboarding (auth + Stripe + social connect)
	•	AI content audit (insight cards)
	•	Brand discovery (swipe UI)
	•	Media pack generation (HTML/PDF)
	•	Outreach (AI email + SMTP send)
	•	CRM Kanban pipeline

Nothing else should be touched or introduced unless explicitly requested.

⸻

Update Clause

If I (the user) ask you to update this CURSOR_CONTEXT.md file itself:
	•	Add new rules in an additive way.
	•	Do not remove existing rules unless I specifically say “remove this rule.”
	•	Always confirm context alignment before applying large updates.

⸻

When implementing features, always cross-reference MVP_CHECKLIST.md. No PR or generation is complete unless all relevant items are satisfied.