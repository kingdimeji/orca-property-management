"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Payment, Expense, Property } from "@prisma/client"
import {
  calculateIncome,
  calculateExpenses,
  calculateProfitLoss,
  calculatePropertyMetrics,
  getDateRange,
  getTimeRangeLabel,
  type TimeRange,
} from "@/lib/reports"
import TimeRangeSelector from "./time-range-selector"
import PropertySelector from "./property-selector"
import IncomeBreakdownTable from "./income-breakdown-table"
import ExpenseBreakdownTable from "./expense-breakdown-table"
import PropertyMetricsTable from "./property-metrics-table"
import ExportMenu from "./export-menu"

interface ReportsDashboardProps {
  payments: (Payment & {
    lease: {
      tenant: any
      unit: any
    }
  })[]
  expenses: (Expense & { property: Property | null })[]
  properties: Property[]
  currency: string
}

export default function ReportsDashboard({
  payments,
  expenses,
  properties,
  currency,
}: ReportsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("month")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all")

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRange(timeRange, new Date(), customStartDate, customEndDate)
  }, [timeRange, customStartDate, customEndDate])

  // Filter data by property if selected
  const filteredPayments = useMemo(() => {
    if (selectedPropertyId === "all") return payments
    return payments.filter(
      (p) => p.lease.unit.property.id === selectedPropertyId
    )
  }, [payments, selectedPropertyId])

  const filteredExpenses = useMemo(() => {
    if (selectedPropertyId === "all") return expenses
    // For property filter, only include expenses for that property
    // (exclude general expenses when filtering by property)
    return expenses.filter((e) => e.property?.id === selectedPropertyId)
  }, [expenses, selectedPropertyId])

  // Calculate metrics
  const incomeMetrics = useMemo(() => {
    return calculateIncome(
      filteredPayments,
      dateRange.startDate,
      dateRange.endDate
    )
  }, [filteredPayments, dateRange])

  const expenseMetrics = useMemo(() => {
    return calculateExpenses(
      filteredExpenses,
      dateRange.startDate,
      dateRange.endDate
    )
  }, [filteredExpenses, dateRange])

  const profitLossMetrics = useMemo(() => {
    return calculateProfitLoss(
      incomeMetrics.paidIncome, // Only count paid income for P&L
      expenseMetrics.totalExpenses
    )
  }, [incomeMetrics, expenseMetrics])

  const propertyMetrics = useMemo(() => {
    // Only calculate property metrics when viewing "all properties"
    if (selectedPropertyId !== "all") return []
    return calculatePropertyMetrics(
      payments as any,
      expenses as any,
      dateRange.startDate,
      dateRange.endDate
    )
  }, [payments, expenses, dateRange, selectedPropertyId])

  const timeRangeLabel = getTimeRangeLabel(
    timeRange,
    customStartDate,
    customEndDate
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <ExportMenu
              payments={filteredPayments}
              expenses={filteredExpenses}
              dateRange={dateRange}
              currency={currency}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeRangeSelector
              value={timeRange}
              onChange={setTimeRange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
            />
            <PropertySelector
              properties={properties}
              value={selectedPropertyId}
              onChange={setSelectedPropertyId}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing data for: <span className="font-semibold">{timeRangeLabel}</span>
            {selectedPropertyId !== "all" && (
              <>
                {" • "}
                <span className="font-semibold">
                  {properties.find((p) => p.id === selectedPropertyId)?.name}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Income (Paid)
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(incomeMetrics.paidIncome, currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total: {formatCurrency(incomeMetrics.totalIncome, currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Expenses
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenseMetrics.totalExpenses, currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Object.keys(expenseMetrics.byCategory).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Net Profit
            </CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                profitLossMetrics.netProfit >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(profitLossMetrics.netProfit, currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profit Margin
            </CardTitle>
            <Percent className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                profitLossMetrics.margin >= 0
                  ? "text-purple-600"
                  : "text-red-600"
              }`}
            >
              {profitLossMetrics.margin.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Net profit / Income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <IncomeBreakdownTable
        payments={filteredPayments}
        currency={currency}
      />

      {/* Expense Breakdown */}
      <ExpenseBreakdownTable
        expensesByCategory={expenseMetrics.byCategory}
        totalExpenses={expenseMetrics.totalExpenses}
        currency={currency}
      />

      {/* Property Metrics - Only show when viewing all properties */}
      {selectedPropertyId === "all" && propertyMetrics.length > 0 && (
        <PropertyMetricsTable
          propertyMetrics={propertyMetrics}
          currency={currency}
        />
      )}

      {/* Empty State */}
      {incomeMetrics.totalIncome === 0 && expenseMetrics.totalExpenses === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No financial data for this period
            </h3>
            <p className="text-gray-600">
              Try selecting a different time range or property filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
