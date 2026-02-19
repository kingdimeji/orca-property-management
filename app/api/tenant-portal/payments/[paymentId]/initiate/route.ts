import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { initializeTransaction } from "@/lib/paystack"

/**
 * POST /api/tenant-portal/payments/[paymentId]/initiate
 * Initiate payment for tenant (generates Paystack reference and payment link)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { message: "Unauthorized - Tenants only" },
        { status: 401 }
      )
    }

    const { paymentId } = await params

    // Get payment with all relations
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: {
                  include: {
                    user: true, // Landlord
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    // Verify tenant owns this payment
    const tenant = await db.tenant.findUnique({
      where: { authUserId: session.user.id },
    })

    if (!tenant || payment.lease.tenantId !== tenant.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your payment" },
        { status: 403 }
      )
    }

    // Check if payment is already paid
    if (payment.status === "PAID") {
      return NextResponse.json(
        { message: "Payment has already been paid" },
        { status: 400 }
      )
    }

    // Check if payment already has a reference and receipt URL (already initiated)
    if (payment.reference && payment.receiptUrl) {
      return NextResponse.json({
        success: true,
        reference: payment.reference,
        message: "Payment already initiated",
      })
    }

    // Initialize Paystack payment
    const totalAmount = payment.amount + payment.lateFee
    const landlord = payment.lease.unit.property.user

    // Generate unique reference for this payment
    const paymentReference = `ORCA-${paymentId}-${Date.now()}`

    // Convert amount to kobo (smallest currency unit)
    const amountInKobo = Math.round(totalAmount * 100)

    const paystackResponse = await initializeTransaction({
      email: payment.lease.tenant.email,
      amount: amountInKobo,
      currency: landlord.currency,
      reference: paymentReference,
      callback_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pay/${paymentReference}/callback`,
    })

    if (!paystackResponse.status || !paystackResponse.data) {
      return NextResponse.json(
        { message: "Failed to initialize payment" },
        { status: 500 }
      )
    }

    const { reference, authorization_url } = paystackResponse.data

    // Update payment with reference and payment URL
    await db.payment.update({
      where: { id: paymentId },
      data: {
        reference,
        receiptUrl: authorization_url,
      },
    })

    return NextResponse.json({
      success: true,
      reference,
      authorization_url,
      message: "Payment initiated successfully",
    })
  } catch (error) {
    console.error("Error initiating payment:", error)
    return NextResponse.json(
      { message: "Failed to initiate payment" },
      { status: 500 }
    )
  }
}
