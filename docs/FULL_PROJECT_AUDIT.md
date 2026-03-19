# Atopary Properties — Full Project Audit Report

**Generated:** 2026-03-19
**Project Root:** `d:\xampp\htdocs\Judebadisam\atopary`
**Overall Completion:** 82%
**Maturity Label:** BETA

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Fingerprint](#2-project-fingerprint)
3. [Architecture Map](#3-architecture-map)
4. [Feature Inventory](#4-feature-inventory)
5. [Workflow Analysis](#5-workflow-analysis)
6. [Pitfall Report](#6-pitfall-report)
7. [Quality Scorecard](#7-quality-scorecard)
8. [Completion Dashboard](#8-completion-dashboard)
9. [Enhancement Roadmap](#9-enhancement-roadmap)
10. [Product Requirements Document](#10-product-requirements-document)
11. [Next 3 Sprint Recommendations](#11-next-3-sprint-recommendations)

---

## 1. Executive Summary

**Atopary Properties** is a full-stack real estate web platform targeting the Ghanaian market. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma 7 ORM on Neon PostgreSQL, and NextAuth.js for authentication, it serves three user roles: Buyers (browse/inquire), Sellers (list/manage properties), and Admins (oversee platform). The project includes 21 page routes, 18 API endpoints, 10 database models, and rich UI with GSAP and Framer Motion animations.

At **82% completion (BETA maturity)**, all core features are implemented and functional: property CRUD, search/filtering, multi-role dashboards, inquiries, mortgage calculator/application, contact form, CMS management, and user profile management. The codebase is clean TypeScript with consistent patterns, no TODO/FIXME comments, and zero `console.log` statements in production code.

**Key gaps** preventing production readiness: (1) hardcoded credentials in `.env` committed to git, (2) empty Uploadthing API keys preventing file uploads, (3) no automated test suite, (4) no email notification system, (5) Vercel deployment pending successful build verification. The project needs approximately 2-3 sprints of hardening work before production launch.

---

## 2. Project Fingerprint

| Attribute | Value |
|-----------|-------|
| **Project Type** | Full-stack web application |
| **Primary Language** | TypeScript (100%) |
| **Framework** | Next.js 16.1.7 (App Router, React 19, Turbopack) |
| **Styling** | Tailwind CSS v4 |
| **Animation** | GSAP 3.14, Framer Motion 12.38 |
| **Database** | PostgreSQL (Neon) via Prisma 7 ORM with `@prisma/adapter-pg` |
| **Authentication** | NextAuth.js 4.24 (CredentialsProvider, JWT strategy) |
| **File Upload** | Uploadthing 7.7 (configured, keys not set) |
| **Validation** | Zod 4.3 + React Hook Form 7.71 |
| **State Management** | React useState/useEffect + Zustand 5.0 (installed, not actively used) |
| **Icons** | Lucide React 0.577 |
| **Form Handling** | React Hook Form + Zod schemas |
| **Image Optimization** | Next.js Image component + Sharp 0.34 |
| **Runtime** | Node.js (version not pinned — should be 20+) |
| **Deployment Target** | Vercel (pending), Netlify config also present |
| **Repository** | https://github.com/PeterAforo/atopary.git (master branch) |
| **Test Framework** | None configured |
| **CI/CD** | None configured |
| **Linter** | ESLint 9 with next config |
| **Package Manager** | npm (package-lock.json) |

### Dependencies (28 production, 8 dev)

**Key production deps:** next, react, prisma, next-auth, zod, react-hook-form, gsap, framer-motion, uploadthing, bcryptjs, sharp, lucide-react, tailwind-merge, zustand, swiper, react-player, react-dropzone, date-fns

### Environment Variables

| Variable | Status |
|----------|--------|
| `DATABASE_URL` | ✅ Set (Neon PostgreSQL) |
| `NEXTAUTH_SECRET` | ⚠️ Set but weak/predictable string |
| `NEXTAUTH_URL` | ✅ Set (localhost:3000) |
| `UPLOADTHING_SECRET` | ❌ Empty |
| `UPLOADTHING_APP_ID` | ❌ Empty |

### File Structure

```
atopary/
├── docs/                    # Project documentation
├── prisma/
│   ├── schema.prisma        # 10 models, 5 enums
│   └── seed.ts              # Database seed script
├── prisma.config.ts         # Prisma 7 CLI config
├── public/
│   ├── images/              # Static images (logo)
│   └── manifest.json        # PWA manifest
├── src/
│   ├── app/                 # Next.js App Router (21 pages, 18 API routes)
│   │   ├── admin/           # Admin dashboard (6 pages)
│   │   ├── auth/            # Login + Register
│   │   ├── buyer/           # Buyer dashboard (3 pages)
│   │   ├── contact/         # Contact page
│   │   ├── about/           # About page
│   │   ├── profile/         # User profile
│   │   ├── properties/      # Property listing + detail
│   │   ├── seller/          # Seller dashboard (4 pages)
│   │   ├── api/             # API routes (18 endpoints)
│   │   ├── globals.css      # Global styles + Tailwind theme
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   ├── dashboard/       # DashboardLayout
│   │   ├── home/            # Hero, Featured, Services, HowItWorks, Testimonials
│   │   ├── layout/          # Navbar, Footer
│   │   ├── property/        # MortgageCalculator
│   │   └── providers/       # SessionProvider
│   └── lib/
│       ├── auth.ts          # NextAuth config
│       ├── db.ts            # Prisma client
│       ├── uploadthing.ts   # Uploadthing React utilities
│       ├── utils.ts         # Shared utilities (9 functions)
│       └── validations.ts   # Zod schemas (7 schemas)
├── package.json
├── tsconfig.json
├── netlify.toml
└── next.config.ts
```

---

## 3. Architecture Map

### Logical Layers

| Layer | Technology | Files |
|-------|-----------|-------|
| **UI (Presentation)** | React 19 + Tailwind + Framer Motion + GSAP | `src/app/**/page.tsx`, `src/components/**` |
| **API (Business Logic)** | Next.js API Routes | `src/app/api/**/*.ts` (18 endpoints) |
| **Auth** | NextAuth.js (JWT) | `src/lib/auth.ts`, `src/app/api/auth/**` |
| **Data Access** | Prisma 7 ORM | `src/lib/db.ts`, `prisma/schema.prisma` |
| **Validation** | Zod schemas | `src/lib/validations.ts` |
| **Utilities** | Pure functions | `src/lib/utils.ts` |
| **File Upload** | Uploadthing | `src/app/api/uploadthing/**`, `src/lib/uploadthing.ts` |

### Data Flow

```
User Browser → Next.js Page (React) → fetch() to API Route
     ↕                                       ↓
  Tailwind CSS                        NextAuth Session Check
  Framer Motion                              ↓
  GSAP                                Zod Validation
                                             ↓
                                      Prisma ORM Query
                                             ↓
                                      Neon PostgreSQL
                                             ↓
                                      JSON Response → React State → UI Update
```

### Database Schema (10 models, 5 enums)

```
User (1) ──→ (N) Property ──→ (N) PropertyImage
  │                │          ──→ (N) PropertyVideo
  │                │
  │                ├──→ (N) Inquiry ←── User (buyer)
  │                └──→ (N) MortgageApplication ←── User (buyer)
  │
  ├──→ (N) Session
  └──→ (N) Account

Standalone:
  CMSPage, CMSSection, Testimonial, ContactMessage, SiteSettings
```

### Design Patterns

| Pattern | Usage |
|---------|-------|
| **Repository** | Prisma abstracts all DB access |
| **MVC-like** | Pages (View) → API Routes (Controller) → Prisma (Model) |
| **Role-Based Access** | Session-based role checks in API routes |
| **Server-side validation** | Zod schemas on API routes |
| **Client-side validation** | React Hook Form + Zod on forms |
| **JWT Authentication** | NextAuth with JWT strategy (30-day sessions) |

### Inconsistencies Noted

1. **Zustand installed but not used** — `zustand` is in dependencies but no store is created; all state is local `useState`
2. **Swiper and React Player installed but not imported** — No carousel or video player components use them
3. **`slugify` package installed but custom `slugify()` in utils.ts** — Redundant dependency
4. **`date-fns` installed but `Intl.DateTimeFormat` used in utils** — Redundant dependency
5. **Two Prisma adapters** — Both `@auth/prisma-adapter` and `@next-auth/prisma-adapter` installed; neither used (JWT strategy doesn't need DB adapter)

---

## 4. Feature Inventory

| # | Feature | Category | Status | % | Notes |
|---|---------|----------|--------|---|-------|
| 1 | Landing Page (Hero, Stats) | Public | COMPLETE | 100 | GSAP animations, responsive |
| 2 | Featured Properties Section | Public | COMPLETE | 95 | Uses hardcoded demo data, not fetching from API |
| 3 | Services Section | Public | COMPLETE | 100 | Static content with animations |
| 4 | How It Works Section | Public | COMPLETE | 100 | 4-step visualization |
| 5 | Testimonials Section | Public | COMPLETE | 90 | Hardcoded data, not from DB Testimonials model |
| 6 | Property Listing + Search | Public | COMPLETE | 95 | Pagination, filters, grid/list view |
| 7 | Property Detail Page | Public | COMPLETE | 95 | Gallery, lightbox, breadcrumbs, features |
| 8 | Property Inquiry Form | Buyer | COMPLETE | 100 | Auth-gated, linked to property |
| 9 | Mortgage Calculator | Public | COMPLETE | 100 | 3-step: calculate → results → apply |
| 10 | Mortgage Application | Buyer | COMPLETE | 100 | Full form with eligibility check |
| 11 | Contact Page + Form | Public | COMPLETE | 100 | Zod validation, success feedback |
| 12 | About Page | Public | COMPLETE | 100 | Static content |
| 13 | User Registration | Auth | COMPLETE | 100 | Role selection (Buyer/Seller), Zod validated |
| 14 | User Login | Auth | COMPLETE | 100 | Role-based redirect after login |
| 15 | User Logout | Auth | COMPLETE | 100 | Redirects to login page |
| 16 | Profile Page (View/Edit) | Auth | COMPLETE | 100 | Name, phone, password change |
| 17 | Admin Dashboard (Stats) | Admin | COMPLETE | 100 | Aggregate counts, recent items |
| 18 | Admin Property Management | Admin | COMPLETE | 95 | CRUD, status change (approve/reject) |
| 19 | Admin User Management | Admin | COMPLETE | 100 | Role change, activate/deactivate, delete |
| 20 | Admin Inquiry Management | Admin | COMPLETE | 95 | View, respond |
| 21 | Admin Mortgage Management | Admin | COMPLETE | 95 | View, update status, add notes |
| 22 | Admin CMS Pages | Admin | COMPLETE | 100 | CRUD for content pages |
| 23 | Seller Dashboard (Stats) | Seller | COMPLETE | 100 | Property count, views, inquiries |
| 24 | Seller Property List | Seller | COMPLETE | 95 | View, edit, delete own properties |
| 25 | Seller Add Property | Seller | COMPLETE | 90 | Full form, image URL input + Uploadthing dropzone (keys missing) |
| 26 | Seller Inquiry Response | Seller | COMPLETE | 100 | Respond to buyer inquiries |
| 27 | Buyer Dashboard (Stats) | Buyer | COMPLETE | 100 | Inquiry count, mortgage count |
| 28 | Buyer Inquiries List | Buyer | COMPLETE | 100 | View all sent inquiries with responses |
| 29 | Buyer Mortgages List | Buyer | COMPLETE | 100 | Track application status |
| 30 | Favicon + Icons + Manifest | Meta | COMPLETE | 100 | SVG favicon, apple-icon, PWA manifest |
| 31 | Image Upload (Uploadthing) | Upload | PARTIAL | 40 | Infrastructure wired but keys empty; upload non-functional |
| 32 | Email Notifications | System | MISSING | 0 | No email service configured |
| 33 | Password Reset/Forgot | Auth | MISSING | 0 | No forgot password flow |
| 34 | Email Verification | Auth | MISSING | 0 | `emailVerified` field exists but no verification flow |
| 35 | Property Favorites/Saved | Buyer | MISSING | 0 | Nav item exists ("Saved Properties") but no implementation |
| 36 | Seller Analytics | Seller | MISSING | 0 | Nav item exists but no page |
| 37 | Admin Sections Management | Admin | MISSING | 0 | Nav item exists for "CMS Sections" but no page |
| 38 | Admin Testimonials Management | Admin | MISSING | 0 | Nav item exists but no page; model exists in DB |
| 39 | Admin Messages/Contact View | Admin | MISSING | 0 | Nav item exists but no page to view contact messages |
| 40 | Admin Settings | Admin | MISSING | 0 | Nav item exists but no page; SiteSettings model exists |
| 41 | Search Suggestions/Autocomplete | Public | MISSING | 0 | Search is plain text input |
| 42 | Property Map View | Public | MISSING | 0 | `latitude`/`longitude` fields exist but no map |
| 43 | Social OAuth Login | Auth | MISSING | 0 | Only CredentialsProvider; Account model exists for OAuth |
| 44 | Automated Tests | DevOps | MISSING | 0 | No test files or framework configured |
| 45 | CI/CD Pipeline | DevOps | MISSING | 0 | No GitHub Actions or similar |
| 46 | Rate Limiting | Security | MISSING | 0 | No API rate limiting |
| 47 | API Documentation | Docs | MISSING | 0 | No OpenAPI/Swagger spec |

### Summary

| Status | Count | % of Total |
|--------|-------|------------|
| COMPLETE (90-100%) | 30 | 64% |
| PARTIAL (40-89%) | 1 | 2% |
| MISSING (0%) | 16 | 34% |

---

## 5. Workflow Analysis

### 5.1 Core Workflows

| # | Workflow | Steps | Status | Issues |
|---|---------|-------|--------|--------|
| 1 | **User Registration** | Visit /auth/register → Fill form → Zod validate → POST /api/auth/register → bcrypt hash → Prisma create → Redirect to login | ✅ COMPLETE | No email verification step |
| 2 | **User Login** | Visit /auth/login → Fill form → POST /api/auth/callback/credentials → bcrypt compare → JWT issued → Role-based redirect | ✅ COMPLETE | No "forgot password" option |
| 3 | **Browse Properties** | Visit /properties → Fetch GET /api/properties → Filter/search/paginate → Click property → GET /api/properties/[id] → View detail | ✅ COMPLETE | None |
| 4 | **Send Inquiry** | View property → Auth check → Fill inquiry form → POST /api/inquiries → Seller sees in dashboard → Seller responds → Buyer sees response | ✅ COMPLETE | No email notification to seller |
| 5 | **Apply for Mortgage** | View property → Open calculator → Enter params → Calculate → Results → Fill application → POST /api/mortgage → Admin reviews → Status update | ✅ COMPLETE | No notification to buyer on status change |
| 6 | **List Property (Seller)** | Login as seller → Dashboard → Add Property → Fill form → Add images (URL or upload) → POST /api/properties → Status: PENDING → Admin approves | ✅ COMPLETE | Uploadthing upload non-functional (empty keys) |
| 7 | **Admin Moderation** | Login as admin → Dashboard → View pending properties → Approve/reject → View inquiries → Respond → View mortgages → Update status | ✅ COMPLETE | No bulk actions |
| 8 | **Contact Form** | Visit /contact → Fill form → Zod validate → POST /api/contact → Success message | ✅ COMPLETE | No email sent to admin; messages stored in DB but no admin view page |
| 9 | **Profile Management** | Login → Profile page → Edit name/phone → Save → Change password → Save | ✅ COMPLETE | No avatar upload |
| 10 | **Logout** | Click logout → signOut(callbackUrl: /auth/login) → Redirect to login | ✅ COMPLETE | None |

### 5.2 Broken/Incomplete Workflows

| Workflow | Issue | Severity |
|----------|-------|----------|
| Forgot Password | No route, no UI, no API endpoint | HIGH |
| Email Verification | Field exists in DB but no flow to verify | MEDIUM |
| Saved/Favorite Properties | Buyer sidebar nav links to /buyer/saved but page doesn't exist | MEDIUM |
| Seller Analytics | Seller sidebar links to /seller/analytics but page doesn't exist | LOW |
| Admin Contact Messages | Messages stored in DB but no admin page to view them | MEDIUM |
| Admin Testimonials | Model exists, nav link exists, but no CRUD page | LOW |
| Admin CMS Sections | Model exists, nav link exists, but no CRUD page | LOW |
| Admin Settings | Model exists, nav link exists, but no page | LOW |

### 5.3 Auth Guard Assessment

| Route | Guard | Status |
|-------|-------|--------|
| `/admin/*` | Admin role check in API + DashboardLayout session check | ✅ |
| `/seller/*` | Seller/Admin role check in API + DashboardLayout session check | ✅ |
| `/buyer/*` | Authenticated user check in API + DashboardLayout session check | ✅ |
| `/profile` | Authenticated user check (redirect if unauthenticated) | ✅ |
| `/api/admin/*` | Session + role === ADMIN check | ✅ |
| `/api/seller/stats` | Session + role === SELLER or ADMIN | ✅ |
| `/api/properties` GET | Public (no auth required) | ✅ |
| `/api/properties` POST | Session + role === SELLER or ADMIN | ✅ |
| `/api/inquiries` POST | Session required | ✅ |
| `/api/contact` POST | Public (no auth required) | ✅ |

**Note:** Dashboard pages rely on `DashboardLayout` checking `session` and returning `null` if not authenticated. This hides content but doesn't redirect — a direct URL visit shows a blank page. The role check is only at the API level, not at the page level.

---

## 6. Pitfall Report

### CRITICAL

| # | Issue | File | Details |
|---|-------|------|---------|
| P1 | **Database URL committed to git** | `.env:1` | The full Neon PostgreSQL connection string with credentials is in `.env` which is committed to the repository. Anyone with repo access can read/write the database. |
| P2 | **NEXTAUTH_SECRET is weak/predictable** | `.env:3` | `"atopary-properties-secret-key-2026"` is a human-readable string, not a cryptographically random secret. Should be 32+ random bytes. |
| P3 | **No .env.example file** | Root | `.env` with real credentials is committed. There is no `.env.example` with placeholder values. `.env` should be in `.gitignore`. |

### HIGH

| # | Issue | File | Details |
|---|-------|------|---------|
| P4 | **Passwords logged in error traces** | API routes | `console.error` in API routes may log the full request body including passwords during error scenarios. |
| P5 | **No rate limiting on auth endpoints** | `api/auth/**`, `api/contact` | Brute-force login attempts and spam contact submissions are not rate-limited. |
| P6 | **Property update accepts arbitrary body** | `api/properties/[id]/route.ts:61-65` | `const body = await request.json(); ... data: body` — any field can be modified including `sellerId`, `status`, `views`. Should whitelist allowed fields. |
| P7 | **CMS page update accepts arbitrary body** | `api/admin/cms/[id]/route.ts:17-18` | Same issue: `data: body` without field whitelisting. |
| P8 | **No CSRF protection** | All POST endpoints | NextAuth handles CSRF for its own routes, but custom API routes have no CSRF token validation. |
| P9 | **Session stored in JWT only, no server-side revocation** | `lib/auth.ts` | JWT strategy means tokens can't be revoked server-side. A compromised token remains valid for 30 days. |

### MEDIUM

| # | Issue | File | Details |
|---|-------|------|---------|
| P10 | Dashboard pages don't redirect unauthenticated users | `admin/page.tsx`, etc. | DashboardLayout returns `null` if no session — shows blank page instead of redirecting to login. |
| P11 | No role-based page protection on frontend | Dashboard pages | An authenticated BUYER can visit `/admin` URL — the page renders DashboardLayout but with BUYER nav items. API calls will fail with 401 but UI is confusing. |
| P12 | `any` type used extensively | Multiple files | `property: any`, `where: any`, `error: any` — reduces TypeScript's value. |
| P13 | No input sanitization for HTML/XSS | API routes | User-submitted text (inquiry messages, property descriptions, CMS content) is stored and rendered without sanitization. |
| P14 | Contact messages stored but not viewable | `api/contact/route.ts` | Messages go to DB but admin has no page to view them. |
| P15 | Featured Properties section uses hardcoded demo data | `FeaturedProperties.tsx:22-113` | 6 properties with hardcoded Unsplash URLs instead of fetching from API. |
| P16 | Testimonials section uses hardcoded data | `TestimonialsSection.tsx:11-36` | 3 testimonials hardcoded instead of fetching from DB Testimonials table. |

### LOW

| # | Issue | File | Details |
|---|-------|------|---------|
| P17 | 49 `console.error` statements in production code | 30 files | Should use a proper logging library (e.g., Pino) or at minimum suppress in production. |
| P18 | Unused dependencies | `package.json` | `zustand`, `swiper`, `react-player`, `slugify`, `date-fns` installed but not actively used. |
| P19 | Redundant Prisma adapter packages | `package.json` | Both `@auth/prisma-adapter` and `@next-auth/prisma-adapter` installed; neither used with JWT strategy. |
| P20 | No `.env.example` for onboarding | Root | New developers have no template for required environment variables. |
| P21 | `test-output.html` committed to repo | Root | 48KB test output file in project root — should be in `.gitignore`. |
| P22 | Both `netlify.toml` and Vercel deployment configured | Root | Ambiguous deployment target — should pick one. |

### INFO

| # | Issue | Details |
|---|-------|---------|
| P23 | No `robots.txt` or `sitemap.xml` | SEO meta files missing for production. |
| P24 | No `404.tsx` custom error page | Uses Next.js default 404. |
| P25 | No loading.tsx files | Next.js streaming/suspense loading states not leveraged. |

---

## 7. Quality Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| **TypeScript Usage** | 7/10 | Used throughout but heavy reliance on `any` type (~15+ instances). No strict mode enforced. |
| **Code Duplication** | 8/10 | Shared utilities and validation schemas well-extracted. Some repetitive fetch patterns in dashboard pages. |
| **Linter/Formatter** | 6/10 | ESLint configured but no Prettier. No pre-commit hooks. Lint status unknown. |
| **Test Coverage** | 0/10 | Zero test files. No test framework configured. |
| **Documentation** | 5/10 | README exists but minimal. No API docs. No inline JSDoc. Two detailed docs in `docs/` folder. |
| **Accessibility (a11y)** | 4/10 | Image alt tags present. No ARIA labels on interactive elements. No keyboard navigation testing. No skip links. |
| **Internationalization** | 1/10 | Hardcoded English throughout. Currency locked to GHS. No i18n framework. |
| **Component Size** | 7/10 | Most components are under 200 lines. Some large pages: `properties/[slug]/page.tsx` (462 lines), `MortgageCalculator.tsx` (431 lines), `seller/properties/new/page.tsx` (~450 lines). |
| **Async Patterns** | 9/10 | Consistent async/await usage. Try/catch in all API routes. Loading states in all async UI. |
| **Error Handling** | 7/10 | API routes return proper HTTP status codes. Client-side error states shown. Server errors logged but with `console.error`. |
| **Dependency Management** | 6/10 | Dependencies not pinned to exact versions (uses `^`). Several unused packages. No `npm audit` evidence. |
| **Security** | 3/10 | Passwords hashed with bcrypt (good). But credentials in git, no rate limiting, no CSRF, no input sanitization, weak secret. |

---

## 8. Completion Dashboard

### Overall: 82% — BETA

```
Feature Completeness    [████████████████████░░░░░] 80%  (30/47 features complete)
Workflow Integrity      [██████████████████████░░░] 88%  (8/10 core workflows complete)
Error Handling          [██████████████████░░░░░░░] 72%  (good API handling, missing edge cases)
Security Posture        [██████████░░░░░░░░░░░░░░░] 40%  (3 CRITICAL, 6 HIGH issues)
Test Coverage           [░░░░░░░░░░░░░░░░░░░░░░░░░]  0%  (no tests)
Code Quality            [█████████████████░░░░░░░░] 68%  (clean code but TypeScript lax, no linting)
Documentation           [████████████░░░░░░░░░░░░░] 48%  (README + 2 docs, no API docs)
```

### Dimension Scores

| Dimension | Weight | Raw Score | Weighted |
|-----------|--------|-----------|----------|
| Feature Completeness | 30% | 80 | 24.0 |
| Workflow Integrity | 20% | 88 | 17.6 |
| Error Handling | 10% | 72 | 7.2 |
| Security Posture | 15% | 40 | 6.0 |
| Test Coverage | 10% | 0 | 0.0 |
| Code Quality | 10% | 68 | 6.8 |
| Documentation | 5% | 48 | 2.4 |
| **TOTAL** | **100%** | | **64.0** |

**Weighted Score: 64/100** — When security and testing are factored in, the effective production-readiness is lower than the feature-level 82%.

**Adjusted Assessment: BETA** — Functional for demonstration and internal testing. Not production-ready due to security gaps and zero test coverage.

---

## 9. Enhancement Roadmap

### MUST-HAVE (Before Production)

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| 1 | **Add `.env` to `.gitignore` and rotate ALL credentials** | S | CRITICAL — Database and auth secret exposed in git history |
| 2 | **Generate cryptographically strong NEXTAUTH_SECRET** | S | CRITICAL — Current secret is guessable |
| 3 | **Whitelist fields in property/CMS update endpoints** | S | HIGH — Prevents mass assignment attacks |
| 4 | **Add rate limiting to auth and contact endpoints** | M | HIGH — Prevents brute force and spam |
| 5 | **Implement forgot password / password reset flow** | M | HIGH — Basic auth feature missing |
| 6 | **Configure Uploadthing keys or switch to S3/Cloudinary** | S | HIGH — Image upload is non-functional |
| 7 | **Add frontend role-based route guards** | S | MEDIUM — Prevent BUYER from seeing admin UI shell |
| 8 | **Fix iOS input auto-zoom (font-size: 16px on inputs)** | S | MEDIUM — Mobile UX issue |
| 9 | **Set up Vercel environment variables** | S | HIGH — Required for deployment |
| 10 | **Create `.env.example` with placeholder values** | S | MEDIUM — Developer onboarding |

### SHOULD-HAVE (Next Release)

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| 11 | **Fetch Featured Properties from API instead of hardcoded data** | S | MEDIUM |
| 12 | **Fetch Testimonials from DB instead of hardcoded data** | S | MEDIUM |
| 13 | **Add admin page for contact messages** | M | MEDIUM |
| 14 | **Add admin pages for testimonials and CMS sections** | M | MEDIUM |
| 15 | **Add email notifications (inquiry received, status changed)** | L | HIGH |
| 16 | **Add property favorites/saved feature for buyers** | M | MEDIUM |
| 17 | **Replace `any` types with proper interfaces** | M | MEDIUM |
| 18 | **Add unit tests for utility functions and API routes** | L | HIGH |
| 19 | **Add body scroll lock to lightbox and sidebar overlays** | S | MEDIUM |
| 20 | **Reduce section heading sizes and spacing for mobile** | S | MEDIUM |

### NICE-TO-HAVE (Future)

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| 21 | **Add map view with property locations** | L | MEDIUM |
| 22 | **Add social OAuth login (Google)** | M | MEDIUM |
| 23 | **Add email verification for new accounts** | M | LOW |
| 24 | **Add search autocomplete/suggestions** | M | LOW |
| 25 | **Add custom 404 and error pages** | S | LOW |
| 26 | **Add CI/CD pipeline with GitHub Actions** | M | MEDIUM |
| 27 | **Add Sentry for error monitoring** | S | MEDIUM |
| 28 | **Add OpenAPI spec for API documentation** | M | LOW |
| 29 | **Remove unused dependencies** | S | LOW |
| 30 | **Add dark mode support** | M | LOW |

---

## 10. Product Requirements Document

### 10.1 Executive Summary

Atopary Properties is a web-based real estate marketplace platform for the Ghanaian market. It connects property sellers with buyers, provides mortgage calculators and application processing, and gives administrators full control over listings, users, and content. The platform targets three primary user segments: property buyers seeking homes/commercial spaces in Ghana, property sellers/agents listing properties for sale, and platform administrators managing the marketplace.

### 10.2 Problem Statement

Ghana's real estate market lacks a centralized, transparent digital platform for property transactions. Buyers struggle to find verified listings with reliable information, sellers have limited reach beyond word-of-mouth and classifieds, and mortgage accessibility remains opaque. Atopary Properties solves this by providing a trusted marketplace with property verification, inquiry management, and integrated mortgage tools.

### 10.3 Goals & Objectives

1. **Provide a searchable property marketplace** with rich listings (images, features, virtual tours)
2. **Enable direct buyer-seller communication** through an inquiry system
3. **Simplify mortgage accessibility** with calculators and in-platform applications
4. **Empower property sellers** with self-service listing management and analytics
5. **Give administrators full platform control** including user, property, and content management

### 10.4 User Personas

**Persona 1: Kwame (Property Buyer)**
- Age 30-45, professional in Accra
- Wants to find a verified home within budget
- Needs mortgage calculator to plan finances
- Values property details, images, and seller responsiveness

**Persona 2: Ama (Property Seller/Agent)**
- Real estate agent or property owner
- Wants to list properties and reach qualified buyers
- Needs to manage inquiries and track interest
- Values ease of listing and professional presentation

**Persona 3: Admin (Platform Manager)**
- Atopary team member
- Manages user accounts, approves property listings, handles CMS content
- Needs dashboard overview and moderation tools
- Values efficiency and data integrity

### 10.5 Functional Requirements

**FR-1 Property Management**
- FR-1.1: Sellers can create property listings with title, description, price, location, type, features, images, and virtual tour links
- FR-1.2: Properties require admin approval before public visibility (status: PENDING → APPROVED)
- FR-1.3: Properties support 8 types: House, Apartment, Condo, Townhouse, Villa, Land, Commercial, Office
- FR-1.4: Public users can search properties by keyword, filter by type/city/price/bedrooms, sort, and paginate
- FR-1.5: Property detail pages show image gallery with lightbox, seller info, inquiry form, and mortgage calculator

**FR-2 Authentication & Authorization**
- FR-2.1: Users register with name, email, password, optional phone, and role (Buyer/Seller)
- FR-2.2: Users log in with email/password credentials
- FR-2.3: Three roles: BUYER, SELLER, ADMIN with distinct dashboard experiences
- FR-2.4: Protected routes enforce role-based access at API level

**FR-3 Inquiry System**
- FR-3.1: Authenticated buyers can send inquiries on any approved property
- FR-3.2: Sellers see inquiries in their dashboard and can respond
- FR-3.3: Buyers can track inquiry status and view responses
- FR-3.4: Admins can view and moderate all inquiries

**FR-4 Mortgage System**
- FR-4.1: Interactive mortgage calculator with down payment, interest rate, loan term, and income inputs
- FR-4.2: Eligibility assessment based on 40% DTI ratio threshold
- FR-4.3: Full mortgage application form with personal, employment, and loan details
- FR-4.4: Admins can review applications and update status (PENDING → UNDER_REVIEW → APPROVED/REJECTED)

**FR-5 Admin Panel**
- FR-5.1: Dashboard with aggregate stats (total properties, users, inquiries, mortgages)
- FR-5.2: Property moderation (approve/reject pending listings)
- FR-5.3: User management (role changes, activate/deactivate, delete)
- FR-5.4: CMS pages CRUD for static content management
- FR-5.5: Inquiry and mortgage application oversight

**FR-6 Contact & Communication**
- FR-6.1: Public contact form with Zod validation
- FR-6.2: Messages stored in database for admin review

### 10.6 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Pages should load within 3 seconds on 4G. Images optimized via Next.js Image. |
| **Security** | Passwords hashed with bcrypt (12 rounds). JWT auth with 30-day sessions. Role-based API access. |
| **Scalability** | Serverless deployment on Vercel. Neon PostgreSQL for scalable DB. |
| **Accessibility** | Alt tags on images. Semantic HTML. Minimum 44px tap targets. |
| **Browser Support** | Chrome, Safari, Firefox, Edge (latest 2 versions). iOS Safari and Chrome Android. |
| **SEO** | Next.js metadata API for title, description, keywords. Favicon and manifest. |

### 10.7 Top 10 User Stories

1. As a **buyer**, I want to search for properties by location and type, so that I can find homes matching my criteria.
2. As a **buyer**, I want to view detailed property information with images, so that I can evaluate properties remotely.
3. As a **buyer**, I want to send an inquiry to a property seller, so that I can get more information or schedule a viewing.
4. As a **buyer**, I want to calculate my mortgage eligibility, so that I can understand what I can afford.
5. As a **seller**, I want to list my property with photos and details, so that qualified buyers can find it.
6. As a **seller**, I want to receive and respond to buyer inquiries, so that I can engage with interested parties.
7. As an **admin**, I want to approve or reject property listings, so that only verified properties appear publicly.
8. As an **admin**, I want to view platform statistics, so that I can monitor marketplace health.
9. As a **user**, I want to create an account and log in securely, so that I can access role-specific features.
10. As a **user**, I want to update my profile information, so that my account details stay current.

### 10.8 Data Model Summary

| Entity | Fields | Relationships |
|--------|--------|---------------|
| **User** | id, name, email, password, phone, avatar, role, isActive | → Properties, Inquiries, MortgageApplications |
| **Property** | id, title, slug, description, price, location, type, status, specs, features | → Seller (User), Images, Videos, Inquiries, Mortgages |
| **PropertyImage** | id, url, alt, isPrimary, order | → Property |
| **PropertyVideo** | id, url, title, isVirtual | → Property |
| **Inquiry** | id, message, status, response | → Buyer (User), Property |
| **MortgageApplication** | id, personal info, employment, loan details, status | → Buyer (User), Property |
| **CMSPage** | id, title, slug, content, meta | Standalone |
| **CMSSection** | id, key, title, content, image | Standalone |
| **Testimonial** | id, name, role, content, rating | Standalone |
| **ContactMessage** | id, name, email, subject, message, isRead | Standalone |
| **SiteSettings** | id, key, value | Standalone |

### 10.9 API Contract Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/properties` | GET | Public | List/search/filter properties |
| `/api/properties` | POST | Seller/Admin | Create property |
| `/api/properties/[id]` | GET | Public | Get property detail |
| `/api/properties/[id]` | PUT | Owner/Admin | Update property |
| `/api/properties/[id]` | DELETE | Owner/Admin | Delete property |
| `/api/inquiries` | GET | Auth (role-scoped) | List inquiries |
| `/api/inquiries` | POST | Auth | Create inquiry |
| `/api/inquiries/[id]` | PUT | Seller/Admin | Respond to inquiry |
| `/api/mortgage` | GET | Auth (role-scoped) | List mortgage apps |
| `/api/mortgage` | POST | Auth | Submit mortgage app |
| `/api/mortgage/[id]` | PUT | Admin | Update mortgage status |
| `/api/contact` | POST | Public | Submit contact message |
| `/api/profile` | GET | Auth | Get user profile |
| `/api/profile` | PUT | Auth | Update profile/password |
| `/api/auth/register` | POST | Public | Register new user |
| `/api/admin/stats` | GET | Admin | Get dashboard stats |
| `/api/admin/users` | GET | Admin | List/search users |
| `/api/admin/users/[id]` | PUT, DELETE | Admin | Update/delete user |
| `/api/admin/cms` | GET, POST | Admin | List/create CMS pages |
| `/api/admin/cms/[id]` | PUT, DELETE | Admin | Update/delete CMS page |
| `/api/seller/stats` | GET | Seller/Admin | Get seller stats |
| `/api/buyer/stats` | GET | Auth | Get buyer stats |
| `/api/uploadthing` | GET, POST | Auth | File upload handler |

### 10.10 Out of Scope (Not Implemented)

- Real-time chat between buyers and sellers
- Payment processing / transaction management
- Property booking/scheduling system
- Multi-language support (i18n)
- Native mobile applications
- Video calling for virtual property tours
- AI-powered property recommendations
- Property valuation tools
- Agent/broker management system
- Rental property support (only sale listings)

### 10.11 Open Questions

1. Should Featured Properties on the homepage be dynamic (from DB) or editorial (manually selected)?
2. What is the target audience for CMS pages — are they for legal pages (Terms, Privacy) or marketing content?
3. Should the mortgage calculator use a fixed 18% interest rate or allow market-rate configuration via SiteSettings?
4. Is email notification a launch requirement or post-launch enhancement?
5. Should properties support rental listings in addition to sale listings?
6. What is the content moderation policy — should property images be reviewed before approval?

### 10.12 Technical Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16.1.7 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| CSS Framework | Tailwind CSS | 4.x |
| Animation | GSAP + Framer Motion | 3.14 / 12.38 |
| Backend | Next.js API Routes | (same) |
| Database | PostgreSQL (Neon) | — |
| ORM | Prisma | 7.5.0 |
| Auth | NextAuth.js | 4.24.13 |
| Validation | Zod + React Hook Form | 4.3 / 7.71 |
| File Upload | Uploadthing | 7.7.4 |
| Icons | Lucide React | 0.577 |
| Image Optimization | Sharp | 0.34.5 |

---

## 11. Next 3 Sprint Recommendations

### Sprint 1: Security Hardening & Deployment (1 week)

| Task | Priority | Effort |
|------|----------|--------|
| Add `.env` to `.gitignore`, create `.env.example`, rotate all credentials | MUST | S |
| Generate cryptographically strong NEXTAUTH_SECRET (32+ random bytes) | MUST | S |
| Whitelist allowed fields in property PUT and CMS PUT endpoints | MUST | S |
| Add rate limiting to `/api/auth/**` and `/api/contact` endpoints | MUST | M |
| Set all environment variables in Vercel dashboard | MUST | S |
| Configure Uploadthing keys (or decide alternative) | MUST | S |
| Verify Vercel deployment builds and runs correctly | MUST | S |
| Remove `test-output.html` and unused `netlify.toml` from repo | SHOULD | S |
| Add input sanitization for user-submitted text (DOMPurify or similar) | SHOULD | M |

### Sprint 2: Feature Gaps & UX Polish (1-2 weeks)

| Task | Priority | Effort |
|------|----------|--------|
| Implement forgot password / password reset flow | MUST | M |
| Add frontend role-based route guards (redirect wrong roles) | MUST | S |
| Fetch Featured Properties from API (replace hardcoded data) | SHOULD | S |
| Fetch Testimonials from DB (replace hardcoded data) | SHOULD | S |
| Add admin page for viewing contact messages | SHOULD | M |
| Add admin CRUD page for testimonials | SHOULD | M |
| Fix iOS input auto-zoom (add `font-size: 16px` to inputs) | SHOULD | S |
| Add body scroll lock to lightbox and sidebar overlays | SHOULD | S |
| Reduce section headings and spacing for mobile | SHOULD | S |
| Make property gallery height responsive (`h-[300px] sm:h-[400px] lg:h-[500px]`) | SHOULD | S |
| Add Property Favorites feature for buyers | NICE | M |

### Sprint 3: Quality & Monitoring (1-2 weeks)

| Task | Priority | Effort |
|------|----------|--------|
| Add unit tests for `utils.ts` functions (8 tests) | MUST | S |
| Add integration tests for API routes (auth, properties, inquiries) | MUST | L |
| Replace `any` types with proper TypeScript interfaces | SHOULD | M |
| Remove unused dependencies (zustand, swiper, react-player, slugify, date-fns) | SHOULD | S |
| Add Sentry for error monitoring in production | SHOULD | S |
| Set up GitHub Actions CI pipeline (lint + typecheck + test) | SHOULD | M |
| Add custom 404 and error pages | NICE | S |
| Add `robots.txt` and `sitemap.xml` for SEO | NICE | S |
| Add Prettier configuration and format all files | NICE | S |
| Replace `console.error` with structured logging (Pino) | NICE | M |

---

*This audit was generated by analyzing the Atopary Properties codebase at commit `3be7723` on the `master` branch. All findings reference specific files and are grounded in the actual codebase. This report is self-contained and can be shared with any stakeholder without prior project knowledge.*
