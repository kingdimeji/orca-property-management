import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Home,
  Calendar,
  DollarSign,
  User,
  Building2,
  CreditCard
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface PaymentPageProps {
  params: Promise<{
    reference: string
  }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { reference } = await params

  // Fetch payment with full details
  const payment = await db.payment.findUnique({
    where: { id: reference },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: {
            include: {
              property: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      currency: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!payment) {
    notFound()
  }

  const { lease } = payment
  const { tenant, unit } = lease
  const { property } = unit
  const { user: landlord } = property

  // If payment is already paid, show success message
  if (payment.status === "PAID") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Payment Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-600">This payment has already been completed.</p>
              {payment.paidDate && (
                <p className="text-sm text-gray-500">
                  Paid on {formatDate(payment.paidDate)}
                </p>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(payment.amount + payment.lateFee, landlord.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span className="font-medium text-gray-900">{property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit:</span>
                <span className="font-medium text-gray-900">{unit.name}</span>
              </div>
              {payment.reference && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-gray-900">{payment.reference}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800 text-center">
                Thank you for your payment! If you have any questions, please contact your landlord.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If payment is pending, show payment form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Rent Payment
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Secure payment powered by Orca Property Management
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Tenant</p>
                <p className="font-semibold text-gray-900">
                  {tenant.firstName} {tenant.lastName}
                </p>
                <p className="text-sm text-gray-500">{tenant.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Home className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Property</p>
                <p className="font-semibold text-gray-900">{property.name}</p>
                <p className="text-sm text-gray-500">Unit: {unit.name}</p>
                {property.address && (
                  <p className="text-sm text-gray-500">{property.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(payment.dueDate)}
                </p>
                {new Date(payment.dueDate) < new Date() && (
                  <p className="text-sm text-red-600 font-medium">Overdue</p>
                )}
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Rent Amount</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(payment.amount, landlord.currency)}
              </span>
            </div>
            {payment.lateFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Late Fee</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(payment.lateFee, landlord.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(payment.amount + payment.lateFee, landlord.currency)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Note from landlord:</p>
              <p className="text-sm text-gray-700">{payment.notes}</p>
            </div>
          )}

          {/* Payment Button */}
          {payment.receiptUrl ? (
            <form action={payment.receiptUrl} method="get">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay with Paystack
              </Button>
            </form>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-800">
                Payment link not available. Please contact your landlord.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Secure Payment</p>
                <p className="text-green-700 mt-1">
                  Your payment is processed securely through Paystack.
                  We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Landlord Contact */}
          <div className="text-center text-sm text-gray-500">
            Questions? Contact {landlord.name || "your landlord"} at{" "}
            <a
              href={`mailto:${landlord.email}`}
              className="text-blue-600 hover:underline"
            >
              {landlord.email}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-gray-500">
          Powered by <span className="font-semibold">Orca Property Management</span>
        </p>
      </div>
    </div>
  )
}
