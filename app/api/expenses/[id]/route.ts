import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExpenseCategory } from "@prisma/client"

const INCLUDE_EXPENSE_RELATIONS = {
  property: true,
  maintenanceRequest: {
    include: {
      unit: {
        include: { property: true },
      },
    },
  },
  allocations: {
    include: { unit: true },
  },
} as const

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

    const expense = await db.expense.findUnique({
      where: { id },
      include: INCLUDE_EXPENSE_RELATIONS,
    })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Get expense error:", error)
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

    const expense = await db.expense.findUnique({ where: { id } })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      amount,
      category,
      description,
      date,
      propertyId,
      maintenanceRequestId,
      vendor,
      receiptUrl,
      notes,
      isShared,
      allocations,
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Valid amount is required" },
        { status: 400 }
      )
    }

    if (!category || !Object.values(ExpenseCategory).includes(category)) {
      return NextResponse.json(
        { message: "Valid category is required" },
        { status: 400 }
      )
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { message: "Description is required" },
        { status: 400 }
      )
    }

    if (!date) {
      return NextResponse.json({ message: "Date is required" }, { status: 400 })
    }

    let finalPropertyId = propertyId
    if (propertyId && propertyId !== expense.propertyId) {
      const property = await db.property.findUnique({ where: { id: propertyId } })

      if (!property) {
        return NextResponse.json(
          { message: "Property not found" },
          { status: 404 }
        )
      }

      if (property.userId !== session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
      }
    }

    if (
      maintenanceRequestId !== undefined &&
      maintenanceRequestId !== expense.maintenanceRequestId
    ) {
      if (maintenanceRequestId) {
        const maintenanceRequest = await db.maintenanceRequest.findFirst({
          where: {
            id: maintenanceRequestId,
            unit: { property: { userId: session.user.id } },
          },
          include: { unit: { include: { property: true } } },
        })

        if (!maintenanceRequest) {
          return NextResponse.json(
            { message: "Maintenance request not found or access denied" },
            { status: 404 }
          )
        }

        if (!finalPropertyId && maintenanceRequest.unit.property.id) {
          finalPropertyId = maintenanceRequest.unit.property.id
        }
      }
    }

    const parsedAmount = parseFloat(amount)

    // Build new allocations if isShared
    let allocationsData: { unitId: string; percentage: number; amount: number }[] = []

    if (isShared && finalPropertyId) {
      if (allocations && allocations.length > 0) {
        const total = allocations.reduce((sum: number, a: { percentage: number }) => sum + a.percentage, 0)
        if (Math.abs(total - 100) > 0.5) {
          return NextResponse.json(
            { message: "Allocation percentages must total 100%" },
            { status: 400 }
          )
        }
        allocationsData = allocations.map((a: { unitId: string; percentage: number }) => ({
          unitId: a.unitId,
          percentage: a.percentage,
          amount: parseFloat(((parsedAmount * a.percentage) / 100).toFixed(2)),
        }))
      } else {
        const units = await db.unit.findMany({
          where: { propertyId: finalPropertyId },
          select: { id: true },
        })
        if (units.length > 0) {
          const equalPct = parseFloat((100 / units.length).toFixed(2))
          allocationsData = units.map((unit, i) => ({
            unitId: unit.id,
            percentage: i === units.length - 1 ? 100 - equalPct * (units.length - 1) : equalPct,
            amount: parseFloat(((parsedAmount * equalPct) / 100).toFixed(2)),
          }))
        }
      }
    }

    // Update expense + replace allocations in a transaction
    const updated = await db.$transaction(async (tx) => {
      // Delete existing allocations first
      await tx.expenseAllocation.deleteMany({ where: { expenseId: id } })

      await tx.expense.update({
        where: { id },
        data: {
          amount: parsedAmount,
          category,
          description: description.trim(),
          date: new Date(date),
          isShared: !!isShared,
          propertyId: finalPropertyId !== undefined ? (finalPropertyId || null) : undefined,
          maintenanceRequestId:
            maintenanceRequestId !== undefined
              ? maintenanceRequestId || null
              : undefined,
          vendor: vendor?.trim() || null,
          receiptUrl: receiptUrl?.trim() || null,
          notes: notes?.trim() || null,
        },
      })

      if (allocationsData.length > 0) {
        await tx.expenseAllocation.createMany({
          data: allocationsData.map((a) => ({
            expenseId: id,
            unitId: a.unitId,
            percentage: a.percentage,
            amount: a.amount,
          })),
        })
      }

      return tx.expense.findUnique({
        where: { id },
        include: INCLUDE_EXPENSE_RELATIONS,
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update expense error:", error)
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

    const expense = await db.expense.findUnique({ where: { id } })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    await db.expense.delete({ where: { id } })

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
