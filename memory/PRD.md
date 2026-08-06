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

## Phase 1 Refinements (2026-06)
- Official APAAR & PAN 2.0 images used site-wide (Home featured, Projects, detail pages, banners).
- APAAR promotional video embedded (autoplay/muted/loop); PAN 2.0 elegant video placeholder (swap-in ready).
- Project-specific agent forms: Position dropdowns (APAAR: State/District/Field; PAN2: District/Pincode), cascading State→District selectors (locations.js), PAN2 state locked to Tamil Nadu.
- Form success confirmation screens (contact/career/agent).
- Admin Excel (.xlsx) + CSV export (openpyxl).
- SEO per-page titles/meta/OG/canonical (SEO.jsx), sitemap.xml, robots.txt.
- Enhanced project pages: professional hero banner, process timeline, benefit cards, image gallery, related downloads (placeholders), breadcrumbs.
- Site-wide: floating WhatsApp button, scroll-to-top, logo loading screen.
- Content centralized in /src/data/content.js & locations.js (Phase 2 will migrate to DB-backed CMS).

## Phase 2 Backlog (CMS — next iteration)
- DB-backed editable content (home/about/founder/services/FAQ/contact/footer/nav/hero/stats/announcements).
- Media Library (images/videos/PDFs, folders, replace/delete).
- Dynamic Projects CRUD, Careers job management, Downloads manager, Website Settings, SEO settings.
- Admin Users + roles (Super Admin/Admin/Content Manager/HR/Operations), password reset, user management.
- Activity Log (login/logout/submissions/status changes/content & media updates with date/time/user/IP).

## Phase 4 — Production Readiness + CMS extensions (2026-06)
- Header simplified: center nav = Home/About/Projects/Careers/Contact; right-side "Join Our Network" button retained (recruitment still via button, Careers, APAAR, PAN 2.0 pages).
- Editable social icons (LinkedIn/Facebook/Instagram/YouTube/X) via Website Settings → shown in Footer, mobile menu, Contact.
- Website Settings expanded: hero headline/subheadline/image, company description, footer note, social, founder, default SEO, + Maintenance Mode toggle & message. Startup migration $sets new keys onto existing settings doc.
- Editable Home hero (headline/subheadline/image) via SiteContext.
- Custom branded 404 page (catch-all route); Maintenance Mode gate on public routes (admin bypasses).
- Media Library: search + Copy-URL (reuse across pages) added to existing folder/upload/delete.
- Global admin search across pages/projects/careers/downloads/media (GET /api/admin/search).
- Footer Privacy Policy + Terms links → /privacy & /terms legal pages. sitemap.xml + robots.txt present.
- Tested: backend 49/50 pytest (the 1 was the settings-migration, now fixed) + frontend; GlobalSearch + settings migration bugs fixed and re-verified.

## Phase 4 explicitly DEFERRED (need larger refactor)
- Full visual page-builder to edit EVERY heading/paragraph/card/FAQ on Home/About/Projects/Careers/Contact (Settings currently covers hero, company, contact, founder, partnership, footer, SEO, social).
- Fully DB-rendered rich Project DETAIL templates (objectives/benefits/process/FAQs/downloads/video per project). CMS manages project cards + can add projects; the 2 flagship detail layouts remain in code.
- Draft/Publish, Version History, Backup/Restore (per instruction, not in this phase).
- Automatic WebP conversion (lazy-loading present).

## Phase 3 — Branding + CMS/RBAC (2026-06)
- Branding: reduced hero overlay (brighter images), larger circular logo + more header whitespace, sticky nav polish.
- Content fixes: PAN 2.0 coverage = South India (positions State/District/Pincode-Level); "Become an Agent" -> "Join Our Network" across nav & hero & project CTAs; EAS Strategic Partnership statement on About.
- CMS backend (RBAC, single-org): Website Settings, Projects CRUD, Careers openings CRUD, Downloads CRUD, Media Library (object storage, folders, soft-delete), Users+roles CRUD, Activity Log, Overview. Public endpoints: /api/public/{settings,projects,careers,downloads}. Namespaced leads routes /api/admin/leads/*.
- Roles: super_admin, admin, content_manager, hr, operations (perms enforced server-side via require(); UI gated too).
- Frontend wired to DB via SiteContext: Footer + Contact consume editable Settings; Careers page lists DB openings (static fallback). Admin dashboard rebuilt with 9 sections.
- Tested 40/40 backend pytest + frontend 100% (RBAC denials verified: operations/content_manager get correct 403s; primary admin delete blocked).

## Phase 3 deferred (future)
- Full DB-driven public Projects detail rendering (rich content still in code for the 2 flagship projects; CMS manages project cards + can add new ones).
- Editing every Home/About string via CMS (currently Settings covers company/contact/founder/partnership/SEO; other page copy remains in content.js).
- CMS Draft/Publish + Version History + automated Backup/Restore.
- WebP auto-conversion on media upload (lazy-loading is implemented).

## Original backlog (still open)
- EmailStr validation on careers endpoint (P2).
- Real statistics to replace placeholders (P1, awaiting data).
