import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Home,
  DollarSign,
  FileText,
  Wrench,
  Calendar,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function TenantDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== "TENANT") {
    redirect("/login")
  }

  // Get tenant profile
  const tenant = await db.tenant.findUnique({
    where: { authUserId: session.user.id },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          payments: {
            orderBy: { dueDate: "desc" },
            take: 5,
          },
        },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      maintenanceRequests: {
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
        orderBy: { reportedDate: "desc" },
      },
    },
  })

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Tenant Profile Found
            </h3>
            <p className="text-gray-600">
              Please contact your landlord to set up your tenant profile.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentLease = tenant.leases[0]
  const nextPayment = currentLease?.payments.find(
    (p) => p.status === "PENDING" || p.status === "OVERDUE"
  )
  const recentPayments = currentLease?.payments.slice(0, 3) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {tenant.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your rental information
        </p>
      </div>

      {/* Current Lease Summary */}
      {currentLease ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-teal-600" />
              Current Lease
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Property</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentLease.unit.property.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentLease.unit.property.address}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unit</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentLease.unit.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentLease.unit.bedrooms} bed • {currentLease.unit.bathrooms} bath
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="text-lg font-semibold text-teal-600">
                {formatCurrency(currentLease.monthlyRent, session.user.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lease Period</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(currentLease.startDate).toLocaleDateString()} -{" "}
                {new Date(currentLease.endDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Lease
            </h3>
            <p className="text-gray-600">
              You don't have an active lease at the moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Next Payment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Next Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextPayment ? (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    nextPayment.amount + nextPayment.lateFee,
                    session.user.currency
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Due {new Date(nextPayment.dueDate).toLocaleDateString()}
                </p>
                <Link href="/tenant-portal/payments">
                  <Button className="w-full mt-3 bg-teal-600 hover:bg-teal-700">
                    Pay Now
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-600">No pending payments</p>
            )}
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Payments Made
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {currentLease?.payments.filter((p) => p.status === "PAID").length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total paid:{" "}
              {formatCurrency(
                currentLease?.payments
                  .filter((p) => p.status === "PAID")
                  .reduce((sum, p) => sum + p.amount + p.lateFee, 0) || 0,
                session.user.currency
              )}
            </p>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Active Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {tenant.maintenanceRequests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Maintenance requests</p>
            <Link href="/tenant-portal/maintenance/new">
              <Button variant="outline" className="w-full mt-3">
                Submit Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Link
                href="/tenant-portal/payments"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(
                        payment.amount + payment.lateFee,
                        session.user.currency
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                      {payment.paidDate &&
                        ` • Paid: ${new Date(payment.paidDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      payment.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "OVERDUE"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tenant-portal/lease">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="w-6 h-6 text-teal-600" />
                <span>View Lease</span>
              </Button>
            </Link>
            <Link href="/tenant-portal/payments">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <DollarSign className="w-6 h-6 text-teal-600" />
                <span>Make Payment</span>
              </Button>
            </Link>
            <Link href="/tenant-portal/maintenance/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Wrench className="w-6 h-6 text-teal-600" />
                <span>Submit Request</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
