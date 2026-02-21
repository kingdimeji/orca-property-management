import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendIndicatorProps {
  value: number // Percentage change (e.g., 5.2 for +5.2%, -2.3 for -2.3%)
  label?: string // Optional label (e.g., "from last month")
  className?: string
}

export function TrendIndicator({ value, label, className }: TrendIndicatorProps) {
  const isPositive = value > 0
  const isNeutral = value === 0

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", className)}>
      <Icon className={cn(
        "w-3 h-3",
        isNeutral && "text-gray-500",
        isPositive && "text-emerald-600",
        !isPositive && !isNeutral && "text-red-600"
      )} />
      <span className={cn(
        isNeutral && "text-gray-600",
        isPositive && "text-emerald-600",
        !isPositive && !isNeutral && "text-red-600"
      )}>
        {isPositive && "+"}
        {value.toFixed(1)}%
      </span>
      {label && (
        <span className="text-gray-500">{label}</span>
      )}
    </div>
  )
}
