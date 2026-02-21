import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExpenseCategory } from "@prisma/client"

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
      include: {
        property: true,
        maintenanceRequest: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    // Verify ownership - expenses have direct userId relationship
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

    // Verify ownership
    const expense = await db.expense.findUnique({
      where: { id },
    })

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

    // If propertyId is being changed, verify user owns the new property
    let finalPropertyId = propertyId
    if (propertyId && propertyId !== expense.propertyId) {
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

    // If maintenanceRequestId is being changed, verify user owns it and auto-set property
    if (maintenanceRequestId !== undefined && maintenanceRequestId !== expense.maintenanceRequestId) {
      if (maintenanceRequestId) {
        const maintenanceRequest = await db.maintenanceRequest.findFirst({
          where: {
            id: maintenanceRequestId,
            unit: {
              property: {
                userId: session.user.id,
              },
            },
          },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        })

        if (!maintenanceRequest) {
          return NextResponse.json(
            { message: "Maintenance request not found or access denied" },
            { status: 404 }
          )
        }

        // Auto-set propertyId from maintenance request if not already set
        if (!finalPropertyId && maintenanceRequest.unit.property.id) {
          finalPropertyId = maintenanceRequest.unit.property.id
        }
      }
    }

    // Update expense (cannot change userId)
    const updated = await db.expense.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: new Date(date),
        propertyId: finalPropertyId !== undefined ? (finalPropertyId || null) : undefined,
        maintenanceRequestId: maintenanceRequestId !== undefined ? (maintenanceRequestId || null) : undefined,
        vendor: vendor?.trim() || null,
        receiptUrl: receiptUrl?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        property: true,
        maintenanceRequest: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
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

    // Verify ownership
    const expense = await db.expense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Delete expense
    await db.expense.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
