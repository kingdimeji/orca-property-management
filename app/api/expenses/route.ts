import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExpenseCategory } from "@prisma/client"

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

    // If propertyId provided, verify user owns the property
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

    // Create expense
    const expense = await db.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: new Date(date),
        propertyId: propertyId || null,
        vendor: vendor?.trim() || null,
        receiptUrl: receiptUrl?.trim() || null,
        notes: notes?.trim() || null,
        userId: session.user.id,
      },
      include: {
        property: true,
      },
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
    const category = searchParams.get("category") as ExpenseCategory | null
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    if (category && Object.values(ExpenseCategory).includes(category)) {
      where.category = category
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    // Fetch expenses
    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        property: true,
      },
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
