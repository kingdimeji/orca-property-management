import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPaystackSignature } from "@/lib/crypto-utils"
import type { PaystackWebhookEvent } from "@/types/paystack"

export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      console.error("Webhook: Missing signature")
      return NextResponse.json(
        { message: "Missing signature" },
        { status: 401 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error("Webhook: PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      )
    }

    const isValid = verifyPaystackSignature(rawBody, signature, secretKey)

    if (!isValid) {
      console.error("Webhook: Invalid signature")
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      )
    }

    // Parse webhook event
    const event: PaystackWebhookEvent = JSON.parse(rawBody)

    console.log("Paystack webhook event:", event.event, event.data.reference)

    // Handle different event types
    switch (event.event) {
      case "charge.success": {
        await handleChargeSuccess(event)
        break
      }

      case "charge.failed": {
        await handleChargeFailed(event)
        break
      }

      case "charge.abandoned": {
        await handleChargeAbandoned(event)
        break
      }

      default: {
        console.log(`Unhandled webhook event: ${event.event}`)
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    // Still return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { reference, amount, paid_at } = event.data

  try {
    // Find payment by reference (we use payment ID as reference)
    const payment = await db.payment.findFirst({
      where: { reference },
    })

    if (!payment) {
      console.error(`Payment not found for reference: ${reference}`)
      return
    }

    // Check if already processed (idempotency)
    if (payment.status === "PAID") {
      console.log(`Payment ${payment.id} already marked as PAID`)
      return
    }

    // Verify amount matches (convert from kobo to currency unit)
    const expectedAmountInKobo = Math.round(payment.amount * 100)
    if (amount !== expectedAmountInKobo) {
      console.error(
        `Amount mismatch for payment ${payment.id}: expected ${expectedAmountInKobo}, got ${amount}`
      )
      // Log in notes but don't auto-update
      await db.payment.update({
        where: { id: payment.id },
        data: {
          notes: `${payment.notes || ""}\nALERT: Paystack amount mismatch (expected ${expectedAmountInKobo}, got ${amount})`.trim(),
        },
      })
      return
    }

    // Update payment status to PAID
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidDate: new Date(paid_at),
        notes: `${payment.notes || ""}\nPaystack payment confirmed: ${reference}`.trim(),
      },
    })

    console.log(`Payment ${payment.id} marked as PAID`)
  } catch (error) {
    console.error("Error handling charge.success:", error)
    throw error
  }
}

async function handleChargeFailed(event: PaystackWebhookEvent) {
  const { reference, message } = event.data

  try {
    const payment = await db.payment.findFirst({
      where: { reference },
    })

    if (!payment) {
      console.error(`Payment not found for reference: ${reference}`)
      return
    }

    // Log failure in notes
    await db.payment.update({
      where: { id: payment.id },
      data: {
        notes: `${payment.notes || ""}\nPaystack payment failed: ${message || "Unknown error"}`.trim(),
      },
    })

    console.log(`Payment ${payment.id} failed: ${message}`)
  } catch (error) {
    console.error("Error handling charge.failed:", error)
    throw error
  }
}

async function handleChargeAbandoned(event: PaystackWebhookEvent) {
  const { reference } = event.data

  try {
    const payment = await db.payment.findFirst({
      where: { reference },
    })

    if (!payment) {
      console.error(`Payment not found for reference: ${reference}`)
      return
    }

    // Log abandonment in notes
    await db.payment.update({
      where: { id: payment.id },
      data: {
        notes: `${payment.notes || ""}\nPaystack payment abandoned`.trim(),
      },
    })

    console.log(`Payment ${payment.id} abandoned`)
  } catch (error) {
    console.error("Error handling charge.abandoned:", error)
    throw error
  }
}
