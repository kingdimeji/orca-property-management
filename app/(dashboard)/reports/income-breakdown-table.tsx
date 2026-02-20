"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { formatPaymentType, getPaymentTypeBadgeColor } from "@/lib/payment-utils"
import { DollarSign } from "lucide-react"
import type { Payment } from "@prisma/client"

interface IncomeBreakdownTableProps {
  payments: Payment[]
  currency: string
}

export default function IncomeBreakdownTable({
  payments,
  currency,
}: IncomeBreakdownTableProps) {
  // Calculate income by payment type
  const incomeByType = useMemo(() => {
    const breakdown: Record<string, { total: number; count: number }> = {}

    payments
      .filter((p) => p.status === "PAID")
      .forEach((payment) => {
        const type = payment.paymentType
        const total = payment.amount + payment.lateFee

        if (!breakdown[type]) {
          breakdown[type] = { total: 0, count: 0 }
        }

        breakdown[type].total += total
        breakdown[type].count += 1
      })

    return breakdown
  }, [payments])

  // Sort by total descending
  const sortedTypes = useMemo(() => {
    return Object.entries(incomeByType).sort(([, a], [, b]) => b.total - a.total)
  }, [incomeByType])

  const totalIncome = useMemo(() => {
    return sortedTypes.reduce((sum, [, data]) => sum + data.total, 0)
  }, [sortedTypes])

  if (sortedTypes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Income Breakdown by Type</CardTitle>
          <DollarSign className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Payment Type
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Count
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
              {sortedTypes.map(([type, data]) => {
                const percentage =
                  totalIncome > 0 ? (data.total / totalIncome) * 100 : 0

                return (
                  <tr
                    key={type}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadgeColor(type)}`}
                      >
                        {formatPaymentType(type)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700">
                      {data.count}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-green-600">
                      {formatCurrency(data.total, currency)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
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
                <td className="py-4 px-4 text-center text-gray-700">
                  {sortedTypes.reduce((sum, [, data]) => sum + data.count, 0)}
                </td>
                <td className="py-4 px-4 text-right text-green-600">
                  {formatCurrency(totalIncome, currency)}
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
