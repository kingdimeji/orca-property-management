# Deployment Troubleshooting Guide

This document captures critical lessons learned during deployment, particularly around Prisma, Next.js 15, and Vercel builds.

## Table of Contents
- [Prisma Include Patterns](#prisma-include-patterns)
- [Type Inference Issues](#type-inference-issues)
- [Next.js 15 Changes](#nextjs-15-changes)
- [Prisma Configuration](#prisma-configuration)
- [Pre-Deployment Checklist](#pre-deployment-checklist)

---

## Prisma Include Patterns

### The Problem
Prisma's `include` behavior can be confusing, especially with nested relations.

### Key Rules

#### Rule 1: `include: true` vs Nested `include`
```typescript
// ❌ WRONG - Only includes property relation, NOT unit's scalar fields
unit: {
  include: {
    property: true,
  },
}

// ✅ CORRECT - Includes all unit fields AND property relation
unit: {
  include: {
    property: true,
  },
}
// Actually this is the same! The issue is more subtle...

// The real distinction:
// When you use nested include, Prisma SHOULD include both
// But type inference can fail across different environments
```

#### Rule 2: When Code Accesses Nested Properties
```typescript
// If your code does this:
payment.lease.unit.property.userId

// Your query MUST include:
include: {
  lease: {
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,  // REQUIRED
        },
      },
    },
  },
}

// NOT this:
include: {
  lease: {
    include: {
      tenant: true,
      unit: true,  // ❌ Doesn't include property relation
    },
  },
}
```

#### Rule 3: Check All Property Accesses
Before deploying, search codebase for patterns like:
```bash
grep -r "unit\.property" app/
grep -r "lease\.unit\.property" app/
```

If found, ensure queries include the property relation explicitly.

---

## Type Inference Issues

### The Problem
Prisma generates type definitions at build time. Different environments (local vs Vercel) can generate slightly different type instances, causing "Two different types with this name exist, but they are unrelated" errors.

### Solutions

#### Solution 1: Use `any` for Complex Nested Types
```typescript
// ❌ PROBLEMATIC - Strict types across environments
interface Props {
  payments: (Payment & {
    lease: {
      tenant: { firstName: string; lastName: string }
      unit: {
        name: string
        property: { name: string }
      }
    }
  })[]
}

// ✅ SAFER - Use any for nested relations
interface Props {
  payments: (Payment & {
    lease: {
      tenant: any
      unit: any
    }
  })[]
}
```

**Why this works:** The runtime types are still correct. TypeScript still catches errors in code that uses these types. We're just avoiding the cross-environment type identity issues.

#### Solution 2: Remove Explicit Type Annotations
```typescript
// ❌ Type annotation forces strict checking
const payments: PaymentWithDetails[] = await db.payment.findMany(...)

// ✅ Let TypeScript infer the type
const payments = await db.payment.findMany(...)
```

#### Solution 3: Use Type Assertions Sparingly
```typescript
// Only if absolutely necessary
const payments = await db.payment.findMany(...) as any
```

---

## Next.js 15 Changes

### Async Route Parameters

#### The Problem
Route parameters are now async in Next.js 15.

#### Before (Next.js 14)
```typescript
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const tenantId = params.id  // ✅ Direct access
}
```

#### After (Next.js 15)
```typescript
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // Now a Promise!
) {
  const { id } = await params  // ✅ Must await
  const tenantId = id
}
```

#### How to Find and Fix
```bash
# Search for old pattern
grep -r "params: { id:" app/api/

# Look for dynamic routes
find app/api -path "*/\[*\]/route.ts"
```

---

## Prisma Configuration

### Connection Pooling with Supabase

#### The Problem
Supabase uses connection pooling (port 6543) for general queries and direct connection (port 5432) for migrations.

#### Correct Configuration

**In `prisma/schema.prisma`:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

**In `.env`:**
```bash
DATABASE_URL="postgresql://user:pass@host:6543/db"  # Pooler
DIRECT_URL="postgresql://user:pass@host:5432/db"    # Direct
```

**NOT in `prisma.config.ts`:**
```typescript
// ❌ WRONG - directUrl not supported here
export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"]!,
    directUrl: process.env["DIRECT_URL"],  // NOT supported
  },
});

// ✅ CORRECT
export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
```

---

## Pre-Deployment Checklist

### 1. Prisma Queries Audit
```bash
# Check for unit.property accesses
grep -r "unit\.property" app/ --include="*.ts" --include="*.tsx"

# Check for lease.unit.property accesses
grep -r "lease\.unit\.property" app/ --include="*.ts" --include="*.tsx"

# For each match, verify the query includes property
```

### 2. Next.js 15 Route Params
```bash
# Find all dynamic API routes
find app/api -path "*/\[*\]/route.ts"

# Check each one uses async params:
# { params }: { params: Promise<{ id: string }> }
# const { id } = await params
```

### 3. Type Definitions
- Check for explicit type annotations on Prisma queries
- Consider using `any` for nested relations in props
- Remove unused type definitions

### 4. Environment Variables
Verify in Vercel dashboard:
- `DATABASE_URL` (pooled connection)
- `DIRECT_URL` (direct connection)
- `NEXTAUTH_URL` (production domain)
- `NEXTAUTH_SECRET` (secure random string)
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `NODE_ENV=production`

### 5. Database Schema
```bash
# Ensure schema is synced to production
npx prisma db push

# Or create and apply migration
npx prisma migrate dev --name descriptive_name
npx prisma migrate deploy
```

### 6. Build Test Locally
```bash
# Test production build locally
npm run build

# If successful, deploy
git push origin main
```

---

## Common Error Patterns

### Error: "Property 'property' does not exist on type..."
**Cause:** Query uses `unit: true` but code accesses `unit.property`
**Fix:** Change to `unit: { include: { property: true } }`

### Error: "Two different types with this name exist"
**Cause:** Prisma type mismatch between local and Vercel builds
**Fix:** Use `any` for nested types or remove type annotation

### Error: "params.id is undefined"
**Cause:** Next.js 15 requires async params
**Fix:** Change `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }` and await

### Error: "'directUrl' does not exist in type..."
**Cause:** `directUrl` in wrong config file
**Fix:** Move `directUrl` to `prisma/schema.prisma` datasource block

---

## Testing Strategy

### Local Testing
1. Clear `.next` folder: `rm -rf .next`
2. Regenerate Prisma client: `npx prisma generate`
3. Build: `npm run build`
4. Run: `npm run dev`

### Vercel Preview Testing
1. Push to feature branch
2. Check Vercel preview deployment
3. Test all critical paths
4. Merge to main only if preview succeeds

### Production Verification
1. Check Vercel deployment logs
2. Test authentication
3. Test data fetching (no N+1 queries)
4. Verify role-based access control
5. Test payment flows
6. Test tenant portal

---

## Lessons Learned

1. **Automated refactoring is dangerous** - Always check what code actually uses before mass-replacing patterns

2. **Type safety has limits** - Sometimes `any` is the pragmatic choice, especially for cross-environment compatibility

3. **Framework upgrades have breaking changes** - Always check migration guides (Next.js 14 → 15)

4. **ORM abstractions leak** - Understanding Prisma's include behavior deeply is essential

5. **Build locally before pushing** - Catch 80% of issues before CI/CD

6. **Document as you go** - Future you will thank present you

---

## Resources

- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [TypeScript Type Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
