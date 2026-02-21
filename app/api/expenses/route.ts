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

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
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
      allocations, // [{ unitId: string, percentage: number }]
    } = body

    // Validate required fields
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
      return NextResponse.json(
        { message: "Date is required" },
        { status: 400 }
      )
    }

    // If propertyId provided, verify user owns the property
    let finalPropertyId = propertyId
    if (propertyId) {
      const property = await db.property.findUnique({
        where: { id: propertyId },
      })

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

    // If maintenanceRequestId provided, verify user owns it and auto-set property
    if (maintenanceRequestId) {
      const maintenanceRequest = await db.maintenanceRequest.findFirst({
        where: {
          id: maintenanceRequestId,
          unit: {
            property: { userId: session.user.id },
          },
        },
        include: {
          unit: {
            include: { property: true },
          },
        },
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

    const parsedAmount = parseFloat(amount)

    // Build allocations data if isShared
    let allocationsData: { unitId: string; percentage: number; amount: number }[] = []

    if (isShared && finalPropertyId) {
      if (allocations && allocations.length > 0) {
        // Use provided allocations
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
        // Auto-generate equal split across all units in the property
        const units = await db.unit.findMany({
          where: { propertyId: finalPropertyId },
          select: { id: true },
        })
        if (units.length > 0) {
          const equalPct = parseFloat((100 / units.length).toFixed(2))
          allocationsData = units.map((unit, i) => ({
            unitId: unit.id,
            // Give any rounding remainder to the last unit
            percentage: i === units.length - 1 ? 100 - equalPct * (units.length - 1) : equalPct,
            amount: parseFloat(((parsedAmount * equalPct) / 100).toFixed(2)),
          }))
        }
      }
    }

    // Create expense + allocations in a single transaction
    const expense = await db.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          amount: parsedAmount,
          category,
          description: description.trim(),
          date: new Date(date),
          isShared: !!isShared,
          propertyId: finalPropertyId || null,
          maintenanceRequestId: maintenanceRequestId || null,
          vendor: vendor?.trim() || null,
          receiptUrl: receiptUrl?.trim() || null,
          notes: notes?.trim() || null,
          userId: session.user.id,
        },
      })

      if (allocationsData.length > 0) {
        await tx.expenseAllocation.createMany({
          data: allocationsData.map((a) => ({
            expenseId: created.id,
            unitId: a.unitId,
            percentage: a.percentage,
            amount: a.amount,
          })),
        })
      }

      return tx.expense.findUnique({
        where: { id: created.id },
        include: INCLUDE_EXPENSE_RELATIONS,
      })
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Create expense error:", error)
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
    const propertyId = searchParams.get("propertyId")
    const maintenanceRequestId = searchParams.get("maintenanceRequestId")
    const category = searchParams.get("category") as ExpenseCategory | null
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      userId: session.user.id,
    }

    if (propertyId) where.propertyId = propertyId
    if (maintenanceRequestId) where.maintenanceRequestId = maintenanceRequestId
    if (category && Object.values(ExpenseCategory).includes(category)) {
      where.category = category
    }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: INCLUDE_EXPENSE_RELATIONS,
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
