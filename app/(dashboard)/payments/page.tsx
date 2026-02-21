import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { formatPaymentType } from "@/lib/payment-utils"
import { Badge } from "@/components/ui/badge"
import { ResponsiveTable } from "@/components/ui/responsive-table"

export default async function PaymentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch all payments for properties owned by the user
  const payments = await db.payment.findMany({
    include: {
      lease: {
        include: {
          tenant: true,
          unit: {
            include: {
              property: true,
            },
          },
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
            <ResponsiveTable
              headers={[
                "Tenant",
                "Property/Unit",
                "Type",
                "Due Date",
                "Amount",
                "Paid Date",
                "Status",
                "Method"
              ]}
              rows={userPayments.map((payment) => ({
                key: payment.id,
                cells: [
                  // Tenant
                  <div key="tenant">
                    <div className="font-medium text-gray-900">
                      {payment.lease.tenant.firstName} {payment.lease.tenant.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.lease.tenant.email}
                    </div>
                  </div>,
                  // Property/Unit
                  <div key="property">
                    <div className="text-gray-900">
                      {payment.lease.unit.property.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.lease.unit.name}
                    </div>
                  </div>,
                  // Type
                  <Badge key="type" variant={payment.paymentType.toLowerCase() as any}>
                    {formatPaymentType(payment.paymentType)}
                  </Badge>,
                  // Due Date
                  formatDate(payment.dueDate),
                  // Amount
                  <div key="amount">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(payment.amount, session.user.currency)}
                    </div>
                    {payment.lateFee > 0 && (
                      <div className="text-xs text-red-600">
                        +{formatCurrency(payment.lateFee, session.user.currency)} late fee
                      </div>
                    )}
                  </div>,
                  // Paid Date
                  payment.paidDate ? (
                    formatDate(payment.paidDate)
                  ) : (
                    <span className="text-gray-400 italic">Not paid</span>
                  ),
                  // Status
                  <Badge key="status" variant={payment.status.toLowerCase() as any}>
                    {payment.status}
                  </Badge>,
                  // Method
                  payment.paymentMethod || <span className="text-gray-400 italic">—</span>
                ]
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
