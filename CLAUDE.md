# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leaply Admin is a Next.js 16 admin dashboard for managing universities, programs, scholarships, and users. It connects to a backend API at `NEXT_PUBLIC_API_URL` (defaults to http://localhost:8080/api). Dev server runs on port 3001.

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8080/api)
- `NODE_ENV`: Environment mode (development/production)

## Commands

```bash
# Development
bun dev              # Start dev server on port 3001 (auto-generates API)
bun start            # Start production server on port 3001

# Build
bun run build        # Production build (auto-generates API)

# API Generation (Orval)
bun generate:api       # Generate API client from OpenAPI spec
bun generate:api:watch # Watch mode for API generation

# Linting & Formatting (Biome)
bun lint             # Lint and auto-fix
bun lint:check       # Lint without fixing
bun format           # Format and auto-fix
bun format:check     # Format check only
bun check            # Lint + format with auto-fix
bun check:ci         # CI check (lint + format + API generation, no auto-fix)
```

## Code Style (Biome)

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Import organization**: Auto-organized on save
- Generated files (`lib/generated/`) excluded from Biome checks

## Architecture

### Authentication Flow
- Auth state managed by Zustand store in `lib/store/authStore.ts` with localStorage persistence (`leaply-admin-auth` key)
- User roles: `"user"`, `"data_admin"`, `"super_admin"` (only admins can access)
- Tokens expire in 15 minutes with automatic proactive refresh at 2 minutes before expiry
- Session warning modal shown at 1 minute before expiry
- Protected routes enforced in `app/(admin)/layout.tsx` which redirects unauthenticated/non-admin users
- Auth state synced to cookies (`leaply-admin-auth-state`) for potential middleware use
- Token refresh includes race condition protection (prevents logout immediately after login)
- Token refresh uses subscriber pattern to queue parallel requests during refresh
- Mutator includes localStorage fallback for tokens when Zustand hasn't hydrated yet

### API Client (Orval + React Query)
- **Generated from OpenAPI**: `bun generate:api` generates TypeScript client from `https://api.leaply.ai.vn/api/api-docs`
- **React Query hooks**: Auto-generated `useGetUniversities()`, `useCreateUniversity()`, etc.
- **Zod validation**: Runtime validation schemas in `lib/generated/api/zod/`
- **Custom mutator**: `lib/api/mutator.ts` handles auth token injection, automatic 401 token refresh, and FormData support
- **Query client**: Created inline in `app/providers.tsx` with useState (Next.js pattern)
  - staleTime: 1 minute
  - gcTime: 5 minutes
  - refetchOnWindowFocus: false
  - retry: 1
- **Dev logging**: Mutator logs all requests with status emojis (🚀 = request, 🔒 = authenticated, ✅ = success, ⚠️ = 401, ❌ = error, 💥 = network error)

### Generated Files Structure
```
lib/generated/api/
├── endpoints/          # React Query hooks by OpenAPI tag
│   ├── admin/          # Admin CRUD operations
│   ├── authentication/ # Login, logout, refresh
│   └── ...
├── models/             # TypeScript interfaces
└── zod/                # Zod validation schemas
```

### Legacy API Client (`lib/api/client.ts` and `lib/api/adminApi.ts`)
- Manual API client functions in `adminApi.ts` (gradually being replaced by Orval hooks)
- Generic typed methods in `client.ts`: `apiClient.get<T>()`, `.post<T>()`, `.put<T>()`, `.delete<T>()`, `.patch<T>()`
- `ApiError` class with `getUserMessage()` for user-friendly error display
- **Migration strategy**: New code should use Orval-generated hooks; legacy code can remain until refactored

### State Management
- Zustand store for auth (`useAuthStore`)
- React Query for server state (caching, refetching, loading states)
- Component-level `useState` for form inputs

### UI Components (`components/ui/`)
- Based on shadcn/ui with Radix UI primitives
- Class Variance Authority (CVA) for component variants
- `cn()` helper from `lib/utils.ts` for Tailwind class merging
- Custom components:
  - `SearchableSelect`: Debounced search (300ms), recent items cache, min 2 chars to search
  - `ImageUpload`: Drag & drop, 2MB limit, validates JPG/PNG/WebP
  - `Pagination`: Smart page range with ellipsis, 0-indexed
  - `SessionTimeoutWarning`: Countdown timer with extend/logout

### Page Patterns
- **List pages**: `useState` for data/loading/search/page, `useEffect` for fetch, table with action dropdowns
  - Uses `PageResponse<T>` type for paginated responses (0-indexed)
  - Table with MoreHorizontal dropdown menu for row actions (Edit, Delete)
  - Search input with debounce pattern (controlled by component state)
  - Pagination component at bottom
- **Edit/Create pages**: `useParams()` for ID, form fields as `useState`, dropdown options from backend API
  - Loading skeletons during initial data fetch
  - Form submission with loading state on button
  - Success toast + redirect on completion
- **All pages marked `"use client"`** for client-side interactivity
- **Region/Country dropdowns**: Synced dependent options (selecting region filters countries)

### Route Structure
- `/login`: Public login page
- `/`: Root redirects to admin dashboard
- `/(admin)/`: Route group with auth protection (layout.tsx enforces admin access)
  - `/admin/dashboard`: Dashboard with stats
  - `/admin/universities`: University CRUD
  - `/admin/programs`: Program CRUD
  - `/admin/scholarships`: Scholarship CRUD
  - `/admin/users`: User management
  - `/admin/import`: CSV import tools
- Each admin entity follows pattern: `/admin/{entity}/page.tsx` (list), `/admin/{entity}/[id]/page.tsx` (edit), `/admin/{entity}/new/page.tsx` (create)

### Path Alias
- `@/*` maps to project root (e.g., `@/components/ui/button`)

### Key Files
- `orval.config.ts`: Orval configuration (dual config: React Query hooks + Zod schemas)
- `lib/api/mutator.ts`: Custom fetch wrapper for Orval with auth, token refresh, and error handling
- `app/providers.tsx`: React Query provider with QueryClient and devtools
- `lib/generated/api/` (gitignored): Generated API client, regenerated on every build/dev
  - `endpoints/`: React Query hooks by OpenAPI tag
  - `models/`: TypeScript interfaces
  - `zod/`: Zod validation schemas
- `lib/api/adminApi.ts`: Legacy manual API functions (being gradually replaced)
- `lib/types/admin.ts`: Legacy TypeScript types (prefer generated models from `lib/generated/api/models/`)
- `lib/store/authStore.ts`: Zustand auth store with localStorage persistence and cookie sync
- `app/(admin)/layout.tsx`: Auth protection wrapper for admin routes
- `components/AdminSidebar.tsx`: Main navigation sidebar
