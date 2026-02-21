"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { formatPaymentType } from "@/lib/payment-utils"
import { DollarSign } from "lucide-react"
import type { Payment } from "@prisma/client"
import { ResponsiveTable } from "@/components/ui/responsive-table"
import { Badge } from "@/components/ui/badge"

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
        <ResponsiveTable
          headers={["Payment Type", "Count", "Amount", "% of Total", "Visual"]}
          rows={sortedTypes.map(([type, data]) => {
            const percentage = totalIncome > 0 ? (data.total / totalIncome) * 100 : 0

            return {
              key: type,
              cells: [
                // Payment Type
                <Badge key="type" variant={type.toLowerCase() as any}>
                  {formatPaymentType(type)}
                </Badge>,
                // Count
                <span key="count" className="text-gray-700">{data.count}</span>,
                // Amount
                <span key="amount" className="font-medium text-green-600">
                  {formatCurrency(data.total, currency)}
                </span>,
                // % of Total
                <span key="percentage" className="text-gray-900">{percentage.toFixed(1)}%</span>,
                // Visual
                <div key="visual" className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
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
            <span className="text-gray-700 text-center w-20">
              {sortedTypes.reduce((sum, [, data]) => sum + data.count, 0)}
            </span>
            <span className="text-green-600 text-right w-32">
              {formatCurrency(totalIncome, currency)}
            </span>
            <span className="text-gray-900 text-right w-24">100%</span>
            <span className="w-32"></span>
          </div>
          <div className="md:hidden space-y-2 px-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Count</span>
              <span className="text-gray-900">
                {sortedTypes.reduce((sum, [, data]) => sum + data.count, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-green-600">{formatCurrency(totalIncome, currency)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
