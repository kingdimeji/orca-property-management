import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, MapPin, Home } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import AddUnitButton from "./add-unit-button"
import type { PropertyWithUnits } from "@/types/prisma"

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  const property: PropertyWithUnits | null = await db.property.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      units: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!property) {
    notFound()
  }

  const vacantUnits = property.units.filter((u) => u.status === "VACANT").length
  const occupiedUnits = property.units.filter((u) => u.status === "OCCUPIED").length

  return (
    <div>
      <Link
        href="/properties"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Properties
      </Link>

      {/* Property Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>
                {property.address}, {property.city}
                {property.state && `, ${property.state}`}, {property.country}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            {property.propertyType}
          </span>
        </div>

        {property.description && (
          <p className="text-gray-600 max-w-3xl">{property.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{property.units.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Occupied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{occupiedUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vacant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{vacantUnits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Units Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Units</h2>
        <AddUnitButton propertyId={property.id} />
      </div>

      {property.units.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No units yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Add units to this property to start managing tenants and rent.
            </p>
            <AddUnitButton propertyId={property.id} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {property.units.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{unit.name}</CardTitle>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      unit.status === "VACANT"
                        ? "bg-orange-100 text-orange-700"
                        : unit.status === "OCCUPIED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rent:</span>
                  <span className="font-semibold">
                    {formatCurrency(unit.monthlyRent, session.user.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-semibold">
                    {formatCurrency(unit.deposit, session.user.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-semibold">{unit.bedrooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bathrooms:</span>
                  <span className="font-semibold">{unit.bathrooms}</span>
                </div>
                {unit.description && (
                  <p className="text-sm text-gray-600 pt-2 border-t">
                    {unit.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
