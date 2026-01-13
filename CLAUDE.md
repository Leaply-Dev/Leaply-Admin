# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leaply Admin is a Next.js 16 admin dashboard for managing universities, programs, scholarships, and users. It connects to a backend API at `NEXT_PUBLIC_API_URL` (defaults to http://localhost:8080/api).

## Commands

```bash
# Development
bun dev              # Start dev server on port 3001 (auto-generates API)

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
bun check:ci         # CI check (no auto-fix)
```

## Architecture

### Authentication Flow
- Auth state managed by Zustand store in `lib/store/authStore.ts` with localStorage persistence (`leaply-admin-auth` key)
- User roles: `"user"`, `"data_admin"`, `"super_admin"` (only admins can access)
- Tokens expire in 15 minutes with automatic proactive refresh at 2 minutes before expiry
- Session warning modal shown at 1 minute before expiry
- Protected routes enforced in `app/(admin)/layout.tsx` which redirects unauthenticated/non-admin users

### API Client (Orval + React Query)
- **Generated from OpenAPI**: `npm run generate:api` generates TypeScript client from `https://api.leaply.ai.vn/api/api-docs`
- **React Query hooks**: Auto-generated `useGetUniversities()`, `useCreateUniversity()`, etc.
- **Zod validation**: Runtime validation schemas in `lib/generated/api/zod/`
- **Custom mutator**: `lib/api/mutator.ts` handles auth token injection and refresh
- **Query client**: Created inline in `app/providers.tsx` with useState (Next.js pattern)

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

### Legacy API Client (`lib/api/client.ts`)
- Manual API client (can be removed after migration to Orval hooks)
- Generic typed methods: `apiClient.get<T>()`, `.post<T>()`, `.put<T>()`, `.delete<T>()`, `.patch<T>()`
- `ApiError` class with `getUserMessage()` for user-friendly error display

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
- List pages: `useState` for data/loading/search/page, `useEffect` for fetch, table with action dropdowns
- Edit/Create pages: `useParams()` for ID, form fields as `useState`, dropdown options from `getDropdownOptions()`
- All pages marked `"use client"` for client-side interactivity
- Region/Country dropdowns sync dependent options

### Path Alias
- `@/*` maps to project root (e.g., `@/components/ui/button`)

### Key Files
- `orval.config.ts`: Orval configuration for API generation
- `lib/api/mutator.ts`: Custom fetch wrapper for Orval with auth handling
- `app/providers.tsx`: React Query provider with QueryClient
- `lib/generated/api/endpoints/admin/admin.ts`: Generated admin API hooks
- `lib/api/adminApi.ts`: Legacy manual API functions (for gradual migration)
- `lib/types/admin.ts`: Legacy TypeScript types (use generated models instead)
- `app/(admin)/layout.tsx`: Auth protection wrapper for admin routes
- `components/AdminSidebar.tsx`: Main navigation
