# Jollo Properties — Project Workflow & Change Log

A living reference document. Update this file whenever a significant change, fix, or decision is made.

---

## Project Overview

**Jollo Properties** is a property management platform built for the Ugandan land registry context. It supports multi-role access (Admin, Land Officer, Public User), property ownership tracking, transactions, valuations, disputes, and document management.

| Item | Detail |
|---|---|
| Framework | Next.js 15.5.7 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 6.2.1 |
| Auth | NextAuth.js with Prisma adapter |
| File Storage | Cloudflare R2 + UploadThing |
| Email | Resend |
| Payments | Stripe |
| UI | Radix UI + Tailwind CSS |
| Package Manager | pnpm 9.12.0 |
| Maps | Leaflet / react-leaflet |
| Charts | Recharts |
| Rich Text | TipTap editor |

---

## User Roles

| Role | Description |
|---|---|
| `ADMIN` | Full system access, manages reference data, users, and all records |
| `LAND_OFFICER` | Reviews properties, transactions, valuations, disputes |
| `PUBLIC_USER` | Registers properties, views own records, submits disputes |

### Demo Credentials (Seed Data)
| Role | Email | Password |
|---|---|---|
| Admin | admin@demoproperties.ug | admin123 |
| Officer | officer1@demoproperties.ug | officer123 |
| User | james@example.com | user123 |

---

## Environment Variables

