"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Building2 } from "lucide-react"
import type { PropertyMetrics } from "@/lib/reports"

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Property
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  Income
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  Expenses
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  Net Profit
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  Margin %
                </th>
              </tr>
            </thead>
            <tbody>
              {propertyMetrics.map((metric) => (
                <tr
                  key={metric.propertyId}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {metric.propertyName}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-green-600">
                    {formatCurrency(metric.income, currency)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-red-600">
                    {formatCurrency(metric.expenses, currency)}
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-bold ${
                      metric.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(metric.netProfit, currency)}
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-medium ${
                      metric.margin >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {metric.margin.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-semibold">
                <td className="py-4 px-4 text-gray-900">Total Portfolio</td>
                <td className="py-4 px-4 text-right text-green-600">
                  {formatCurrency(
                    propertyMetrics.reduce((sum, m) => sum + m.income, 0),
                    currency
                  )}
                </td>
                <td className="py-4 px-4 text-right text-red-600">
                  {formatCurrency(
                    propertyMetrics.reduce((sum, m) => sum + m.expenses, 0),
                    currency
                  )}
                </td>
                <td
                  className={`py-4 px-4 text-right ${
                    propertyMetrics.reduce((sum, m) => sum + m.netProfit, 0) >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    propertyMetrics.reduce((sum, m) => sum + m.netProfit, 0),
                    currency
                  )}
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
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
                </td>
              </tr>
            </tfoot>
          </table>
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
