"use client"

import type { Payment } from "@prisma/client"
import { formatCurrency, formatDate } from "@/lib/utils"

interface PaymentSummaryProps {
  payments: Payment[]
  monthlyRent: number
  currency: string
}

export default function PaymentSummary({
  payments,
  monthlyRent,
  currency,
}: PaymentSummaryProps) {
  // Calculate total paid (PAID status only)
  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  // Calculate outstanding balance (PENDING + OVERDUE)
  const outstanding = payments
    .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  // Find next due date (earliest pending/overdue payment)
  const nextDuePayment = payments
    .filter((p) => p.status !== "PAID" && p.status !== "CANCELLED")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="text-xs text-gray-600 mb-1">Total Paid</p>
        <p className="text-lg font-semibold text-green-600">
          {formatCurrency(totalPaid, currency)}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-600 mb-1">Outstanding</p>
        <p className="text-lg font-semibold text-orange-600">
          {formatCurrency(outstanding, currency)}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-600 mb-1">Next Due</p>
        {nextDuePayment ? (
          <>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(nextDuePayment.dueDate)}
            </p>
            <p className="text-xs text-gray-500">
              {formatCurrency(nextDuePayment.amount, currency)}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">No pending payments</p>
        )}
      </div>
    </div>
  )
}
