"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Tag } from "lucide-react"

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Category
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  Amount
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  % of Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(([category, amount]) => {
                const percentage =
                  totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0

                return (
                  <tr
                    key={category}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {formatCategory(category)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-red-600">
                      {formatCurrency(amount, currency)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-semibold">
                <td className="py-4 px-4 text-gray-900">Total</td>
                <td className="py-4 px-4 text-right text-red-600">
                  {formatCurrency(totalExpenses, currency)}
                </td>
                <td className="py-4 px-4 text-right text-gray-900">100%</td>
                <td className="py-4 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
