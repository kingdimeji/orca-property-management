import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Payment, Lease, Tenant, Unit, Property } from "@prisma/client"

type PaymentWithDetails = Payment & {
  lease: Lease & {
    tenant: Tenant
    unit: Unit & {
      property: Property
    }
  }
}

export default async function PaymentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch all payments for properties owned by the user
  const payments: PaymentWithDetails[] = await db.payment.findMany({
    include: {
      lease: {
        include: {
          tenant: true,
          unit: true,
        },
      },
    },
    orderBy: {
      dueDate: "desc",
    },
  })

  // Filter to only payments for user's properties
  const userPayments = payments.filter(
    (payment) => payment.lease.unit.property.userId === session.user.id
  )

  // Calculate summary metrics
  const totalPaid = userPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const totalPending = userPayments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const totalOverdue = userPayments
    .filter((p) => p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount + p.lateFee, 0)

  const thisMonthPayments = userPayments.filter((p) => {
    const dueDate = new Date(p.dueDate)
    const now = new Date()
    return (
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getFullYear() === now.getFullYear()
    )
  })

  const thisMonthTotal = thisMonthPayments.reduce(
    (sum, p) => sum + p.amount + p.lateFee,
    0
  )

  function getStatusBadge(status: string) {
    const styles = {
      PAID: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700",
      PARTIAL: "bg-blue-100 text-blue-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}
      >
        {status}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="mt-2 text-gray-600">Track all rent payments across your properties</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Paid
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <DollarSign className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overdue
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOverdue, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(thisMonthTotal, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {thisMonthPayments.length} payment(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {userPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No payments yet
              </h3>
              <p className="text-gray-600">
                Payments will appear here once you start recording them for your tenants.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tenant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Property / Unit
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Paid Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {payment.lease.tenant.firstName}{" "}
                          {payment.lease.tenant.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.lease.tenant.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900">
                          {payment.lease.unit.property.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.lease.unit.name}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {formatDate(payment.dueDate)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(payment.amount, session.user.currency)}
                        </div>
                        {payment.lateFee > 0 && (
                          <div className="text-xs text-red-600">
                            +{formatCurrency(payment.lateFee, session.user.currency)}{" "}
                            late fee
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {payment.paidDate ? (
                          formatDate(payment.paidDate)
                        ) : (
                          <span className="text-gray-400 italic">Not paid</span>
                        )}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {payment.paymentMethod || (
                          <span className="text-gray-400 italic">—</span>
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
    </div>
  )
}
