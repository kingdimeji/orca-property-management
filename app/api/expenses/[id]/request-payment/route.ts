import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExpenseCategory, PaymentType } from "@prisma/client"

// Maps expense category to the closest PaymentType
const categoryToPaymentType: Record<ExpenseCategory, PaymentType> = {
  MAINTENANCE:     PaymentType.MAINTENANCE,
  REPAIRS:         PaymentType.MAINTENANCE,
  UTILITIES:       PaymentType.OTHER,
  INSURANCE:       PaymentType.OTHER,
  TAXES:           PaymentType.OTHER,
  MANAGEMENT_FEES: PaymentType.OTHER,
  CLEANING:        PaymentType.OTHER,
  LANDSCAPING:     PaymentType.OTHER,
  LEGAL:           PaymentType.OTHER,
  ADVERTISING:     PaymentType.OTHER,
  OTHER:           PaymentType.OTHER,
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Fetch the expense with allocations and units
    const expense = await db.expense.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            unit: {
              include: {
                leases: {
                  where: { status: "ACTIVE" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    if (!expense.isShared || expense.allocations.length === 0) {
      return NextResponse.json(
        { message: "Expense is not a shared expense or has no allocations" },
        { status: 400 }
      )
    }

    const paymentType = categoryToPaymentType[expense.category]
    const dueDate = new Date()
    const created = []
    const skipped = []

    for (const allocation of expense.allocations) {
      const activeLease = allocation.unit.leases[0]

      if (!activeLease) {
        skipped.push({ unitId: allocation.unitId, unitName: allocation.unit.name })
        continue
      }

      const payment = await db.payment.create({
        data: {
          leaseId: activeLease.id,
          amount: allocation.amount,
          dueDate,
          status: "PENDING",
          paymentType,
          notes: `Building expense: ${expense.description}`,
          userId: session.user.id,
        },
      })

      created.push(payment)
    }

    return NextResponse.json({
      created,
      skipped,
      message: `Payment requested for ${created.length} tenant${created.length !== 1 ? "s" : ""}${skipped.length > 0 ? `, ${skipped.length} unit${skipped.length !== 1 ? "s" : ""} skipped (no active lease)` : ""}`,
    })
  } catch (error) {
    console.error("Request payment error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
