import { db } from "@/lib/db"
import { verifyTransaction } from "@/lib/paystack"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface CallbackPageProps {
  params: Promise<{
    reference: string
  }>
  searchParams: Promise<{
    trxref?: string
    reference?: string
  }>
}

export default async function CallbackPage({
  params,
  searchParams,
}: CallbackPageProps) {
  const { reference: paymentId } = await params
  const { trxref, reference: paystackRef } = await searchParams

  // Fetch payment
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  })

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <CardTitle>Payment Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We couldn't find the payment you're looking for.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If payment is already marked as PAID, show success
  if (payment.status === "PAID") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment has been confirmed. Thank you!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                A receipt has been sent to your email address.
              </p>
            </div>
            <Link href={`/pay/${paymentId}`}>
              <Button className="w-full">View Payment Details</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If we have a transaction reference, verify with Paystack
  if (trxref || paystackRef) {
    const ref = trxref || paystackRef!

    try {
      // Verify transaction with Paystack
      const verification = await verifyTransaction(ref)

      if (verification.data.status === "success") {
        // Update payment in database
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: "PAID",
            paidDate: new Date(verification.data.paid_at),
            notes: `${payment.notes || ""}\nPaystack payment confirmed: ${ref}`.trim(),
          },
        })

        // Redirect to payment page to show success
        redirect(`/pay/${paymentId}`)
      } else {
        // Payment failed or abandoned
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full">
              <CardHeader className="text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <CardTitle>Payment {verification.data.status}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  {verification.data.gateway_response || "Your payment could not be processed."}
                </p>
                <Link href={`/pay/${paymentId}`}>
                  <Button className="w-full">Try Again</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <CardTitle>Verification Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We couldn't verify your payment. Please contact support.
              </p>
              <Link href={`/pay/${paymentId}`}>
                <Button className="w-full">Back to Payment</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // No transaction reference - show processing message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <CardTitle>Processing Payment...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your payment.
          </p>
          <Link href={`/pay/${paymentId}`}>
            <Button variant="outline" className="w-full">
              Check Payment Status
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
