"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Tag } from "lucide-react"
import { ResponsiveTable } from "@/components/ui/responsive-table"
import { Badge } from "@/components/ui/badge"

interface ExpenseBreakdownTableProps {
  expensesByCategory: Record<string, number>
  totalExpenses: number
  currency: string
}

// Format category for display
function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export default function ExpenseBreakdownTable({
  expensesByCategory,
  totalExpenses,
  currency,
}: ExpenseBreakdownTableProps) {
  // Sort categories by amount descending
  const sortedCategories = useMemo(() => {
    return Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)
  }, [expensesByCategory])

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Expense Breakdown by Category</CardTitle>
          <Tag className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          headers={["Category", "Amount", "% of Total", "Visual"]}
          rows={sortedCategories.map(([category, amount]) => {
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0

            return {
              key: category,
              cells: [
                // Category
                <Badge key="category" variant="default" className="bg-purple-100 text-purple-700 border-purple-200">
                  {formatCategory(category)}
                </Badge>,
                // Amount
                <span key="amount" className="font-medium text-red-600">
                  {formatCurrency(amount, currency)}
                </span>,
                // % of Total
                <span key="percentage" className="text-gray-900">{percentage.toFixed(1)}%</span>,
                // Visual
                <div key="visual" className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              ]
            }
          })}
        />

        {/* Total Row */}
        <div className="mt-4 pt-4 border-t-2 border-gray-200 font-semibold">
          <div className="hidden md:flex justify-between px-4">
            <span className="text-gray-900 flex-1">Total</span>
            <span className="text-red-600 text-right w-32">
              {formatCurrency(totalExpenses, currency)}
            </span>
            <span className="text-gray-900 text-right w-24">100%</span>
            <span className="w-32"></span>
          </div>
          <div className="md:hidden space-y-2 px-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-red-600">{formatCurrency(totalExpenses, currency)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
