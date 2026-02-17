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
}
