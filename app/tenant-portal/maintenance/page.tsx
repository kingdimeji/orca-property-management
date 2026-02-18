import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  XCircle,
} from "lucide-react"
import Link from "next/link"

export default async function TenantMaintenancePage() {
  const session = await auth()

  if (!session || session.user.role !== "TENANT") {
    redirect("/login")
  }

  // Get tenant's maintenance requests
  const tenant = await db.tenant.findUnique({
    where: { authUserId: session.user.id },
    include: {
      maintenanceRequests: {
        include: {
          unit: {
            include: {
              property: true,
            },
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

  const requests = tenant.maintenanceRequests
  const openRequests = requests.filter((r) => r.status === "OPEN")
  const inProgressRequests = requests.filter((r) => r.status === "IN_PROGRESS")
  const completedRequests = requests.filter((r) => r.status === "COMPLETED")

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Wrench className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600 mt-1">
            Report issues and track maintenance progress
          </p>
        </div>
        <Link href="/tenant-portal/maintenance/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {requests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">All requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {openRequests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressRequests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Being addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedRequests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="py-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Maintenance Requests
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any maintenance requests yet.
              </p>
              <Link href="/tenant-portal/maintenance/new">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Request
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/tenant-portal/maintenance/${request.id}`}
                  className="block"
                >
                  <div className="border border-gray-200 rounded-lg p-5 hover:border-teal-300 hover:bg-teal-50/50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              request.priority
                            )}`}
                          >
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Reported:{" "}
                            {new Date(request.reportedDate).toLocaleDateString()}
                          </span>
                          {request.category && (
                            <>
                              <span>•</span>
                              <span>{request.category}</span>
                            </>
                          )}
                          {request.resolvedDate && (
                            <>
                              <span>•</span>
                              <span>
                                Resolved:{" "}
                                {new Date(request.resolvedDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            request.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : request.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "OPEN"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                        {request.notes && (
                          <span className="text-xs text-teal-600 font-medium">
                            Has Response
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Wrench className="w-5 h-5 text-teal-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Submit a Request</p>
              <p className="text-sm text-gray-600">
                Report any maintenance issues or repairs needed in your unit
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Track Progress</p>
              <p className="text-sm text-gray-600">
                Monitor the status of your requests and see landlord responses
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Urgent Issues</p>
              <p className="text-sm text-gray-600">
                For emergencies like water leaks or no heat, mark as URGENT and
                contact your landlord directly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
