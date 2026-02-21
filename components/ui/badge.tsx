import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        // Payment Status
        paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        overdue: "bg-red-50 text-red-700 border-red-200",
        partial: "bg-blue-50 text-blue-700 border-blue-200",
        cancelled: "bg-gray-50 text-gray-700 border-gray-200",

        // Unit Status
        vacant: "bg-orange-50 text-orange-700 border-orange-200",
        occupied: "bg-emerald-50 text-emerald-700 border-emerald-200",

        // Lease Status
        active: "bg-green-50 text-green-700 border-green-200",
        expired: "bg-red-50 text-red-700 border-red-200",

        // Maintenance Priority
        urgent: "bg-red-100 text-red-800 border-red-300",
        high: "bg-orange-100 text-orange-800 border-orange-300",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
        low: "bg-blue-100 text-blue-800 border-blue-300",

        // Payment Types (from lib/payment-utils.ts)
        rent: "bg-blue-100 text-blue-800 border-blue-300",
        electricity: "bg-yellow-100 text-yellow-800 border-yellow-300",
        water: "bg-cyan-100 text-cyan-800 border-cyan-300",
        gas: "bg-orange-100 text-orange-800 border-orange-300",
        internet: "bg-purple-100 text-purple-800 border-purple-300",
        maintenance_payment: "bg-red-100 text-red-800 border-red-300",
        security_deposit: "bg-green-100 text-green-800 border-green-300",
        late_fee: "bg-red-100 text-red-800 border-red-300",
        other: "bg-gray-100 text-gray-800 border-gray-300",

        // Generic variants
        default: "bg-gray-50 text-gray-700 border-gray-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
        error: "bg-red-50 text-red-700 border-red-200",
        info: "bg-blue-50 text-blue-700 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
