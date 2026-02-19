/**
 * CSV Export Utilities
 * Pure TypeScript implementation - no external dependencies
 */

import type { Payment, Expense, Property } from "@prisma/client"
import { formatCurrency } from "./utils"

/**
 * Escape CSV field value (handle commas, quotes, newlines)
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = String(value)

  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(",")
  }

  const rows = [headers.map(escapeCSVField).join(",")]

  data.forEach((item) => {
    const row = headers.map((header) => escapeCSVField(item[header]))
    rows.push(row.join(","))
  })

  return rows.join("\n")
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Export expenses to CSV
 */
export function exportExpensesToCSV(
  expenses: (Expense & { property: Property | null })[],
  currency: string
): void {
  const data = expenses.map((expense) => ({
    Date: new Date(expense.date).toLocaleDateString(),
    Category: expense.category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" "),
    Description: expense.description,
    Property: expense.property?.name || "General",
    Vendor: expense.vendor || "",
    Amount: formatCurrency(expense.amount, currency),
    "Amount (Numeric)": expense.amount.toFixed(2),
    Notes: expense.notes || "",
  }))

  const headers = [
    "Date",
    "Category",
    "Description",
    "Property",
    "Vendor",
    "Amount",
    "Amount (Numeric)",
    "Notes",
  ]

  const csv = arrayToCSV(data, headers)
  const filename = `expenses_${new Date().toISOString().split("T")[0]}.csv`
  downloadCSV(filename, csv)
}

/**
 * Export income/payments to CSV
 */
export function exportIncomesToCSV(
  payments: (Payment & {
    lease: {
      tenant: any
      unit: {
        property: Property
      } & { name: string }
    }
  })[],
  currency: string
): void {
  const data = payments.map((payment) => ({
    "Due Date": new Date(payment.dueDate).toLocaleDateString(),
    "Paid Date": payment.paidDate
      ? new Date(payment.paidDate).toLocaleDateString()
      : "Not paid",
    Tenant: `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`,
    Email: payment.lease.tenant.email,
    Property: payment.lease.unit.property.name,
    Unit: payment.lease.unit.name,
    Amount: formatCurrency(payment.amount, currency),
    "Late Fee": formatCurrency(payment.lateFee, currency),
    Total: formatCurrency(payment.amount + payment.lateFee, currency),
    "Total (Numeric)": (payment.amount + payment.lateFee).toFixed(2),
    Status: payment.status,
    Method: payment.paymentMethod || "",
    Reference: payment.reference || "",
    Notes: payment.notes || "",
  }))

  const headers = [
    "Due Date",
    "Paid Date",
    "Tenant",
    "Email",
    "Property",
    "Unit",
    "Amount",
    "Late Fee",
    "Total",
    "Total (Numeric)",
    "Status",
    "Method",
    "Reference",
    "Notes",
  ]

  const csv = arrayToCSV(data, headers)
  const filename = `income_${new Date().toISOString().split("T")[0]}.csv`
  downloadCSV(filename, csv)
}

/**
 * Export full financial report to CSV
 */
export function exportFinancialReportToCSV(
  payments: (Payment & {
    lease: {
      tenant: any
      unit: {
        property: Property
      } & { name: string }
    }
  })[],
  expenses: (Expense & { property: Property | null })[],
  dateRange: { startDate: Date; endDate: Date },
  currency: string
): void {
  // Calculate summary metrics
  const paidIncome = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = paidIncome - totalExpenses
  const margin = paidIncome > 0 ? (netProfit / paidIncome) * 100 : 0

  // Build CSV content manually for custom format
  const lines: string[] = []

  // Header section
  lines.push("FINANCIAL REPORT")
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push(
    `Period: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
  )
  lines.push(`Currency: ${currency}`)
  lines.push("")

  // Summary section
  lines.push("SUMMARY")
  lines.push(`Income (Paid),${formatCurrency(paidIncome, currency)}`)
  lines.push(`Expenses,${formatCurrency(totalExpenses, currency)}`)
  lines.push(`Net Profit,${formatCurrency(netProfit, currency)}`)
  lines.push(`Profit Margin,${margin.toFixed(1)}%`)
  lines.push("")

  // Income details
  lines.push("INCOME DETAILS")
  lines.push("Due Date,Paid Date,Tenant,Property,Unit,Amount,Status")
  payments.forEach((payment) => {
    lines.push(
      [
        new Date(payment.dueDate).toLocaleDateString(),
        payment.paidDate
          ? new Date(payment.paidDate).toLocaleDateString()
          : "Not paid",
        escapeCSVField(
          `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`
        ),
        escapeCSVField(payment.lease.unit.property.name),
        escapeCSVField(payment.lease.unit.name),
        payment.amount + payment.lateFee,
        payment.status,
      ].join(",")
    )
  })
  lines.push("")

  // Expense details
  lines.push("EXPENSE DETAILS")
  lines.push("Date,Category,Description,Property,Vendor,Amount")
  expenses.forEach((expense) => {
    lines.push(
      [
        new Date(expense.date).toLocaleDateString(),
        expense.category
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" "),
        escapeCSVField(expense.description),
        escapeCSVField(expense.property?.name || "General"),
        escapeCSVField(expense.vendor || ""),
        expense.amount,
      ].join(",")
    )
  })

  const csv = lines.join("\n")
  const filename = `financial_report_${new Date().toISOString().split("T")[0]}.csv`
  downloadCSV(filename, csv)
}

/**
 * Format category name for display
 */
function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}
