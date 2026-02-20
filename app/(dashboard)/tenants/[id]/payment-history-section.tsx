"use client"

import type { Payment } from "@prisma/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { formatPaymentType, getPaymentTypeBadgeColor } from "@/lib/payment-utils"

interface PaymentHistorySectionProps {
  payments: Payment[]
  currency: string
}

export default function PaymentHistorySection({
  payments,
  currency,
}: PaymentHistorySectionProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No payments recorded yet
      </div>
    )
  }

  // Show last 5 payments
  const recentPayments = payments.slice(0, 5)

  function getStatusBadge(status: string) {
    const styles = {
      PAID: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700",
      PARTIAL: "bg-blue-100 text-blue-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Payment History</h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-medium text-gray-600">Due Date</th>
              <th className="text-left py-2 px-2 font-medium text-gray-600">Amount</th>
              <th className="text-left py-2 px-2 font-medium text-gray-600">Type</th>
              <th className="text-left py-2 px-2 font-medium text-gray-600">Paid Date</th>
              <th className="text-left py-2 px-2 font-medium text-gray-600">Status</th>
              <th className="text-left py-2 px-2 font-medium text-gray-600">Method</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">{formatDate(payment.dueDate)}</td>
                <td className="py-3 px-2 font-medium">
                  {formatCurrency(payment.amount, currency)}
                  {payment.lateFee > 0 && (
                    <span className="text-xs text-red-600 ml-1">
                      (+{formatCurrency(payment.lateFee, currency)} late fee)
                    </span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentTypeBadgeColor(payment.paymentType)}`}>
                    {formatPaymentType(payment.paymentType)}
                  </span>
                </td>
                <td className="py-3 px-2">
                  {payment.paidDate ? formatDate(payment.paidDate) : (
                    <span className="text-gray-400 italic">Not paid</span>
                  )}
                </td>
                <td className="py-3 px-2">{getStatusBadge(payment.status)}</td>
                <td className="py-3 px-2 text-gray-600">
                  {payment.paymentMethod || <span className="text-gray-400 italic">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length > 5 && (
        <p className="text-xs text-gray-500 text-center pt-2">
          Showing {recentPayments.length} of {payments.length} payments
        </p>
      )}
    </div>
  )
}
