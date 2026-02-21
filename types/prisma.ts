import type { Prisma } from "@prisma/client"

// Complex Prisma types for nested queries

/**
 * Tenant with all leases and nested relations (unit -> property)
 * Used in: tenants/page.tsx, tenants/[id]/page.tsx
 */
export type TenantWithLeases = Prisma.TenantGetPayload<{
  include: {
    leases: {
      include: {
        unit: {
          include: {
            property: true
          }
        }
      }
    }
  }
}>

/**
 * Property with all units
 * Used in: properties/page.tsx, properties/[id]/page.tsx
 */
export type PropertyWithUnits = Prisma.PropertyGetPayload<{
  include: {
    units: true
  }
}>

/**
 * Unit with property relation
 * Used in: tenants/[id]/page.tsx (availableUnits)
 */
export type UnitWithProperty = Prisma.UnitGetPayload<{
  include: {
    property: true
  }
}>

/**
 * Payment with lease and nested relations
 * Used in: api/payments/[id]/route.ts
 */
export type PaymentWithLease = Prisma.PaymentGetPayload<{
  include: {
    lease: {
      include: {
        unit: {
          include: {
            property: true
          }
        }
        tenant: true
      }
    }
  }
}>

/**
 * Expense with property relation
 * Used in: api/expenses/route.ts, expenses/page.tsx
 */
export type ExpenseWithProperty = Prisma.ExpenseGetPayload<{
  include: {
    property: true
  }
}>

/**
 * Lease with payments ordered by due date
 * Used in: payment-related components
 */
export type LeaseWithPayments = Prisma.LeaseGetPayload<{
  include: {
    payments: {
      orderBy: {
        dueDate: "desc"
      }
    }
  }
}>

/**
 * Tenant with leases and payments
 * Used in: tenants/[id]/page.tsx (for payment tracking)
 */
export type TenantWithLeasesAndPayments = Prisma.TenantGetPayload<{
  include: {
    leases: {
      include: {
        unit: {
          include: {
            property: true
          }
        }
        payments: {
          orderBy: {
            dueDate: "desc"
          }
          take: 10
        }
      }
    }
  }
}>

// Non-Prisma UI types

/**
 * Navigation menu item
 * Used in: layout.tsx
 */
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Dashboard statistics card
 * Used in: dashboard/page.tsx
 */
export interface StatCard {
  name: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend: number // Percentage change (e.g., 5.2 for +5.2%)
}
