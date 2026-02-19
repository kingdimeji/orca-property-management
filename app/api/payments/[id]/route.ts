import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            unit: true,
            tenant: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    // Verify ownership through payment → lease → unit → property relationship
    if (payment.lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Get payment error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership through payment → lease → unit → property relationship
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            unit: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    if (payment.lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
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
    if (amount === undefined || !dueDate || !status) {
      return NextResponse.json(
        { message: "Amount, due date, and status are required" },
        { status: 400 }
      )
    }

    // Update payment (cannot change leaseId)
    const updated = await db.payment.update({
      where: { id },
      data: {
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update payment error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership through payment → lease → unit → property relationship
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            unit: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    if (payment.lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Delete payment
    await db.payment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Delete payment error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
