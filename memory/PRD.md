# SKL Enterprises — Corporate Website & CRM

## Original Problem Statement
World-class premium corporate website for SKL ENTERPRISES (Technology-Driven Public Service Solutions), comparable to Infosys/TCS/L&T/Deloitte/EY. Founder & MD: E.L. Ashok Anand. Palette: Royal Blue / White / Gold. Pages: Home, About, Projects, APAAR, PAN 2.0, Join Our Network, Careers, Contact, plus secure Admin CRM. Resend email confirmations, JWT admin auth with brute-force protection.

## Architecture
- **Frontend**: React 19 + React Router 7, Tailwind, Shadcn UI, framer-motion. Fonts: Outfit (headings) + IBM Plex Sans (body). Official SKL logo + founder photo in /public.
- **Backend**: FastAPI + MongoDB (motor). JWT auth (bcrypt, 8h session, brute-force lockout via X-Forwarded-For+email, 5 attempts/15min). Emergent-managed Resend for emails. Emergent object storage for resume uploads.
- **Collections**: users, contacts, agents, careers, login_attempts.

## User Personas
Government stakeholders, business partners, investors, employees, field agents, students, citizens, corporate clients.

## Implemented (2026-06)
- 9 premium public pages: Home (hero/overview/services/featured projects/stats/leadership/why-us/CTA), About (mission/vision/values/founder/philosophy), Projects landing, APAAR + PAN 2.0 detail pages (overview/objectives/benefits/features/eligibility/documents/process/FAQ/become-an-agent), Join Our Network (agent form), Careers (openings + resume upload), Contact (Google map + info cards + click-to-call/whatsapp/email + form).
- Branded confirmation emails (Contact/Career/Agent templates) via Resend.
- Secure Admin CRM at /admin: stats, 3 lead tables (contacts/agents/careers), search/filter/sort, status workflow (New/Contacted/Pending/Approved/Rejected), internal notes, CSV export, resume viewer, protected routes.
- Official logo everywhere (nav/footer/favicon/admin) + founder photo on About & Home.
- Tested 100% backend (22/22 pytest) + all frontend flows.

## Admin Credentials
poojithaayyani1592@gmail.com / SklAdmin@2026 (see /app/memory/test_credentials.md)

## Backlog / Remaining (P1/P2)
- P2: Excel (.xlsx) export in addition to CSV.
- P2: Per-IP rate limiting on public POST endpoints (spam protection).
- P2: EmailStr validation on careers endpoint.
- P2: Loading splash screen with logo.
- P1: Replace editable placeholder statistics with real company figures when available.

## Notes
- Statistics on Home are editable placeholders (no invented achievements/certifications per instructions).
