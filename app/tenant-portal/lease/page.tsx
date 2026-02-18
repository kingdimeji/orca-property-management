import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Home,
  Calendar,
  DollarSign,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function TenantLeasePage() {
  const session = await auth()

  if (!session || session.user.role !== "TENANT") {
    redirect("/login")
  }

  // Get tenant's active lease with full details
  const tenant = await db.tenant.findUnique({
    where: { authUserId: session.user.id },
    include: {
      user: true, // Landlord
      leases: {
        where: { status: "ACTIVE" },
        include: {
          unit: {
            include: {
              property: {
                include: {
                  user: true, // Property owner (landlord)
                },
              },
            },
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
              You don't have an active lease at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lease = tenant.leases[0]
  const property = lease.unit.property
  const landlord = property.user || tenant.user

  // Calculate days until lease end
  const daysRemaining = Math.ceil(
    (new Date(lease.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Lease</h1>
        <p className="text-gray-600 mt-1">
          View your lease details and property information
        </p>
      </div>

      {/* Lease Status Banner */}
      <div
        className={`px-6 py-4 rounded-lg border-2 ${
          daysRemaining <= 30
            ? "bg-red-50 border-red-200"
            : daysRemaining <= 90
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Calendar
            className={`w-6 h-6 ${
              daysRemaining <= 30
                ? "text-red-600"
                : daysRemaining <= 90
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          />
          <div>
            <p className="font-semibold text-gray-900">
              {daysRemaining > 0
                ? `${daysRemaining} days remaining on your lease`
                : "Your lease has expired"}
            </p>
            <p className="text-sm text-gray-600">
              Lease ends on {new Date(lease.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-teal-600" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Property
              </h3>
              <p className="text-lg font-medium text-gray-900">{property.name}</p>
              <p className="text-sm text-gray-600 mt-1">{property.address}</p>
              <p className="text-sm text-gray-600">
                {property.city}
                {property.state && `, ${property.state}`} {property.postalCode}
              </p>
              <p className="text-sm text-gray-600">{property.country}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Unit Details</h3>
              <p className="text-lg font-medium text-gray-900">{lease.unit.name}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span>{" "}
                  {property.propertyType
                    .split("_")
                    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                    .join(" ")}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bedrooms:</span> {lease.unit.bedrooms}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bathrooms:</span> {lease.unit.bathrooms}
                </p>
                {lease.unit.squareFeet && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Square Feet:</span>{" "}
                    {lease.unit.squareFeet.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Lease Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Lease Period</h3>
              <p className="text-base text-gray-900">
                {new Date(lease.startDate).toLocaleDateString()} -{" "}
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Monthly Rent</h3>
              <p className="text-base font-semibold text-teal-600">
                {formatCurrency(lease.monthlyRent, session.user.currency)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Security Deposit</h3>
              <p className="text-base text-gray-900">
                {formatCurrency(lease.deposit, session.user.currency)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Lease Status</h3>
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  lease.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {lease.status}
              </span>
            </div>
          </div>

          {lease.terms && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Terms & Conditions
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {lease.terms}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Landlord Information */}
      {landlord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Landlord Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">
                    {landlord.name || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${landlord.email}`}
                    className="font-medium text-teal-600 hover:text-teal-700"
                  >
                    {landlord.email}
                  </a>
                </div>
              </div>
              {landlord.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${landlord.phone}`}
                      className="font-medium text-teal-600 hover:text-teal-700"
                    >
                      {landlord.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lease Documents */}
      {lease.documents && lease.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Lease Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lease.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Document {index + 1}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