File: `.env` (never commit to git)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection |
| `DIRECT_URL` | Neon PostgreSQL direct connection (used by Prisma migrations) |
| `NEXTAUTH_URL` | Auth callback URL (e.g. http://localhost:3000) |
| `NEXTAUTH_SECRET` | Session encryption key |
| `NEXT_PUBLIC_BASE_URL` | Public base URL |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe public key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `RESEND_API_KEY` | Resend email API key |
| `CLOUDFLARE_R2_ENDPOINT` | R2 storage endpoint |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key |
| `CLOUDFLARE_R2_PUBLIC_URL` | Public CDN URL for R2 files |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 bucket name |
| `UPLOADTHING_APP_ID` | UploadThing app ID |
| `UPLOADTHING_SECRET` | UploadThing secret |
| `UPLOADTHING_TOKEN` | UploadThing token |

---

## Database

### Provider
Neon (serverless PostgreSQL) — free tier **auto-pauses** after ~5 minutes of inactivity.

**If you see `Can't reach database server at ...neon.tech:5432`:**
1. Go to https://console.neon.tech
2. Log in and open the project (`ep-floral-cloud-aniecba5`)
3. Resume the database if paused
4. Refresh the app — Prisma reconnects automatically

### Key Models

| Model | Purpose |
|---|---|
| `User` | Auth + profile, role-based |
| `Property` | Core property record (plot, tenure, type, geolocation, boundaries) |
| `PropertyOwner` | Multi-owner support with percentage shares |
| `Document` | File attachments stored in R2 |
| `Transaction` | Sales, leases, transfers, mortgages |
| `Valuation` | Tax assessments |
| `TaxPayment` | Payment receipts against valuations |
| `Dispute` | Property disputes with resolution tracking |
| `WorkflowStep` | Step-by-step approval process per property/transaction |
| `AuditLog` | Full audit trail (actor, action, before/after changes) |

### Reference Data Models
`PropertyCategory`, `TenureType`, `District`, `Region`, `MainRoad`, `County`, `Subcounty`, `Street`

### Enums

| Enum | Values |
|---|---|
| `UserRole` | ADMIN, LAND_OFFICER, PUBLIC_USER |
| `PropertyTenure` | MAILO, KIBANJA, TITLED, LEASEHOLD, FREEHOLD |
| `PropertyStatus` | DRAFT, PENDING_APPROVAL, ACTIVE, TRANSFERRED, DISPUTED, ARCHIVED |
| `PropertyType` | RESIDENTIAL, COMMERCIAL, AGRICULTURAL, INDUSTRIAL, LAND, HOUSE, OTHER, MIXED_USE |
| `TransactionType` | SALE, LEASE, TRANSFER, MORTGAGE |
| `TransactionStatus` | INITIATED, UNDER_REVIEW, APPROVED, COMPLETED, REJECTED, CANCELLED |
| `DisputeStatus` | FILED, UNDER_INVESTIGATION, HEARING, RESOLVED, DISMISSED |
| `WorkflowStatus` | PENDING, APPROVED, REJECTED, SKIPPED |
| `DocumentType` | TITLE_DEED, SURVEY_MAP, AGREEMENT, PHOTO, OTHER |

### Common Prisma Commands

```bash
# Generate Prisma client (run after schema changes or fresh clone)
npx prisma generate

# Push schema changes to database (dev only, no migration file)
npx prisma db push

# Create and apply a migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Run the seed file
npx prisma db seed
```

### Seed Files

| File | Purpose |
|---|---|
| `prisma/seed.ts` | Main seed — users, reference data, 10 sample properties, transactions, disputes, audit logs |
| `prisma/seed-properties.ts` | Extended property seeding |
| `prisma/seed-reference.ts` | Reference data only (regions, districts, etc.) |
| `prisma/seed-ref2.ts` | Additional reference data |
| `prisma/seed-ref3.ts` | Further reference data variants |

---

## Project Structure

```
jollo-properties/
├── app/
│   ├── (auth)/          # Login, register, forgot/reset password, unauthorized
│   ├── (public)/        # Home, about, contact, listings (public-facing)
│   ├── api/             # API routes (auth, admin CRUD, uploadthing, etc.)
│   └── dashboard/       # Protected dashboard (admin, officer, user views)
├── actions/             # Server actions (mutations)
├── components/          # Reusable UI components
├── config/              # App-level configuration
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── prisma/              # Schema, migrations, seed files
├── middleware.ts         # Route protection / auth middleware
└── .env                 # Environment variables (not in git)
```

### Dashboard Routes

| Route | Access | Purpose |
|---|---|---|
| `/dashboard` | All roles | Role-based redirect hub |
| `/dashboard/admin-home` | ADMIN | Admin overview |
| `/dashboard/officer-home` | LAND_OFFICER | Officer overview |
| `/dashboard/user-home` | PUBLIC_USER | User overview |
| `/dashboard/properties` | ADMIN, OFFICER | All properties |
| `/dashboard/my-properties` | PUBLIC_USER | Own properties |
| `/dashboard/transactions` | ADMIN, OFFICER | All transactions |
| `/dashboard/my-transactions` | PUBLIC_USER | Own transactions |
| `/dashboard/valuations` | ADMIN, OFFICER | Valuations |
| `/dashboard/disputes` | All roles | Disputes |
| `/dashboard/documents` | All roles | Documents |
| `/dashboard/owners` | ADMIN, OFFICER | Property owners |
| `/dashboard/users` | ADMIN | User management |
| `/dashboard/map` | All roles | Property map view |
| `/dashboard/reports` | ADMIN | Reports & analytics |
| `/dashboard/admin/settings/*` | ADMIN | Reference data management |

---

## Change Log

### 2026-04-30
- **Fix**: Ran `npx prisma generate` to resolve `@prisma/client did not initialize yet` error on home page (client was not generated after initial clone/install).
- **Fix**: Diagnosed `Can't reach database server at ...neon.tech:5432` error on `/dashboard/categories` — caused by Neon free-tier database auto-pausing. Resolution: resume database from Neon console.
- **Fix**: Same Neon auto-pause error appeared on `/dashboard/regions` and `/dashboard/districts` — same resolution each time: resume from Neon console.
- **Note**: Neon free tier pauses after ~5 min of inactivity. Consider upgrading Neon or using a local PostgreSQL for dev to avoid repeated interruptions.
- **Attempted**: Set up local PostgreSQL 17 to replace Neon for dev. Installed via winget (EDB installer). `prisma db push` ran successfully and created all 21 tables in local `jollo` DB. However, PostgreSQL service was not properly registered — TCP port 5432 never opened, service not found in Windows Service Manager. Root cause: incomplete installation (missing `pg_ctl.exe`, `initdb.exe` from bin; service not registered). Local DB setup was abandoned for now — `.env` reverted back to Neon.
- **TODO**: To finish local PostgreSQL setup — uninstall PostgreSQL 17 from Control Panel, reinstall with all components checked (especially "PostgreSQL Server"), then run `prisma db push` + `prisma db seed` and swap `.env` to `postgresql://postgres:postgres@localhost:5432/jollo?schema=public`.
- **Docs**: Created `WORKFLOW.md` to track project progress and decisions. Set to auto-update with every change.
- **Feature**: Built chatbot for user inquiries — responds using live data from the app's own database (no external AI API). Files created:
  - `app/api/chat/route.ts` — POST endpoint; keyword/intent matching against user message, queries Prisma for real property/transaction/dispute counts and listings, returns JSON reply
  - `components/chat/ChatWidget.tsx` — floating chat bubble (bottom-right, fixed), chat panel with message history, loading indicator
  - Added `ChatWidget` to `app/(public)/layout.tsx` so it appears on all public pages
  - Handles intents: property search by district/type/tenure, stats overview, tenure type explanations, registration guidance, disputes, transactions, valuations, documents, Land Officer contact

---

## Known Issues & Notes

- **Neon auto-pause**: The free-tier Neon database pauses after ~5 min of inactivity. Always check the Neon console first when seeing connection errors in dev.
- **Prisma generate**: Must be run after a fresh clone or after any changes to `prisma/schema.prisma`.
- **Next.js version**: Running 15.5.7 — an update is available. Do not update without testing all routes.
- **Stripe keys**: Currently placeholder values in `.env`. Replace with real keys before testing payment flows.
- **Anthropic API key**: `ANTHROPIC_API_KEY` in `.env` is blank. Get a key from https://console.anthropic.com and fill it in before testing the chatbot.

---

## How to Run Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database (first time setup)
npx prisma db push

# 4. Seed reference and demo data
npx prisma db seed

# 5. Start dev server
pnpm dev
```

---

- **Fix**: ChatWidget — added explicit close buttons in panel header (chevron to minimise, X to end/reset conversation). Floating bubble now only shows when panel is closed.
- **Feature**: ChatWidget dark mode — added `dark:` Tailwind classes throughout (panel, messages, input, borders).
- **Fix**: Sidebar collapsed state now persisted in `localStorage` so it survives page navigation within the dashboard.
- **Feature**: Dark mode fully wired up — added `ThemeProvider` (next-themes) to `components/Providers.tsx` with `attribute="class"` and `defaultTheme="system"`. Added `ModeToggle` (Light / Dark / System dropdown) to public `Navbar` (desktop + mobile) and dashboard `Topbar`. Dark mode CSS variables were already defined in `globals.css`.

### 2026-05-01
- **Fix/Feature**: `AdminPropertiesTable` — removed Featured, Public, and Owners columns from the property listings table. Replaced icon-only action buttons with labeled "View Details" and "Delete" buttons in the Actions column. Cleaned up unused imports (`Badge`, `Star`, `Globe`) and unused `handleToggle` function.

- **Feature**: Hero search redesign — replaced the 3-filter single-row search with a 2-row card: (1) a full-width keyword input (searches title, plot number, address, subcounty) + Search button; (2) a 5-column filter row — District, Property Type, Tenure, Min Price, Max Price. Updated `handleSearch` to pass all params including `q` and `minPrice`/`maxPrice` to `/listings`. Updated `app/(public)/listings/page.tsx` to handle `q` keyword param (Prisma `OR` across title/plotNumber/district/address/subcounty) and include `q` in `hasFilters` for map filtering.

- **Feature**: Full public UI redesign — StatsBar, WhySection, PropertyCard, PropertyCardSlider, FeaturedListingsClient, CTASection, ContactSection redesigned for premium Dribbble-quality appearance using brand colours.

- **Feature**: Image seeding — created `prisma/seed-images.ts` script that downloads 3 hand-picked Unsplash photos per property (by type: RESIDENTIAL, HOUSE, COMMERCIAL, AGRICULTURAL, INDUSTRIAL, MIXED_USE, LAND), uploads them to Cloudflare R2, and creates `Document` records with `type=PHOTO`. Added `seed:images` npm script. Run with: `pnpm seed:images`. Script is idempotent — skips properties that already have 3 or more photos.

- **Fix**: "Browse by Category" section showing 0 properties — root cause: Prisma `Decimal` type for `price`/`size` fields fails React Server Component serialization when passed directly to client components. Fixed in `FeaturedListings.tsx` and `HomeMapSection.tsx` by calling `Number(p.price)` / `Number(p.size)` before passing to client. Also: `HomeMapSection.tsx` had an unreachable `.map()` line (the conversion was after a `return` statement — never executed). Also added `export const dynamic = "force-dynamic"` to `app/(public)/page.tsx` to prevent Next.js from caching a stale empty render. Added `console.error` to both catch blocks so errors surface in logs.

- **Fix**: Property card images not showing (letter placeholders instead) — `FeaturedListings.tsx` documents `select` was missing `type: true`. `PropertyCardSlider` filters by `d.type === "PHOTO"` but `type` was `undefined` (not fetched), so every property appeared photo-less. Added `type: true` to the select.

### 2026-05-02
- **Feature**: Full property sales & payment installment system:
  - **Schema**: Added `agreedPrice`, `discountLabel`, `discountAmount` fields to `Transaction` model. Added new `PaymentInstallment` model (`id`, `transactionId`, `amount`, `receiptNumber`, `paidAt`, `method`, `notes`). Ran `npx prisma db push` to sync DB.
  - **API** `app/api/transactions/[id]/payments/route.ts` — GET lists installments; POST records a new payment, hides property from public listing on first payment, auto-completes transaction + sets property status to TRANSFERRED + transfers ownership to buyer when total paid >= amount.
  - **API** `app/api/transactions/route.ts` — POST now accepts `agreedPrice`, `discountLabel`, `discountAmount`; computes `amount = agreedPrice - discountAmount`; returns `installments: []` in response.
  - **API** `app/api/admin/properties/route.ts` — GET now accepts `search` param (alias for `q`) and `limit` param; returns `{ data: [...] }` paginated format when `limit` is set; serializes `price`/`size` as numbers.
  - **Component** `components/shared/TransactionDialog.tsx` — rewritten with property price auto-fill, agreed price field, optional discount section, net amount display.
  - **Component** `components/shared/PaymentInstallmentDialog.tsx` — new dialog to record installment payments with summary (total price, paid, remaining, progress bar), method select, date, notes.
  - **Component** `components/dashboard/TransactionsTable.tsx` — rewritten with `PaymentProgress` mini-bar in Amount column, "Pay" button on active SALE transactions, wired to `PaymentInstallmentDialog`.
  - **Page** `app/dashboard/transactions/page.tsx` — now includes `installments` in DB query with Decimal serialization.
  - **Component** `components/dashboard/AdminUsersTable.tsx` — added "Delete Permanently" button and confirmation dialog (calls `DELETE /api/admin/users/{id}`).
  - **Component** `components/dashboard/SalesCharts.tsx` — new client component with Recharts `BarChart` (monthly completed sales last 6 months) + `PieChart` (Active/Partial/Completed breakdown).
  - **Page** `app/dashboard/admin-home/page.tsx` — added 4 sales stats cards (Completed, Active, Partial, Total Value) + `SalesCharts` component with live DB data.

*Last updated: 2026-05-02*
