import { db } from "@/lib/db"
import { verifyTransaction } from "@/lib/paystack"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { sendPaymentConfirmationEmail } from "@/lib/email"

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
  const { reference: paymentReference } = await params
  const { trxref, reference: paystackRef } = await searchParams

  // Fetch payment by reference
  const payment = await db.payment.findFirst({
    where: { reference: paymentReference },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: {
            include: {
              property: {
                include: {
                  user: true, // Include landlord for email
                },
              },
            },
          },
        },
      },
    },
  })

  console.log("[CALLBACK] Payment lookup:", {
    reference: paymentReference,
    found: !!payment,
    status: payment?.status,
    paymentMethod: payment?.paymentMethod,
    hasRef: !!payment?.reference,
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

  // If payment is already marked as PAID, check if we need to update paymentMethod
  // (This handles the case where webhook hasn't fired due to localhost limitations)
  if (payment.status === "PAID") {
    console.log("[CALLBACK] Payment already PAID")

    // If paymentMethod is missing and we have a transaction ref, update it and send email
    if (!payment.paymentMethod && (trxref || paystackRef)) {
      const ref = trxref || paystackRef!
      console.log("[CALLBACK] Payment method missing, updating...")

      try {
        const verification = await verifyTransaction(ref)

        if (verification.data.status === "success") {
          // Update payment method
          await db.payment.update({
            where: { id: payment.id },
            data: {
              paymentMethod: "Paystack",
              notes: `${payment.notes || ""}\nPaystack payment confirmed: ${ref}`.trim(),
            },
          })

          // Send email
          try {
            await sendPaymentConfirmationEmail(
              payment.lease.tenant.email,
              `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`,
              payment.amount + payment.lateFee,
              payment.lease.unit.property.user.currency,
              payment.paidDate || new Date(verification.data.paid_at),
              payment.lease.unit.property.name,
              payment.lease.unit.name,
              ref
            )
            console.log("[CALLBACK] Email sent successfully!")
          } catch (emailError) {
            console.error("[CALLBACK] Failed to send email:", emailError)
          }
        }
      } catch (error) {
        console.error("[CALLBACK] Error updating payment method:", error)
      }
    }

    redirect("/tenant-portal/payments")
  }

  // If we have a transaction reference, verify with Paystack
  if (trxref || paystackRef) {
    const ref = trxref || paystackRef!
    console.log("[CALLBACK] Verifying payment with Paystack, ref:", ref)

    try {
      // Verify transaction with Paystack
      const verification = await verifyTransaction(ref)
      console.log("[CALLBACK] Verification result:", verification.data.status)

      if (verification.data.status === "success") {
        console.log("[CALLBACK] Payment successful, updating database...")

        // Update payment in database
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidDate: new Date(verification.data.paid_at),
            paymentMethod: "Paystack",
            notes: `${payment.notes || ""}\nPaystack payment confirmed: ${ref}`.trim(),
          },
        })

        console.log("[CALLBACK] Database updated successfully")

        // Send payment confirmation email
        console.log("[CALLBACK] Sending confirmation email to:", payment.lease.tenant.email)
        try {
          await sendPaymentConfirmationEmail(
            payment.lease.tenant.email,
            `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`,
            payment.amount + payment.lateFee,
            payment.lease.unit.property.user.currency,
            new Date(verification.data.paid_at),
            payment.lease.unit.property.name,
            payment.lease.unit.name,
            ref
          )
          console.log("[CALLBACK] Email sent successfully!")
        } catch (emailError) {
          console.error("[CALLBACK] Failed to send payment confirmation email:", emailError)
          // Don't fail the payment if email fails
        }

        // Redirect to tenant payments page
        console.log("[CALLBACK] Redirecting to payments page...")
        redirect("/tenant-portal/payments")
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
                <Link href={`/pay/${paymentReference}`}>
                  <Button className="w-full">Try Again</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )
      }
    } catch (error) {
      // Re-throw NEXT_REDIRECT errors (these are intentional redirects)
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error
      }

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
              <Link href={`/pay/${paymentReference}`}>
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
          <Link href={`/pay/${paymentReference}`}>
            <Button variant="outline" className="w-full">
              Check Payment Status
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
