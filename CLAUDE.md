# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gutschein Tracker** is a Next.js 15+ application for managing and tracking restaurant gift certificates (Gutscheine) across employees and locations. It features a data table UI for viewing coupon inventory, redeeming coupons, and tracking usage history.

## Development Commands

### Setup & Installation
```bash
npm install
# Prisma client auto-generates during install (postinstall hook)
```

### Development Server
```bash
npm run dev
# Starts Next.js dev server at http://localhost:3000
```

### Build & Production
```bash
npm run build
# Runs prisma generate and next build
npm start
# Starts production server
```

### Database
```bash
npm run prisma:seed
# Runs seed script from prisma/seed.ts
# For deployment: prisma migrate deploy
```

### Code Quality
```bash
npm run lint
# ESLint with Next.js config
```

### Deployment
- Vercel: Uses `vercel-build` script which runs `prisma generate`, `prisma migrate deploy`, and `next build`

## Architecture & Structure

### Core Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Shadcn/UI components built on Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack React Table for data management
- **Styling**: Tailwind CSS with class-variance-authority

### Directory Structure

```
src/
├── app/
│   ├── page.tsx              # Root page (redirects to gutscheinList)
│   ├── layout.tsx            # App layout wrapper
│   ├── api/
│   │   └── coupons/          # API endpoints for coupon operations
│   │       ├── route.ts      # GET (list) & POST (create) coupons
│   │       ├── [id]/redeem/  # Redeem coupon endpoint
│   │       ├── check-id/     # Verify coupon ID exists
│   │       └── old-coupon/   # Legacy system migration
│   └── gutscheinList/        # Main feature page
│       ├── page.tsx          # Server component, fetches from API
│       ├── data-table.tsx    # Table wrapper with toolbar
│       ├── columns.tsx       # Column definitions & cell renderers
│       ├── data-table-toolbar.tsx  # Filters & search
│       ├── add-coupon.tsx    # Dialog for creating new coupons
│       ├── redeem-coupon-form.tsx  # Dialog for redeeming
│       └── utils.ts          # Helper functions
├── components/
│   ├── ui/                   # Shadcn UI components (auto-generated)
│   └── icons.tsx             # Lucide icon exports
└── hooks/
    └── use-toast.ts          # Toast notification hook

lib/
├── db.ts                      # Prisma singleton instance
└── prismaFunctions.ts         # Commented legacy functions (replaced by API)

prisma/
├── schema.prisma             # Data models: Coupon, CouponHistory
└── migrations/               # Database migration files
```

### Data Models

**Coupon**: Main entity for gift certificates
- `id`: Unique identifier (CUID)
- `employee`: Who created/owns the coupon
- `description`: Label (e.g., "NEU! kl.Becher")
- `couponType`: Type of coupon ("value", "klein", etc.)
- `firstValue`, `usedValue`, `restValue`: Decimal tracking
- `used`: Boolean status
- `location`: Where it's stored/used
- `oldSystem`: Migration flag from legacy system
- `extraPayment`, `tip`: Additional monetary fields
- `couponHistory`: One-to-many relationship for audit trail

**CouponHistory**: Immutable record of all coupon state changes
- Tracks every modification with `modifiedAt` timestamp
- Cascades on coupon deletion
- Indexed by `couponId` and `modifiedAt` for efficient querying

### Data Flow

1. **Page Load** (`gutscheinList/page.tsx`):
   - Server component with `dynamic = "force-dynamic"`
   - Fetches coupons from `/api/coupons` (GET)
   - Passes to `DataTable` component

2. **API Endpoint** (`api/coupons/route.ts`):
   - **GET**: Returns all coupons ordered by `updatedAt desc`, with ISO date formatting
   - **POST**: Creates coupon with auto-calculated `restValue` (null for "klein" type)
   - Creates `CouponHistory` record automatically
   - Uses `revalidatePath` for cache invalidation

3. **Client Interactions**:
   - Add coupon: Dialog form → POST `/api/coupons`
   - Redeem: Dialog form → POST `/api/coupons/[id]/redeem`
   - Other endpoints: `/api/coupons/check-id`, `/api/coupons/old-coupon`

### Key Implementation Details

**TypeScript Paths**:
- `@/*` → `./src/*` (UI components, pages, hooks)
- `@lib/*` → `./lib/*` (database utilities)

**Prisma Setup**:
- Uses Prisma singleton pattern in `lib/db.ts` to prevent multiple client instances during development
- Auto-generates client via `postinstall` and build scripts
- Decimal.js for precise monetary calculations

**Dynamic Rendering**:
- Main page uses `export const dynamic = "force-dynamic"` to disable static rendering
- Cache headers set to `no-store` in API responses
- `revalidatePath` used for On-Demand ISR

**Form Validation**:
- Uses React Hook Form with Zod schema validation
- Form components wrap Radix UI primitives with Shadcn styling

**Table Features**:
- TanStack React Table for sorting, filtering, pagination
- Custom cell renderers in `columns.tsx` for status badges, decimal formatting
- Toolbar for search and advanced filters

## Environment Setup

Required environment variables (in `.env.local`):
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # For local API calls in page.tsx
```

## Important Notes

- **No Tests**: This project currently has no test suite. Tests should be added if expanding functionality.
- **Legacy Migration**: `oldSystem` flag and `/api/coupons/old-coupon` endpoint support migration from previous system.
- **Cache Control**: The main page manually disables Next.js caching because it needs always-fresh coupon data.
- **Prisma History Pattern**: Every coupon modification creates a history record—ensure this is maintained when adding features.
- **Decimal Precision**: Uses Decimal type for monetary values to avoid floating-point errors.
