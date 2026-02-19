import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, User, FileText, Calendar, Edit } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import CreateLeaseButton from "./create-lease-button"
import EditLeaseButton from "./edit-lease-button"
import DeleteTenantButton from "./delete-tenant-button"
import DeleteLeaseButton from "./delete-lease-button"
import RecordPaymentButton from "./record-payment-button"
import GeneratePaymentLinkButton from "./generate-payment-link-button"
import PaymentSummary from "./payment-summary"
import PaymentHistorySection from "./payment-history-section"
import InviteTenantButton from "./invite-tenant-button"
import type { TenantWithLeasesAndPayments, UnitWithProperty } from "@/types/prisma"

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  const tenant: TenantWithLeasesAndPayments | null = await db.tenant.findUnique({
    where: {
      id,
    },
    include: {
      leases: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          payments: {
            orderBy: {
              dueDate: "desc",
            },
            take: 10,
          },
        },
        orderBy: {
          startDate: "desc",
        },
      },
    },
  })

  if (!tenant) {
    notFound()
  }

  // Verify user owns at least one property related to this tenant's leases
  const hasAccess = tenant.leases.some(
    (lease) => lease.unit.property.userId === session.user.id
  )

  if (!hasAccess && tenant.leases.length > 0) {
    notFound()
  }

  // Get user's available units for creating new leases
  const availableUnits: UnitWithProperty[] = await db.unit.findMany({
    where: {
      property: {
        userId: session.user.id,
      },
      status: "VACANT",
    },
    include: {
      property: true,
    },
  })

  const activeLeases = tenant.leases.filter((l) => l.status === "ACTIVE")
  const pastLeases = tenant.leases.filter((l) => l.status !== "ACTIVE")

  return (
    <div>
      <Link
        href="/tenants"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tenants
      </Link>

      {/* Tenant Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tenant.firstName} {tenant.lastName}
            </h1>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{tenant.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <InviteTenantButton
              tenantId={tenant.id}
              tenantEmail={tenant.email}
              hasPortalAccess={!!tenant.authUserId}
            />
            <Link href={`/tenants/${tenant.id}/edit`}>
              <Button size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DeleteTenantButton tenant={tenant} />
            {activeLeases.length === 0 && availableUnits.length > 0 && (
              <CreateLeaseButton tenantId={tenant.id} units={availableUnits} />
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{tenant.phone}</span>
            </div>
            {tenant.alternatePhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Alternate Phone:</span>
                <span className="font-medium">{tenant.alternatePhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{tenant.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenant.emergencyContact ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{tenant.emergencyContact}</span>
                </div>
                {tenant.emergencyPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{tenant.emergencyPhone}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No emergency contact provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Identification */}
      {(tenant.idType || tenant.idNumber) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Identification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenant.idType && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID Type:</span>
                <span className="font-medium">{tenant.idType}</span>
              </div>
            )}
            {tenant.idNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID Number:</span>
                <span className="font-medium">{tenant.idNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Leases */}
      {activeLeases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Lease</h2>
          {activeLeases.map((lease) => (
            <Card key={lease.id} className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {lease.unit.property.name} - {lease.unit.name}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full">
                    Active
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Monthly Rent:</span>
                    <p className="text-lg font-semibold">
                      {formatCurrency(lease.monthlyRent, session.user.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Deposit:</span>
                    <p className="text-lg font-semibold">
                      {formatCurrency(lease.deposit, session.user.currency)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <span className="text-sm text-gray-600">Start Date:</span>
                    <p className="font-medium">{formatDate(lease.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">End Date:</span>
                    <p className="font-medium">{formatDate(lease.endDate)}</p>
                  </div>
                </div>
                {lease.terms && (
                  <div className="pt-3 border-t">
                    <span className="text-sm text-gray-600">Terms:</span>
                    <p className="mt-1 text-sm">{lease.terms}</p>
                  </div>
                )}

                {/* Payment Tracking Section */}
                <div className="pt-4 border-t space-y-4">
                  <PaymentSummary
                    payments={lease.payments}
                    monthlyRent={lease.monthlyRent}
                    currency={session.user.currency}
                  />

                  <PaymentHistorySection
                    payments={lease.payments}
                    currency={session.user.currency}
                  />

                  <div className="pt-3 border-t flex gap-2">
                    <RecordPaymentButton
                      leaseId={lease.id}
                      monthlyRent={lease.monthlyRent}
                      currency={session.user.currency}
                    />
                    <GeneratePaymentLinkButton
                      leaseId={lease.id}
                      monthlyRent={lease.monthlyRent}
                      currency={session.user.currency}
                      tenantEmail={tenant.email}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <EditLeaseButton lease={lease} />
                  <DeleteLeaseButton lease={lease} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Past Leases */}
      {pastLeases.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lease History</h2>
          <div className="space-y-4">
            {pastLeases.map((lease) => (
              <Card key={lease.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>
                      {lease.unit.property.name} - {lease.unit.name}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        lease.status === "EXPIRED"
                          ? "bg-gray-100 text-gray-700"
                          : lease.status === "TERMINATED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {lease.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Rent:</span>
                      <p className="font-medium">
                        {formatCurrency(lease.monthlyRent, session.user.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Start:</span>
                      <p className="font-medium">{formatDate(lease.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">End:</span>
                      <p className="font-medium">{formatDate(lease.endDate)}</p>
                    </div>
                  </div>

                  {/* Payment Summary for Past Leases */}
                  {lease.payments.length > 0 && (
                    <div className="text-sm text-gray-600 pt-3 border-t mb-3">
                      <span className="font-medium">
                        {lease.payments.filter((p) => p.status === "PAID").length} payment(s)
                      </span>
                      {" "}totaling{" "}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(
                          lease.payments
                            .filter((p) => p.status === "PAID")
                            .reduce((sum, p) => sum + p.amount, 0),
                          session.user.currency
                        )}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t flex gap-2">
                    <EditLeaseButton lease={lease} />
                    <DeleteLeaseButton lease={lease} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tenant.leases.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No leases yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Create a lease agreement to assign this tenant to a unit.
            </p>
            {availableUnits.length > 0 ? (
              <CreateLeaseButton tenantId={tenant.id} units={availableUnits} />
            ) : (
              <p className="text-sm text-gray-500">
                No vacant units available. Add units to your properties first.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
