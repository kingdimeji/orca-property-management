import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function TenantPaymentsPage() {
  const session = await auth()

  if (!session || session.user.role !== "TENANT") {
    redirect("/login")
  }

  // Get tenant's lease and payments
  const tenant = await db.tenant.findUnique({
    where: { authUserId: session.user.id },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: {
          payments: {
            orderBy: { dueDate: "desc" },
          },
        },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  })

  if (!tenant || tenant.leases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Lease
            </h3>
            <p className="text-gray-600">
              You don't have an active lease with payment records.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const payments = tenant.leases[0].payments
  const paidPayments = payments.filter((p) => p.status === "PAID")
  const pendingPayments = payments.filter((p) => p.status === "PENDING")
  const overduePayments = payments.filter((p) => p.status === "OVERDUE")

  const totalPaid = paidPayments.reduce(
    (sum, p) => sum + p.amount + p.lateFee,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">
          View your payment history and make rent payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {paidPayments.length} payment{paidPayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(
                pendingPayments.reduce((sum, p) => sum + p.amount + p.lateFee, 0),
                session.user.currency
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {pendingPayments.length} payment{pendingPayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                overduePayments.reduce((sum, p) => sum + p.amount + p.lateFee, 0),
                session.user.currency
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overduePayments.length} payment{overduePayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                Overdue Payments
              </h3>
              <p className="text-sm text-red-700">
                You have {overduePayments.length} overdue payment
                {overduePayments.length !== 1 ? "s" : ""}. Please make a payment as
                soon as possible to avoid late fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Payments Yet
              </h3>
              <p className="text-gray-600">
                Your payment history will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Paid Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Late Fee
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {payment.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, session.user.currency)}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-medium text-red-600">
                        {payment.lateFee > 0
                          ? formatCurrency(payment.lateFee, session.user.currency)
                          : "-"}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(
                          payment.amount + payment.lateFee,
                          session.user.currency
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            payment.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "OVERDUE"
                              ? "bg-red-100 text-red-800"
                              : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "PARTIAL"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {payment.status === "PAID" && payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                          >
                            <Download className="w-4 h-4" />
                            Receipt
                          </a>
                        ) : payment.status === "PENDING" ||
                          payment.status === "OVERDUE" ? (
                          <Link href={`/pay/${payment.reference}`}>
                            <Button
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              Pay Now
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Secure Payments</p>
              <p className="text-sm text-gray-600">
                All payments are processed securely through Paystack
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Payment Schedule</p>
              <p className="text-sm text-gray-600">
                Rent is due on the same day each month as specified in your lease
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Late Payments</p>
              <p className="text-sm text-gray-600">
                Late fees may apply for overdue payments as outlined in your lease
                agreement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
