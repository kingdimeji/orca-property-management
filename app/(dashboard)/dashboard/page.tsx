import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, DollarSign, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  // Fetch dashboard stats
  const [properties, tenants, payments] = await Promise.all([
    db.property.count({
      where: { userId: session.user.id },
    }),
    db.tenant.count({
      where: {
        leases: {
          some: {
            unit: {
              property: {
                userId: session.user.id,
              },
            },
            status: "ACTIVE",
          },
        },
      },
    }),
    db.payment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              userId: session.user.id,
            },
          },
        },
      },
      select: {
        amount: true,
        status: true,
      },
    }),
  ])

  const totalRevenue = payments
    .filter((p: { status: string; amount: number }) => p.status === "PAID")
    .reduce((sum: number, p: { status: string; amount: number }) => sum + p.amount, 0)

  const pendingPayments = payments.filter((p: { status: string; amount: number }) => p.status === "PENDING" || p.status === "OVERDUE").length

  const stats = [
    {
      name: "Total Properties",
      value: properties.toString(),
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      name: "Active Tenants",
      value: tenants.toString(),
      icon: Users,
      color: "bg-green-500",
    },
    {
      name: "Total Revenue",
      value: formatCurrency(totalRevenue, session.user.currency),
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      name: "Pending Payments",
      value: pendingPayments.toString(),
      icon: AlertCircle,
      color: "bg-orange-500",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s what&apos;s happening with your properties today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-4 h-4 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              + Add New Property
            </button>
            <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              + Add New Tenant
            </button>
            <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              + Record Payment
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              No recent activity to display yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
