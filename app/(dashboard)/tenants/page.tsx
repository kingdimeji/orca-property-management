import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, Mail, Phone, Home } from "lucide-react"

export default async function TenantsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const tenants = await db.tenant.findMany({
    include: {
      leases: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Filter tenants that have at least one lease with a property owned by the user
  const userTenants = tenants.filter((tenant) =>
    tenant.leases.some((lease) => lease.unit.property.userId === session.user.id)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="mt-2 text-gray-600">
            Manage your tenants and lease agreements
          </p>
        </div>
        <Link href="/tenants/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {userTenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tenants yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Add your first tenant and create a lease agreement to get started.
            </p>
            <Link href="/tenants/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Tenant
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userTenants.map((tenant) => {
            const activeLeases = tenant.leases.filter((l) => l.status === "ACTIVE")
            const activeLease = activeLeases[0]

            return (
              <Link key={tenant.id} href={`/tenants/${tenant.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>
                        {tenant.firstName} {tenant.lastName}
                      </span>
                      {activeLease && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{tenant.phone}</span>
                    </div>
                    {activeLease && (
                      <div className="flex items-center text-sm text-gray-600 pt-2 border-t">
                        <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {activeLease.unit.property.name} - {activeLease.unit.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-600">
                        {tenant.leases.length} {tenant.leases.length === 1 ? "lease" : "leases"}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
