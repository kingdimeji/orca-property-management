import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { initializeTransaction } from "@/lib/paystack"
import { z } from "zod"

const initializeSchema = z.object({
  leaseId: z.string().min(1, "Lease ID is required"),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = initializeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { leaseId, amount, dueDate, notes } = validation.data

    // Verify lease exists and user owns the property
    const lease = await db.lease.findUnique({
      where: { id: leaseId },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 })
    }

    // Check authorization: user must own the property
    if (lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Create Payment record with PENDING status
    const payment = await db.payment.create({
      data: {
        leaseId,
        amount,
        dueDate: new Date(dueDate),
        status: "PENDING",
        paymentMethod: "Paystack",
        notes: notes || null,
      },
    })

    // Convert amount to kobo/cents (Paystack requires smallest unit)
    const amountInKobo = Math.round(amount * 100)

    // Get base URL for callback
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`

    // Initialize Paystack transaction
    const paystackResponse = await initializeTransaction({
      email: lease.tenant.email,
      amount: amountInKobo,
      currency: session.user.currency, // NGN, GBP, NOK
      reference: payment.id, // Use payment ID as reference for easy lookup
      callback_url: `${baseUrl}/pay/${payment.id}/callback`,
      metadata: {
        paymentId: payment.id,
        leaseId: lease.id,
        tenantId: lease.tenant.id,
        propertyId: lease.unit.property.id,
        unitId: lease.unit.id,
      },
    })

    // Update payment with Paystack reference and authorization URL
    await db.payment.update({
      where: { id: payment.id },
      data: {
        reference: paystackResponse.data.reference,
        receiptUrl: paystackResponse.data.authorization_url, // Store Paystack checkout URL
      },
    })

    // Return payment link and details
    return NextResponse.json(
      {
        paymentId: payment.id,
        reference: paystackResponse.data.reference,
        authorizationUrl: paystackResponse.data.authorization_url,
        paymentLink: `${baseUrl}/pay/${payment.id}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Initialize payment error:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    )
  }
}
