import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench,
  MapPin,
  MessageSquare,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { LinkedExpensesSection } from "./linked-expenses-section"

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session || session.user.role !== "TENANT") {
    redirect("/login")
  }

  const { id } = await params

  // Get maintenance request
  const request = await db.maintenanceRequest.findUnique({
    where: { id },
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,
        },
      },
    },
  })

  if (!request) {
    notFound()
  }

  // Verify this request belongs to the logged-in tenant
  if (request.tenant?.authUserId !== session.user.id) {
    redirect("/tenant-portal/maintenance")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />
      case "IN_PROGRESS":
        return <Clock className="w-6 h-6 text-blue-600" />
      case "COMPLETED":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case "CANCELLED":
        return <XCircle className="w-6 h-6 text-gray-600" />
      default:
        return <Wrench className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "OPEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/tenant-portal/maintenance"
          className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Maintenance
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
            <p className="text-gray-600 mt-1">Request #{request.id.slice(-8)}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`border-2 rounded-lg p-4 ${getStatusColor(request.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">
              Status: {request.status.replace("_", " ")}
            </p>
            <p className="text-sm mt-1">
              {request.status === "OPEN" &&
                "Your request has been received and is awaiting review"}
              {request.status === "IN_PROGRESS" &&
                "Your landlord is working on resolving this issue"}
              {request.status === "COMPLETED" &&
                "This issue has been resolved"}
              {request.status === "CANCELLED" && "This request was cancelled"}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
              request.priority
            )}`}
          >
            {request.priority} PRIORITY
          </span>
        </div>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Reported Date
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-base text-gray-900">
                  {new Date(request.reportedDate).toLocaleString()}
                </p>
              </div>
            </div>
            {request.resolvedDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Resolved Date
                </h3>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-base text-gray-900">
                    {new Date(request.resolvedDate).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {request.category && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Category</h3>
                <p className="text-base text-gray-900">{request.category}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Priority</h3>
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(
                  request.priority
                )}`}
              >
                {request.priority}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
            <p className="text-base text-gray-900 whitespace-pre-wrap">
              {request.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Property</p>
              <p className="font-medium text-gray-900">
                {request.unit.property.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unit</p>
              <p className="font-medium text-gray-900">{request.unit.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landlord Response */}
      {request.notes && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Landlord Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-blue-900 whitespace-pre-wrap">
              {request.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cost Information */}
      {request.cost !== null && request.cost !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" />
              Repair Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-600">
              {formatCurrency(request.cost, session.user.currency)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated or actual cost for this repair
            </p>
          </CardContent>
        </Card>
      )}

      {/* Linked Expenses */}
      <LinkedExpensesSection
        maintenanceRequestId={request.id}
        currency={session.user.currency}
      />

      {/* Images */}
      {request.images && request.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {request.images.map((imageUrl, index) => (
                <a
                  key={index}
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-teal-400 transition-colors"
                >
                  <img
                    src={imageUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Request Submitted</p>
                <p className="text-sm text-gray-600">
                  {new Date(request.reportedDate).toLocaleString()}
                </p>
              </div>
            </div>
            {request.status === "IN_PROGRESS" && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Work In Progress</p>
                  <p className="text-sm text-gray-600">
                    Your landlord is addressing this issue
                  </p>
                </div>
              </div>
            )}
            {request.resolvedDate && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Resolved</p>
                  <p className="text-sm text-gray-600">
                    {new Date(request.resolvedDate).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
