import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, MapPin } from "lucide-react"
import type { PropertyWithUnits } from "@/types/prisma"

export default async function PropertiesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const properties: PropertyWithUnits[] = await db.property.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      units: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">
            Manage your rental properties and units
          </p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Get started by adding your first property. You can then add units and tenants to it.
            </p>
            <Link href="/properties/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                {property.image && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{property.name}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {property.propertyType}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {property.address}, {property.city}
                      {property.state && `, ${property.state}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      {property.units.length} {property.units.length === 1 ? "unit" : "units"}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      View Details →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
