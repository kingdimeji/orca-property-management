"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Building2 } from "lucide-react"
import type { PropertyMetrics } from "@/lib/reports"
import { ResponsiveTable } from "@/components/ui/responsive-table"

interface PropertyMetricsTableProps {
  propertyMetrics: PropertyMetrics[]
  currency: string
}

export default function PropertyMetricsTable({
  propertyMetrics,
  currency,
}: PropertyMetricsTableProps) {
  if (propertyMetrics.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Property Performance</CardTitle>
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          headers={["Property", "Income", "Expenses", "Net Profit", "Margin %"]}
          rows={propertyMetrics.map((metric) => ({
            key: metric.propertyId,
            cells: [
              // Property
              <div key="property" className="font-medium text-gray-900">
                {metric.propertyName}
              </div>,
              // Income
              <span key="income" className="font-medium text-green-600">
                {formatCurrency(metric.income, currency)}
              </span>,
              // Expenses
              <span key="expenses" className="font-medium text-red-600">
                {formatCurrency(metric.expenses, currency)}
              </span>,
              // Net Profit
              <span
                key="profit"
                className={`font-bold ${
                  metric.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatCurrency(metric.netProfit, currency)}
              </span>,
              // Margin %
              <span
                key="margin"
                className={`font-medium ${
                  metric.margin >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {metric.margin.toFixed(1)}%
              </span>
            ]
          }))}
        />

        {/* Total Row */}
        <div className="mt-4 pt-4 border-t-2 border-gray-200 font-semibold">
          <div className="hidden md:flex justify-between px-4">
            <span className="text-gray-900 flex-1">Total Portfolio</span>
            <span className="text-green-600 text-right w-32">
              {formatCurrency(
                propertyMetrics.reduce((sum, m) => sum + m.income, 0),
                currency
              )}
            </span>
            <span className="text-red-600 text-right w-32">
              {formatCurrency(
                propertyMetrics.reduce((sum, m) => sum + m.expenses, 0),
                currency
              )}
            </span>
            <span
              className={`text-right w-32 ${
                propertyMetrics.reduce((sum, m) => sum + m.netProfit, 0) >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(
                propertyMetrics.reduce((sum, m) => sum + m.netProfit, 0),
                currency
              )}
            </span>
            <span className="text-gray-900 text-right w-24">
              {(() => {
                const totalIncome = propertyMetrics.reduce(
                  (sum, m) => sum + m.income,
                  0
                )
                const totalProfit = propertyMetrics.reduce(
                  (sum, m) => sum + m.netProfit,
                  0
                )
                const avgMargin =
                  totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0
                return `${avgMargin.toFixed(1)}%`
              })()}
            </span>
          </div>
          <div className="md:hidden space-y-2 px-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income</span>
              <span className="text-green-600">
                {formatCurrency(
                  propertyMetrics.reduce((sum, m) => sum + m.income, 0),
                  currency
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses</span>
              <span className="text-red-600">
                {formatCurrency(
                  propertyMetrics.reduce((sum, m) => sum + m.expenses, 0),
                  currency
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Profit</span>
              <span
                className={
                  propertyMetrics.reduce((sum, m) => sum + m.netProfit, 0) >= 0
                    ? "text-blue-600"
                    : "text-red-600"
                }
              >
                {formatCurrency(
                  propertyMetrics.reduce((sum, m) => sum + m.netProfit, 0),
                  currency
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Properties are sorted by net profit (highest
            to lowest). Use property filter above to view detailed breakdown for a
            specific property.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
