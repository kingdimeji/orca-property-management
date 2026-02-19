import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      leaseId,
      amount,
      dueDate,
      paidDate,
      status,
      paymentMethod,
      reference,
      lateFee,
      notes,
    } = body

    // Validate required fields
    if (!leaseId || amount === undefined || !dueDate || !status) {
      return NextResponse.json(
        { message: "Lease ID, amount, due date, and status are required" },
        { status: 400 }
      )
    }

    // Verify ownership through lease → unit → property relationship
    const lease = await db.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 })
    }

    if (lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        leaseId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        paidDate: paidDate ? new Date(paidDate) : null,
        status,
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        lateFee: lateFee ? parseFloat(lateFee) : 0,
        notes: notes || null,
      },
      include: {
        lease: {
          include: {
            unit: true,
            tenant: true,
          },
        },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const leaseId = searchParams.get("leaseId")

    if (!leaseId) {
      return NextResponse.json(
        { message: "Lease ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership through lease → unit → property relationship
    const lease = await db.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 })
    }

    if (lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Fetch payments for this lease
    const payments = await db.payment.findMany({
      where: { leaseId },
      orderBy: { dueDate: "desc" },
      include: {
        lease: {
          include: {
            unit: true,
            tenant: true,
          },
        },
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
