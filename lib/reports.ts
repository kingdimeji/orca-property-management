/**
 * Financial reporting calculation utilities
 * Pure functions for income, expenses, profit/loss calculations
 */

import type { Payment, Expense, ExpenseCategory } from "@prisma/client"

export type TimeRange = "month" | "quarter" | "year" | "all" | "custom"

export interface DateRangeResult {
  startDate: Date
  endDate: Date
}

export interface IncomeMetrics {
  totalIncome: number
  paidIncome: number
  pendingIncome: number
  overdueIncome: number
}

export interface ExpenseMetrics {
  totalExpenses: number
  byCategory: Record<string, number>
}

export interface PropertyMetrics {
  propertyId: string
  propertyName: string
  income: number
  expenses: number
  netProfit: number
  margin: number // percentage
}

export interface ProfitLossMetrics {
  income: number
  expenses: number
  netProfit: number
  margin: number // percentage
}

/**
 * Get date range for a given time period
 */
export function getDateRange(
  range: TimeRange,
  referenceDate: Date = new Date(),
  customStart?: Date,
  customEnd?: Date
): DateRangeResult {
  const now = referenceDate

  switch (range) {
    case "month": {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return { startDate, endDate }
    }

    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3)
      const startDate = new Date(now.getFullYear(), quarter * 3, 1)
      const endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59)
      return { startDate, endDate }
    }

    case "year": {
      const startDate = new Date(now.getFullYear(), 0, 1)
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      return { startDate, endDate }
    }

    case "custom": {
      if (!customStart || !customEnd) {
        throw new Error("Custom date range requires both start and end dates")
      }
      return {
        startDate: new Date(customStart),
        endDate: new Date(customEnd.getFullYear(), customEnd.getMonth(), customEnd.getDate(), 23, 59, 59)
      }
    }

    case "all":
    default: {
      // Return a very wide range for "all time"
      const startDate = new Date(2000, 0, 1)
      const endDate = new Date(2099, 11, 31, 23, 59, 59)
      return { startDate, endDate }
    }
  }
}

/**
 * Calculate income metrics from payments
 */
export function calculateIncome(
  payments: Payment[],
  startDate?: Date,
  endDate?: Date
): IncomeMetrics {
  let filteredPayments = payments

  // Apply date filter if provided
  if (startDate || endDate) {
    filteredPayments = payments.filter((p) => {
      const dueDate = new Date(p.dueDate)
      if (startDate && dueDate < startDate) return false
      if (endDate && dueDate > endDate) return false
      return true
    })
  }

  const paidIncome = filteredPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const pendingIncome = filteredPayments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const overdueIncome = filteredPayments
    .filter((p) => p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const totalIncome = paidIncome + pendingIncome + overdueIncome

  return {
    totalIncome,
    paidIncome,
    pendingIncome,
    overdueIncome,
  }
}

/**
 * Calculate expense metrics
 */
export function calculateExpenses(
  expenses: Expense[],
  startDate?: Date,
  endDate?: Date
): ExpenseMetrics {
  let filteredExpenses = expenses

  // Apply date filter if provided
  if (startDate || endDate) {
    filteredExpenses = expenses.filter((e) => {
      const expenseDate = new Date(e.date)
      if (startDate && expenseDate < startDate) return false
      if (endDate && expenseDate > endDate) return false
      return true
    })
  }

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = groupExpensesByCategory(filteredExpenses)

  return {
    totalExpenses,
    byCategory,
  }
}

/**
 * Group expenses by category with totals
 */
export function groupExpensesByCategory(
  expenses: Expense[]
): Record<string, number> {
  const grouped: Record<string, number> = {}

  expenses.forEach((expense) => {
    const category = expense.category
    grouped[category] = (grouped[category] || 0) + expense.amount
  })

  return grouped
}

/**
 * Calculate profit/loss metrics
 */
export function calculateProfitLoss(
  income: number,
  expenses: number
): ProfitLossMetrics {
  const netProfit = income - expenses
  const margin = income > 0 ? (netProfit / income) * 100 : 0

  return {
    income,
    expenses,
    netProfit,
    margin,
  }
}

/**
 * Calculate metrics per property
 * Requires payments and expenses with property relations loaded
 */
export function calculatePropertyMetrics(
  payments: Payment[] & { lease?: { unit?: { property?: { id: string; name: string } } } }[],
  expenses: Expense[] & { property?: { id: string; name: string } | null }[],
  startDate?: Date,
  endDate?: Date
): PropertyMetrics[] {
  const propertyMap = new Map<string, PropertyMetrics>()

  // Calculate income per property from payments
  payments.forEach((payment) => {
    const property = (payment as any).lease?.unit?.property
    if (!property) return

    // Apply date filter
    if (startDate || endDate) {
      const dueDate = new Date(payment.dueDate)
      if (startDate && dueDate < startDate) return
      if (endDate && dueDate > endDate) return
    }

    // Only count PAID payments for income
    if (payment.status !== "PAID") return

    const propertyId = property.id
    const existing = propertyMap.get(propertyId)

    if (existing) {
      existing.income += payment.amount + payment.lateFee
    } else {
      propertyMap.set(propertyId, {
        propertyId,
        propertyName: property.name,
        income: payment.amount + payment.lateFee,
        expenses: 0,
        netProfit: 0,
        margin: 0,
      })
    }
  })

  // Calculate expenses per property
  expenses.forEach((expense) => {
    const property = (expense as any).property
    if (!property) return // Skip general/company expenses

    // Apply date filter
    if (startDate || endDate) {
      const expenseDate = new Date(expense.date)
      if (startDate && expenseDate < startDate) return
      if (endDate && expenseDate > endDate) return
    }

    const propertyId = property.id
    const existing = propertyMap.get(propertyId)

    if (existing) {
      existing.expenses += expense.amount
    } else {
      propertyMap.set(propertyId, {
        propertyId,
        propertyName: property.name,
        income: 0,
        expenses: expense.amount,
        netProfit: 0,
        margin: 0,
      })
    }
  })

  // Calculate net profit and margin for each property
  const metrics = Array.from(propertyMap.values()).map((metric) => {
    const netProfit = metric.income - metric.expenses
    const margin = metric.income > 0 ? (netProfit / metric.income) * 100 : 0

    return {
      ...metric,
      netProfit,
      margin,
    }
  })

  // Sort by net profit descending
  return metrics.sort((a, b) => b.netProfit - a.netProfit)
}

/**
 * Get label for time range
 */
export function getTimeRangeLabel(
  range: TimeRange,
  customStart?: Date,
  customEnd?: Date
): string {
  switch (range) {
    case "month":
      return "This Month"
    case "quarter":
      return "This Quarter"
    case "year":
      return "This Year"
    case "custom":
      if (customStart && customEnd) {
        return `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`
      }
      return "Custom Range"
    case "all":
    default:
      return "All Time"
  }
}
